import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Upload, Copy, Download, CheckSquare, Square, ChevronDown } from 'lucide-react'
import api from '../lib/api'

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

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  category?: string
}

export default function TechTool() {
  const { teamSlug } = useParams<{ teamSlug: string }>()
  const [stage, setStage] = useState<Stage>('pin')

  // PIN state
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [teamName, setTeamName] = useState('')

  // Configure state
  const [jobType, setJobType] = useState('water')
  const [waterCategory, setWaterCategory] = useState('1')
  const [waterClass, setWaterClass] = useState('1')
  const [photos, setPhotos] = useState<File[]>([])
  const [photoLabels, setPhotoLabels] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [identifyLoading, setIdentifyLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Result state
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [copied, setCopied] = useState(false)

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPinError('')
    setPinLoading(true)
    try {
      const res = await api.post(`/team/${teamSlug}/verify-pin`, { pin })
      setTeamName(res.data.team_name || res.data.teamName || teamSlug)
      setStage('configure')
    } catch {
      setPinError('Invalid PIN. Please try again.')
    } finally {
      setPinLoading(false)
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setPhotos((prev) => [...prev, ...files])
    setIdentifyLoading(true)
    try {
      const fd = new FormData()
      files.forEach((f) => fd.append('photos', f))
      fd.append('job_type', jobType)
      const res = await api.post(`/checklist/identify/${teamSlug}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const labels: string[] = res.data.labels || res.data.identified_materials || []
      setPhotoLabels((prev) => [...prev, ...labels])
    } catch {
      // silently continue — photos still added locally
    } finally {
      setIdentifyLoading(false)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await api.post(`/checklist/generate/${teamSlug}`, {
        job_type: jobType,
        water_category: jobType === 'water' ? waterCategory : undefined,
        water_class: jobType === 'water' ? waterClass : undefined,
        photo_labels: photoLabels,
      })
      const items: string[] = res.data.checklist || res.data.items || []
      setChecklist(
        items.map((text, i) => ({
          id: String(i),
          text,
          completed: false,
          category: res.data.categories?.[i] || undefined,
        }))
      )
      setStage('result')
    } catch {
      // fallback demo checklist
      setChecklist(
        [
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
        ].map((text, i) => ({ id: String(i), text, completed: false }))
      )
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
      `Team: ${teamName}`,
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
            <p className="text-sm text-[#6b7280] mt-1">Enter your team PIN to continue.</p>
          </div>

          {pinError && (
            <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {pinError}
            </div>
          )}

          <form onSubmit={handlePinSubmit} className="space-y-4">
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
            <label className="block text-xs font-medium text-[#374151] mb-2">Site photos</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border border-dashed border-[#e5e7eb] p-8 text-center cursor-pointer hover:border-[#2563eb] transition-colors"
            >
              <Upload size={20} className="text-[#9ca3af] mx-auto mb-2" />
              <p className="text-sm text-[#6b7280]">Click to upload site photos</p>
              <p className="text-xs text-[#9ca3af] mt-1">JPG, PNG — AI will identify materials</p>
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
                  <div key={i} className="border border-[#e5e7eb] px-3 py-1.5 text-xs text-[#374151]">
                    {f.name}
                  </div>
                ))}
              </div>
            )}

            {identifyLoading && (
              <p className="text-xs text-[#6b7280] mt-2">Analyzing photos...</p>
            )}

            {photoLabels.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-[#374151] mb-1.5">Identified materials</p>
                <div className="flex flex-wrap gap-1.5">
                  {photoLabels.map((label, i) => (
                    <span key={i} className="border border-[#e5e7eb] px-2 py-1 text-xs text-[#374151] bg-[#f9fafb]">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

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
            onClick={() => { setStage('configure'); setChecklist([]) }}
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

        {/* Checklist items */}
        <div className="space-y-2 mb-8">
          {checklist.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-start gap-3 p-4 border border-[#e5e7eb] text-left hover:bg-[#f9fafb] transition-colors"
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
