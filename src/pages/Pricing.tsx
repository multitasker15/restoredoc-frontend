import { Link } from 'react-router-dom'
import { Check, Minus } from 'lucide-react'

const PLANS = [
  {
    name: 'Individual',
    price: '$47',
    period: '/mo',
    tagline: 'Solo tech or estimator',
    highlight: false,
    features: {
      reports: '30 reports/mo',
      users: '1 user',
      photoAI: true,
      pdfExport: true,
      analytics: false,
      teamLinks: false,
      apiAccess: false,
      priority: false,
      whitelabel: false,
      dedicated: false,
    },
  },
  {
    name: 'Starter',
    price: '$147',
    period: '/mo',
    tagline: 'Small crews, up to 3 users',
    highlight: false,
    features: {
      reports: '100 reports/mo',
      users: '3 users',
      photoAI: true,
      pdfExport: true,
      analytics: false,
      teamLinks: true,
      apiAccess: false,
      priority: false,
      whitelabel: false,
      dedicated: false,
    },
  },
  {
    name: 'Growth',
    price: '$297',
    period: '/mo',
    tagline: 'Growing teams, most popular',
    highlight: true,
    features: {
      reports: '500 reports/mo',
      users: '10 users',
      photoAI: true,
      pdfExport: true,
      analytics: true,
      teamLinks: true,
      apiAccess: false,
      priority: true,
      whitelabel: false,
      dedicated: false,
    },
  },
  {
    name: 'Pro',
    price: '$597',
    period: '/mo',
    tagline: 'Large restoration companies',
    highlight: false,
    features: {
      reports: 'Unlimited',
      users: '25 users',
      photoAI: true,
      pdfExport: true,
      analytics: true,
      teamLinks: true,
      apiAccess: true,
      priority: true,
      whitelabel: true,
      dedicated: false,
    },
  },
  {
    name: 'Enterprise',
    price: '$1,200',
    period: '/mo',
    tagline: 'Multi-location franchises',
    highlight: false,
    features: {
      reports: 'Unlimited',
      users: 'Unlimited',
      photoAI: true,
      pdfExport: true,
      analytics: true,
      teamLinks: true,
      apiAccess: true,
      priority: true,
      whitelabel: true,
      dedicated: true,
    },
  },
]

const FEATURE_ROWS: { key: keyof (typeof PLANS)[0]['features']; label: string }[] = [
  { key: 'reports', label: 'Monthly reports' },
  { key: 'users', label: 'Team members' },
  { key: 'photoAI', label: 'Photo AI identification' },
  { key: 'pdfExport', label: 'PDF export' },
  { key: 'teamLinks', label: 'PIN-protected team links' },
  { key: 'analytics', label: 'Claim analytics' },
  { key: 'apiAccess', label: 'API access' },
  { key: 'priority', label: 'Priority support' },
  { key: 'whitelabel', label: 'White-label reports' },
  { key: 'dedicated', label: 'Dedicated account manager' },
]

function FeatureCell({ value }: { value: string | boolean }) {
  if (typeof value === 'string') {
    return <span className="text-sm text-[#111827]">{value}</span>
  }
  return value ? (
    <Check size={16} className="text-[#2563eb] mx-auto" />
  ) : (
    <Minus size={16} className="text-[#d1d5db] mx-auto" />
  )
}

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="text-[#111827] font-semibold text-lg tracking-tight">
            RestoreDocAI
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-[#6b7280] hover:text-[#111827]">Sign in</Link>
            <Link to="/signup" className="text-sm bg-[#2563eb] text-white px-4 py-2 font-medium hover:bg-[#1d4ed8] transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-semibold text-[#111827] tracking-tight mb-3">
            Simple, transparent pricing
          </h1>
          <p className="text-[#6b7280]">No setup fees. No per-report charges. Cancel any time.</p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`border p-6 flex flex-col ${
                plan.highlight ? 'border-[#2563eb]' : 'border-[#e5e7eb]'
              }`}
            >
              {plan.highlight && (
                <div className="text-xs font-medium text-[#2563eb] uppercase tracking-wider mb-3">
                  Most popular
                </div>
              )}
              <div className="text-sm font-semibold text-[#111827] mb-1">{plan.name}</div>
              <div className="text-xs text-[#6b7280] mb-4">{plan.tagline}</div>
              <div className="text-3xl font-semibold text-[#111827] mb-1">
                {plan.price}
                <span className="text-sm font-normal text-[#6b7280]">{plan.period}</span>
              </div>
              <div className="mt-auto pt-6">
                <Link
                  to={`/signup?plan=${plan.name.toLowerCase()}`}
                  className={`block text-center text-sm py-2 font-medium transition-colors ${
                    plan.highlight
                      ? 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
                      : 'border border-[#e5e7eb] text-[#111827] hover:border-[#2563eb] hover:text-[#2563eb]'
                  }`}
                >
                  Get started
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div>
          <h2 className="text-xl font-semibold text-[#111827] mb-6 tracking-tight">Feature comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#e5e7eb]">
                  <th className="text-left text-xs font-medium text-[#6b7280] py-3 pr-4 w-48">Feature</th>
                  {PLANS.map((p) => (
                    <th
                      key={p.name}
                      className={`text-center text-xs font-medium py-3 px-4 ${
                        p.highlight ? 'text-[#2563eb]' : 'text-[#6b7280]'
                      }`}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_ROWS.map((row) => (
                  <tr key={row.key} className="border-b border-[#e5e7eb]">
                    <td className="text-sm text-[#374151] py-3 pr-4">{row.label}</td>
                    {PLANS.map((p) => (
                      <td key={p.name} className="text-center py-3 px-4">
                        <FeatureCell value={p.features[row.key]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ note */}
        <div className="mt-16 border-t border-[#e5e7eb] pt-12 text-center">
          <p className="text-sm text-[#6b7280]">
            All plans include a 14-day free trial. Enterprise plans include a custom onboarding session.{' '}
            <Link to="/signup" className="text-[#2563eb] hover:underline">
              Start free today.
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
