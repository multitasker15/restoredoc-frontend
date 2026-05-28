import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Users, BarChart2, Settings,
  Copy, Download, RefreshCw, Lock, LogOut, Eye, EyeOff, AlertTriangle,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import api, { BASE_URL } from '../lib/api'
import { clearToken, getToken } from '../lib/auth'

type Tab = 'overview' | 'checklists' | 'team' | 'analytics' | 'settings'

interface Stats {
  total_checklists?: number
  approved_claims?: number
  approval_rate?: number
  avg_payout?: number
  recent_activity?: Array<{ id: string; description: string; timestamp: string; user?: string }>
  team_link?: string
  pin?: string
  plan?: string
  team_slug?: string
  trial_days_left?: number | null
  subscription_status?: string
  checklists_this_month?: number
  checklist_limit?: number
}

interface Checklist {
  id: string
  job_type: string
  created_at: string
  status: string
  pdf_url?: string
}

interface SettingsData {
  company_name?: string
  name?: string
  email?: string
}

const DEMO_CHART_DATA = [
  { month: 'Jan', reports: 12, approved: 10 },
  { month: 'Feb', reports: 18, approved: 15 },
  { month: 'Mar', reports: 14, approved: 12 },
  { month: 'Apr', reports: 22, approved: 20 },
  { month: 'May', reports: 28, approved: 25 },
  { month: 'Jun', reports: 24, approved: 22 },
]

