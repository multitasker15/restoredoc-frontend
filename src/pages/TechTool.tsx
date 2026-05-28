import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Upload, Copy, Download, CheckSquare, Square, ChevronDown, X } from 'lucide-react'
import { BASE_URL } from '../lib/api'
import { getToken } from '../lib/auth'

type Stage = 'pin' | 'configure' | 'result'

const JOB_TYPES = ['water', 'fire', 'mold', 'storm', 'biohazard']

const WATER_CATEGORIES = [
  { value: '1', label: 'Category 1 — Clean water' },
  { value: '2', label: 'Category 2 — Grey water' },
  { value: '3', label: 'Category 3 — Black water' },
]

const WATER_CLASSES = [
  { value: '1', label: 'Class 1 — Minimal absorption' },
  { value: '2', label: 'Class 2 — Significant absorption' },
  { value: '3', label: 'Class 3 — Greatest absorption' },
  { value: '4', label: 'Class 4 — Specialty drying' },
]

const DEMO_ITEMS = [
  'Document affected area with photos before any extraction',
  'Record moisture readings at all affected surfaces',
  'Note water category and class in job file',
  'Extract standing water and document extraction volume',
  'Place air movers at affected walls and flooring',
  'Set dehumidifiers per IICRC S500 drying ratios',
  'Log equipment placement with serial numbers',
  'Record ambient temperature and humidity readings',
  'Photograph all equipment placement',
  'Schedule follow-up moisture check within 24 hours',
]

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  category?: string
}

function parseChecklistText(text: string): ChecklistItem[] {
  const lines = text.split('\n')
  const items: ChecklistItem[] = []
  let currentCategory = ''

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Detect section headers (ALL CAPS or ends with colon)
    if (/^[A-Z][A-Z\s&\/—\-–:]+$/.test(trimmed) && trimmed.length > 3 && !trimmed.startsWith('[')) {
      currentCategory = trimmed.replace(/:$/, '')
      continue
    }

    // Parse [ ] checklist items
    const match = trimmed.match(/^\[\s*\]\s*(.+)/)
    if (match) {
      items.push({
        id: String(items.length),
        text: match[1].trim(),
        completed: false,
        category: currentCategory || undefined,
      })
    }
  }

  return items.length > 0 ? items : DEMO_ITEMS.map((text, i) => ({ id: String(i), text, completed: false }))
}

