import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { setToken, setTeamSlug } from '../lib/auth'

const PLANS = ['Individual', 'Starter', 'Growth']

export default function Signup() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    companyName: '',
    name: '',
    email: '',
    password: '',
    plan: searchParams.get('plan') || 'individual',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/signup', {
        companyName: form.companyName,
        email: form.email,
        password: form.password,
      })
      setToken(res.data.token || res.data.access_token)
      if (res.data.company?.teamSlug) setTeamSlug(res.data.company.teamSlug)
      navigate('/dashboard')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-[#e5e7eb] px-6 h-16 flex items-center">
        <Link to="/" className="text-[#111827] font-semibold text-lg tracking-tight">
          RestoreDocAI
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-[#111827] tracking-tight mb-1">Create your account</h1>
            <p className="text-sm text-[#6b7280]">14-day free trial. No credit card required.</p>
          </div>

          {error && (
            <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Company name</label>
              <input
                name="companyName"
                type="text"
                required
                value={form.companyName}
                onChange={handleChange}
                placeholder="Acme Restoration"
                className="w-full border border-[#e5e7eb] px-3 py-2 text-sm text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:border-[#2563eb]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Your name</label>
              <input
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="John Smith"
                className="w-full border border-[#e5e7eb] px-3 py-2 text-sm text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:border-[#2563eb]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Work email</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="john@acmerestoration.com"
                className="w-full border border-[#e5e7eb] px-3 py-2 text-sm text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:border-[#2563eb]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                className="w-full border border-[#e5e7eb] px-3 py-2 text-sm text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:border-[#2563eb]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Plan</label>
              <select
                name="plan"
                value={form.plan}
                onChange={handleChange}
                className="w-full border border-[#e5e7eb] px-3 py-2 text-sm text-[#111827] focus:outline-none focus:border-[#2563eb] bg-white"
              >
                {PLANS.map((p) => (
                  <option key={p} value={p.toLowerCase()}>
                    {p} — {p === 'Individual' ? '$47' : p === 'Starter' ? '$147' : '$297'}/mo
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563eb] text-white py-2.5 text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6b7280]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2563eb] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