const DEMO_PAYOUT_DATA = [
  { month: 'Jan', payout: 8400 },
  { month: 'Feb', payout: 12300 },
  { month: 'Mar', payout: 9800 },
  { month: 'Apr', payout: 15600 },
  { month: 'May', payout: 19200 },
  { month: 'Jun', payout: 17800 },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<Stats>({})
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [settingsData, setSettingsData] = useState<SettingsData>({})
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedPin, setCopiedPin] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [pinSaving, setPinSaving] = useState(false)

  const isStarterOrAbove = ['starter', 'growth', 'pro', 'enterprise'].includes(
    (stats.plan || '').toLowerCase()
  )

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/dashboard/stats')
      setStats(res.data)
      setSettingsData({
        company_name: res.data.company_name,
        name: res.data.name,
        email: res.data.email,
      })
    } catch {
      // use defaults
    }
  }, [])

  const fetchChecklists = useCallback(async () => {
    try {
      const res = await api.get('/dashboard/checklists')
      setChecklists(res.data.checklists || res.data || [])
    } catch {
      setChecklists([])
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchStats(), fetchChecklists()]).finally(() => setLoading(false))
  }, [fetchStats, fetchChecklists])

  async function downloadXactimatePdf(checklistId: string) {
    try {
      const token = getToken()
      const res = await fetch(`${BASE_URL}/checklist/${checklistId}/xactimate-pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `xactimate-${checklistId.slice(0, 8)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silently fail
    }
  }

  function handleLogout() {
    clearToken()
    window.location.href = '/login'
  }

  function copyLink() {
    navigator.clipboard.writeText(stats.team_link || window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  function copyPin() {
    navigator.clipboard.writeText(stats.pin || '')
    setCopiedPin(true)
    setTimeout(() => setCopiedPin(false), 2000)
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    setSettingsSaving(true)
    try {
      await api.put('/dashboard/settings', settingsData)
      setSettingsSaved(true)
      setTimeout(() => setSettingsSaved(false), 2000)
    } catch {
      // silently fail
    } finally {
      setSettingsSaving(false)
    }
  }

  async function updatePin(e: React.FormEvent) {
    e.preventDefault()
    setPinSaving(true)
    try {
      await api.put('/dashboard/pin', { pin: newPin })
      setStats((prev) => ({ ...prev, pin: newPin }))
      setNewPin('')
    } catch {
      // silently fail
    } finally {
      setPinSaving(false)
    }
  }

  const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'checklists', label: 'Checklists', icon: FileText },
    { id: 'team', label: 'Team access', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-[#6b7280]">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-56 bg-[#1a2332] flex flex-col shrink-0 min-h-screen">
        <div className="px-5 py-5 border-b border-white/10">
          <Link to="/" className="text-white font-semibold text-sm tracking-tight">
            RestoreDocAI
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={15} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">

          {/* Trial expiry banner */}
          {stats.plan === 'trial' && stats.trial_days_left !== null && stats.trial_days_left !== undefined && (
            <div className="mb-6 flex items-center gap-3 border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertTriangle size={16} className="text-amber-500 shrink-0" />
              <span className="text-sm text-amber-800">
                {stats.trial_days_left > 0
                  ? `Your free trial ends in ${stats.trial_days_left} day${stats.trial_days_left === 1 ? '' : 's'}.`
                  : 'Your free trial has ended.'}
              </span>
              <Link
                to="/pricing"
                className="ml-auto text-xs font-medium text-amber-800 underline hover:no-underline shrink-0"
              >
                Upgrade now
              </Link>
            </div>
          )}

          {/* Overview */}
          {activeTab === 'overview' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-semibold text-[#111827] tracking-tight">Overview</h1>
                <button
                  onClick={() => { setLoading(true); fetchStats().finally(() => setLoading(false)) }}
                  className="flex items-center gap-2 text-xs text-[#6b7280] hover:text-[#111827] border border-[#e5e7eb] px-3 py-1.5"
                >
                  <RefreshCw size={12} />
                  Refresh
                </button>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total checklists', value: stats.total_checklists ?? '—' },
                  { label: 'Approved claims', value: stats.approved_claims ?? '—' },
                  { label: 'Approval rate', value: stats.approval_rate ? `${stats.approval_rate}%` : '—' },
                  { label: 'Avg payout', value: stats.avg_payout ? `$${stats.avg_payout.toLocaleString()}` : '—' },
                ].map((card) => (
                  <div key={card.label} className="border border-[#e5e7eb] p-5">
                    <div className="text-xs text-[#6b7280] mb-2">{card.label}</div>
                    <div className="text-2xl font-semibold text-[#111827]">{card.value}</div>
                  </div>
                ))}
              </div>

              {/* Recent activity */}
              <div>
                <h2 className="text-sm font-semibold text-[#111827] mb-3">Recent activity</h2>
                <div className="border border-[#e5e7eb]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                        <th className="text-left text-xs font-medium text-[#6b7280] px-4 py-2.5">Event</th>
                        <th className="text-left text-xs font-medium text-[#6b7280] px-4 py-2.5">User</th>
                        <th className="text-left text-xs font-medium text-[#6b7280] px-4 py-2.5">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats.recent_activity || []).length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-sm text-[#6b7280] text-center">
                            No recent activity.
                          </td>
                        </tr>
                      ) : (
                        (stats.recent_activity || []).slice(0, 10).map((event) => (
                          <tr key={event.id} className="border-b border-[#e5e7eb] last:border-0">
                            <td className="px-4 py-3 text-sm text-[#111827]">{event.description}</td>
                            <td className="px-4 py-3 text-sm text-[#6b7280]">{event.user || '—'}</td>
                            <td className="px-4 py-3 text-xs text-[#9ca3af]">
                              {event.timestamp ? new Date(event.timestamp).toLocaleString() : '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Checklists */}
          {activeTab === 'checklists' && (
            <div>
              <h1 className="text-xl font-semibold text-[#111827] tracking-tight mb-8">Checklists</h1>
              <div className="border border-[#e5e7eb]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                      <th className="text-left text-xs font-medium text-[#6b7280] px-4 py-2.5">Job type</th>
                      <th className="text-left text-xs font-medium text-[#6b7280] px-4 py-2.5">Created</th>
                      <th className="text-left text-xs font-medium text-[#6b7280] px-4 py-2.5">Status</th>
                      <th className="text-left text-xs font-medium text-[#6b7280] px-4 py-2.5">PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checklists.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-sm text-[#6b7280] text-center">
                          No checklists yet.
                        </td>
                      </tr>
                    ) : (
                      checklists.map((cl) => (
                        <tr key={cl.id} className="border-b border-[#e5e7eb] last:border-0">
                          <td className="px-4 py-3 text-sm text-[#111827] capitalize">{cl.job_type}</td>
                          <td className="px-4 py-3 text-sm text-[#6b7280]">
                            {cl.created_at ? new Date(cl.created_at).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex text-xs px-2 py-0.5 font-medium ${
                              cl.status === 'approved'
                                ? 'bg-green-50 text-green-700'
                                : cl.status === 'pending'
                                ? 'bg-yellow-50 text-yellow-700'
                                : 'bg-[#f3f4f6] text-[#6b7280]'
                            }`}>
                              {cl.status || 'draft'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => downloadXactimatePdf(cl.id)}
                              className="inline-flex items-center gap-1 text-xs text-[#2563eb] hover:underline"
                            >
                              <Download size={12} />
                              Xactimate PDF
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Team access */}
          {activeTab === 'team' && (
            <div>
              <h1 className="text-xl font-semibold text-[#111827] tracking-tight mb-8">Team access</h1>

              {/* Team link */}
              <div className="border border-[#e5e7eb] p-6 mb-6">
                <h2 className="text-sm font-semibold text-[#111827] mb-1">Field tech link</h2>
                <p className="text-xs text-[#6b7280] mb-4">
                  Share this link with your field techs. They will need the PIN to access.
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 border border-[#e5e7eb] px-3 py-2 text-sm text-[#374151] bg-[#f9fafb] truncate">
                    {stats.team_link || 'No team link configured'}
                  </div>
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-2 border border-[#e5e7eb] px-4 py-2 text-sm text-[#374151] hover:border-[#2563eb] hover:text-[#2563eb] transition-colors shrink-0"
                  >
                    <Copy size={14} />
                    {copiedLink ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* PIN management */}
              <div className="border border-[#e5e7eb] p-6">
                <h2 className="text-sm font-semibold text-[#111827] mb-1">PIN management</h2>
                <p className="text-xs text-[#6b7280] mb-4">Current PIN used by your field techs.</p>

                <div className="flex items-center gap-2 mb-6">
                  <div className="border border-[#e5e7eb] px-3 py-2 text-sm text-[#374151] bg-[#f9fafb] font-mono w-32 text-center tracking-widest">
                    {showPin ? (stats.pin || '——') : '••••••'}
                  </div>
                  <button
                    onClick={() => setShowPin(!showPin)}
                    className="p-2 border border-[#e5e7eb] text-[#6b7280] hover:text-[#111827] transition-colors"
                  >
                    {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={copyPin}
                    className="flex items-center gap-1.5 border border-[#e5e7eb] px-3 py-2 text-sm text-[#374151] hover:border-[#2563eb] hover:text-[#2563eb] transition-colors"
                  >
                    <Copy size={12} />
                    {copiedPin ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <form onSubmit={updatePin} className="flex gap-2">
                  <input
                    type="text"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="New PIN"
                    maxLength={8}
                    className="border border-[#e5e7eb] px-3 py-2 text-sm text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:border-[#2563eb] w-32 font-mono tracking-widest"
                  />
                  <button
                    type="submit"
                    disabled={pinSaving || !newPin}
                    className="bg-[#2563eb] text-white px-4 py-2 text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-60"
                  >
                    {pinSaving ? 'Updating...' : 'Update PIN'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <div>
              <h1 className="text-xl font-semibold text-[#111827] tracking-tight mb-8">Analytics</h1>

              {!isStarterOrAbove ? (
                <div className="border border-[#e5e7eb] p-12 text-center">
                  <Lock size={24} className="text-[#d1d5db] mx-auto mb-4" />
                  <h2 className="text-base font-semibold text-[#111827] mb-2">Analytics require Growth or above</h2>
                  <p className="text-sm text-[#6b7280] mb-6">
                    Upgrade your plan to unlock claim analytics, approval rates, and payout tracking.
                  </p>
                  <Link
                    to="/pricing"
                    className="inline-block bg-[#2563eb] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
                  >
                    View plans
                  </Link>
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-sm font-semibold text-[#111827] mb-4">Reports vs approvals (last 6 months)</h2>
                    <div className="border border-[#e5e7eb] p-4">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={DEMO_CHART_DATA} barGap={2}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 0, fontSize: 12 }}
                          />
                          <Bar dataKey="reports" name="Reports" fill="#e5e7eb" />
                          <Bar dataKey="approved" name="Approved" fill="#2563eb" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-[#111827] mb-4">Average payout ($)</h2>
                    <div className="border border-[#e5e7eb] p-4">
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={DEMO_PAYOUT_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                          <YAxis
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 0, fontSize: 12 }}
                            formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Avg payout']}
                          />
                          <Line
                            type="monotone"
                            dataKey="payout"
                            stroke="#2563eb"
                            strokeWidth={2}
                            dot={{ fill: '#2563eb', r: 3 }}
                            activeDot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div>
              <h1 className="text-xl font-semibold text-[#111827] tracking-tight mb-8">Settings</h1>

              <div className="border border-[#e5e7eb] p-6 max-w-lg">
                <h2 className="text-sm font-semibold text-[#111827] mb-4">Account details</h2>
                <form onSubmit={saveSettings} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1.5">Company name</label>
                    <input
                      type="text"
                      value={settingsData.company_name || ''}
                      onChange={(e) => setSettingsData((p) => ({ ...p, company_name: e.target.value }))}
                      className="w-full border border-[#e5e7eb] px-3 py-2 text-sm text-[#111827] focus:outline-none focus:border-[#2563eb]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1.5">Your name</label>
                    <input
                      type="text"
                      value={settingsData.name || ''}
                      onChange={(e) => setSettingsData((p) => ({ ...p, name: e.target.value }))}
                      className="w-full border border-[#e5e7eb] px-3 py-2 text-sm text-[#111827] focus:outline-none focus:border-[#2563eb]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1.5">Email</label>
                    <input
                      type="email"
                      value={settingsData.email || ''}
                      onChange={(e) => setSettingsData((p) => ({ ...p, email: e.target.value }))}
                      className="w-full border border-[#e5e7eb] px-3 py-2 text-sm text-[#111827] focus:outline-none focus:border-[#2563eb]"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={settingsSaving}
                      className="bg-[#2563eb] text-white px-5 py-2 text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-60"
                    >
                      {settingsSaving ? 'Saving...' : 'Save changes'}
                    </button>
                    {settingsSaved && (
                      <span className="text-sm text-green-600">Saved.</span>
                    )}
                  </div>
                </form>
              </div>

              <div className="border border-[#e5e7eb] p-6 max-w-lg mt-6">
                <h2 className="text-sm font-semibold text-[#111827] mb-1">Plan</h2>
                <p className="text-sm text-[#6b7280] mb-4">
                  Current plan: <span className="capitalize font-medium text-[#111827]">{stats.plan || 'Individual'}</span>
                </p>
                <Link
                  to="/pricing"
                  className="inline-block border border-[#e5e7eb] text-[#374151] px-4 py-2 text-sm font-medium hover:border-[#2563eb] hover:text-[#2563eb] transition-colors"
                >
                  View plans
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