export default function TechTool() {
  const { teamSlug } = useParams<{ teamSlug: string }>()
  const [stage, setStage] = useState<Stage>('pin')

  // PIN stage
  const [techName, setTechName] = useState('')
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [teamName, setTeamName] = useState('')

  // Configure stage
  const [jobType, setJobType] = useState('water')
  const [waterCategory, setWaterCategory] = useState('1')
  const [waterClass, setWaterClass] = useState('1')
  const [photos, setPhotos] = useState<File[]>([])
  const [identification, setIdentification] = useState('')
  const [generating, setGenerating] = useState(false)
  const [identifyLoading, setIdentifyLoading] = useState(false)
  const [streamText, setStreamText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Result stage
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [copied, setCopied] = useState(false)

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPinError('')
    if (!techName.trim()) {
      setPinError('Please enter your name.')
      return
    }
    setPinLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/team/${teamSlug}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, name: techName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPinError(data.error || 'Invalid PIN. Please try again.')
        return
      }
      setTeamName(data.companyName || teamSlug || '')
      setStage('configure')
    } catch {
      setPinError('Connection error. Please try again.')
    } finally {
      setPinLoading(false)
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    // Only send the first selected file for identification
    const file = files[0]
    setPhotos((prev) => [...prev, ...files])
    setIdentifyLoading(true)

    try {
      const fd = new FormData()
      fd.append('photo', file)
      fd.append('job_type', jobType)

      const res = await fetch(`${BASE_URL}/checklist/identify/${teamSlug}`, {
        method: 'POST',
        body: fd,
      })
      if (res.ok) {
        const data = await res.json()
        const text: string = data.identification || ''
        if (text) setIdentification((prev) => prev ? `${prev}\n${text}` : text)
      }
    } catch {
      // silently continue — photos still shown locally
    } finally {
      setIdentifyLoading(false)
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleGenerate() {
    setGenerating(true)
    setStreamText('')

    try {
      const token = getToken()
      const response = await fetch(`${BASE_URL}/checklist/generate/${teamSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          jobType,
          waterCategory: jobType === 'water' ? waterCategory : undefined,
          waterClass: jobType === 'water' ? waterClass : undefined,
          aiIdentification: identification || undefined,
          techName: techName || 'Field Tech',
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error('Generation failed')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const payload = JSON.parse(line.slice(6))
            if (payload.chunk) {
              fullText += payload.chunk
              setStreamText(fullText)
            }
            if (payload.done) {
              const text = payload.checklist || fullText
              setChecklist(parseChecklistText(text))
              setStage('result')
            }
            if (payload.error) throw new Error(payload.error)
          } catch {
            // skip malformed events
          }
        }
      }

      // If we got here without hitting done event, parse what we have
      if (fullText && stage !== 'result') {
        setChecklist(parseChecklistText(fullText))
        setStage('result')
      }
    } catch {
      setChecklist(DEMO_ITEMS.map((text, i) => ({ id: String(i), text, completed: false })))
      setStage('result')
    } finally {
      setGenerating(false)
    }
  }

  function toggleItem(id: string) {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    )
  }

  const completed = checklist.filter((i) => i.completed).length
  const progress = checklist.length ? Math.round((completed / checklist.length) * 100) : 0

  function handleCopy() {
    const text = checklist.map((i) => `[${i.completed ? 'x' : ' '}] ${i.text}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const lines = [
      `RestoreDocAI Checklist`,
      `Company: ${teamName}`,
      `Technician: ${techName}`,
      `Job type: ${jobType}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      ...checklist.map((i) => `[${i.completed ? 'x' : ' '}] ${i.text}`),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `checklist-${teamSlug}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // PIN stage
  if (stage === 'pin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="text-[#111827] font-semibold text-lg mb-1">RestoreDocAI</div>
            <h1 className="text-xl font-semibold text-[#111827] tracking-tight mt-4">Field access</h1>
            <p className="text-sm text-[#6b7280] mt-1">Enter your name and team PIN to continue.</p>
          </div>

          {pinError && (
            <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {pinError}
            </div>
          )}

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Your name</label>
              <input
                type="text"
                value={techName}
                onChange={(e) => setTechName(e.target.value)}
                required
                maxLength={100}
                placeholder="John Smith"
                className="w-full border border-[#e5e7eb] px-3 py-2 text-sm text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:border-[#2563eb]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Team PIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                maxLength={8}
                placeholder="Enter PIN"
                className="w-full border border-[#e5e7eb] px-3 py-2 text-sm text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:border-[#2563eb] text-center tracking-widest text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={pinLoading}
              className="w-full bg-[#2563eb] text-white py-2.5 text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-60"
            >
              {pinLoading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Configure stage
  if (stage === 'configure') {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-[#e5e7eb]">
          <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="text-sm font-semibold text-[#111827]">RestoreDocAI</div>
            {teamName && <div className="text-xs text-[#6b7280]">{teamName}</div>}
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-6 py-10">
          <h1 className="text-xl font-semibold text-[#111827] mb-6 tracking-tight">New checklist</h1>

          {/* Job type */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-[#374151] mb-2">Job type</label>
            <div className="flex gap-2 flex-wrap">
              {JOB_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setJobType(type)}
                  className={`px-4 py-2 text-sm font-medium border transition-colors capitalize ${
                    jobType === type
                      ? 'bg-[#2563eb] text-white border-[#2563eb]'
                      : 'border-[#e5e7eb] text-[#374151] hover:border-[#2563eb] hover:text-[#2563eb]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Water-specific fields */}
          {jobType === 'water' && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Water category</label>
                <div className="relative">
                  <select
                    value={waterCategory}
                    onChange={(e) => setWaterCategory(e.target.value)}
                    className="w-full border border-[#e5e7eb] px-3 py-2 text-sm text-[#111827] appearance-none focus:outline-none focus:border-[#2563eb] bg-white pr-8"
                  >
                    {WATER_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Water class</label>
                <div className="relative">
                  <select
                    value={waterClass}
                    onChange={(e) => setWaterClass(e.target.value)}
                    className="w-full border border-[#e5e7eb] px-3 py-2 text-sm text-[#111827] appearance-none focus:outline-none focus:border-[#2563eb] bg-white pr-8"
                  >
                    {WATER_CLASSES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* Photo upload */}
          <div className="mb-8">
            <label className="block text-xs font-medium text-[#374151] mb-2">Site photos (optional)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border border-dashed border-[#e5e7eb] p-8 text-center cursor-pointer hover:border-[#2563eb] transition-colors"
            >
              <Upload size={20} className="text-[#9ca3af] mx-auto mb-2" />
              <p className="text-sm text-[#6b7280]">Click to upload site photos</p>
              <p className="text-xs text-[#9ca3af] mt-1">JPG, PNG — AI will identify damage materials</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            {photos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {photos.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 border border-[#e5e7eb] px-3 py-1.5 text-xs text-[#374151]">
                    {f.name}
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="text-[#9ca3af] hover:text-[#374151]"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {identifyLoading && (
              <p className="text-xs text-[#6b7280] mt-2">Analyzing photo...</p>
            )}

            {identification && (
              <div className="mt-3 border border-[#e5e7eb] px-4 py-3 bg-[#f9fafb]">
                <p className="text-xs font-medium text-[#374151] mb-1">AI analysis</p>
                <p className="text-xs text-[#6b7280] leading-relaxed">{identification}</p>
              </div>
            )}
          </div>

          {/* Generating state: show streaming text */}
          {generating && streamText && (
            <div className="mb-6 border border-[#e5e7eb] p-4 bg-[#f9fafb] max-h-48 overflow-y-auto">
              <p className="text-xs font-medium text-[#374151] mb-2">Generating checklist...</p>
              <pre className="text-xs text-[#6b7280] whitespace-pre-wrap font-mono">{streamText}</pre>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-[#2563eb] text-white py-3 text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-60"
          >
            {generating ? 'Generating checklist...' : 'Generate checklist'}
          </button>
        </div>
      </div>
    )
  }

  // Result stage
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#e5e7eb]">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="text-sm font-semibold text-[#111827]">RestoreDocAI</div>
          <button
            onClick={() => { setStage('configure'); setChecklist([]); setStreamText('') }}
            className="text-xs text-[#6b7280] hover:text-[#111827]"
          >
            New checklist
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold text-[#111827] tracking-tight capitalize">{jobType} job checklist</h1>
            <span className="text-sm text-[#6b7280]">{completed}/{checklist.length} complete</span>
          </div>
          <div className="w-full bg-[#f3f4f6] h-1.5">
            <div
              className="bg-[#2563eb] h-1.5 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Checklist items grouped by category */}
        <div className="space-y-1 mb-8">
          {checklist.reduce<{ category: string | undefined; items: ChecklistItem[] }[]>((groups, item) => {
            const last = groups[groups.length - 1]
            if (last && last.category === item.category) {
              last.items.push(item)
            } else {
              groups.push({ category: item.category, items: [item] })
            }
            return groups
          }, []).map((group, gi) => (
            <div key={gi}>
              {group.category && (
                <div className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide px-4 py-2 mt-4 first:mt-0">
                  {group.category}
                </div>
              )}
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className="w-full flex items-start gap-3 p-4 border border-[#e5e7eb] text-left hover:bg-[#f9fafb] transition-colors mb-1"
                >
                  {item.completed ? (
                    <CheckSquare size={18} className="text-[#2563eb] mt-0.5 shrink-0" />
                  ) : (
                    <Square size={18} className="text-[#d1d5db] mt-0.5 shrink-0" />
                  )}
                  <span className={`text-sm ${item.completed ? 'line-through text-[#9ca3af]' : 'text-[#111827]'}`}>
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#374151] hover:border-[#2563eb] hover:text-[#2563eb] transition-colors"
          >
            <Copy size={14} />
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#374151] hover:border-[#2563eb] hover:text-[#2563eb] transition-colors"
          >
            <Download size={14} />
            Download
          </button>
          {progress === 100 && (
            <span className="ml-auto flex items-center text-sm text-[#2563eb] font-medium">
              All items complete
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
