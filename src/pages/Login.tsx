import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { setToken } from '../lib/auth'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      })
      setToken(res.data.token || res.data.access_token)
      navigate('/dashboard')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message || 'Invalid email or password.')
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
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-[#111827] tracking-tight mb-1">Sign in</h1>
            <p className="text-sm text-[#6b7280]">Welcome back.</p>
          </div>

          {error && (
            <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Email</label>
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
                placeholder="Your password"
                className="w-full border border-[#e5e7eb] px-3 py-2 text-sm text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563eb] text-white py-2.5 text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6b7280]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#2563eb] hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
