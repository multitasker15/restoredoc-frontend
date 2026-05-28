import { Link } from 'react-router-dom'
import { FileText, Shield, Zap, ArrowRight, BarChart2, Clock, Users } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Product', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
]

const PROOF_LOGOS = ['ServPro', 'PuroClean', 'Rainbow Restoration', 'Paul Davis', 'Belfor', 'Steamatic']

const HOW_IT_WORKS = [
  { step: '01', title: 'Enter job details', body: 'Select job type, water category and class, and upload site photos from your mobile device or desktop.' },
  { step: '02', title: 'AI analyzes your data', body: 'RestoreDocAI cross-references IICRC standards, carrier requirements, and your photos to build a documentation package.' },
  { step: '03', title: 'Generate and export', body: 'Download carrier-ready PDF reports with photo documentation, readings, and scope narratives in under 60 seconds.' },
]

const FEATURES = [
  { icon: FileText, title: 'Carrier-ready reports', body: 'Every report is formatted to meet the documentation standards of the top 20 property carriers.' },
  { icon: Shield, title: 'IICRC compliant', body: 'Water categories, moisture classes, and drying protocols automatically referenced from current IICRC S500 standards.' },
  { icon: Zap, title: 'Photo AI identification', body: 'Upload site photos and our AI labels affected materials, moisture readings, and damage extent automatically.' },
  { icon: BarChart2, title: 'Claim analytics', body: 'Track approval rates, average payout, and supplemental success across your entire team portfolio.' },
  { icon: Clock, title: 'Same-day documentation', body: 'Complete a full scope document from site photos in under two minutes. No more end-of-day report backlogs.' },
  { icon: Users, title: 'Team access control', body: 'Share a PIN-protected link with field techs. No accounts needed for crew members.' },
]

const TESTIMONIALS = [
  {
    quote: 'We cut supplement rejections by 70% in the first month. The carrier adjuster literally called us to say our documentation was the cleanest they had seen.',
    author: 'Marcus T.',
    role: 'Owner, Gulf Coast Restoration',
  },
  {
    quote: 'My techs complete documentation on-site now instead of calling me at 9pm. Game changer for operations.',
    author: 'Sarah K.',
    role: 'Operations Director, Premier Property Services',
  },
  {
    quote: 'The IICRC references alone are worth the subscription. Our average claim payout went up 22% year over year.',
    author: 'David R.',
    role: 'Estimator, Rapid Response Restoration',
  },
]

const PRICING_PREVIEW = [
  { name: 'Individual', price: '$47', period: '/mo', highlight: false },
  { name: 'Growth', price: '$297', period: '/mo', highlight: true },
  { name: 'Pro', price: '$597', period: '/mo', highlight: false },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-[#e5e7eb] sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="text-[#111827] font-semibold text-lg tracking-tight">
            RestoreDocAI
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) =>
              l.href.startsWith('/') ? (
                <Link key={l.label} to={l.href} className="text-sm text-[#6b7280] hover:text-[#111827] transition-colors">
                  {l.label}
                </Link>
              ) : (
                <a key={l.label} href={l.href} className="text-sm text-[#6b7280] hover:text-[#111827] transition-colors">
                  {l.label}
                </a>
              )
            )}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-[#6b7280] hover:text-[#111827] transition-colors">
              Sign in
            </Link>
            <Link
              to="/signup"
              className="text-sm bg-[#2563eb] text-white px-4 py-2 font-medium hover:bg-[#1d4ed8] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 border border-[#e5e7eb] px-3 py-1 text-xs text-[#6b7280] mb-8">
          <span className="w-1.5 h-1.5 bg-[#2563eb] rounded-full"></span>
          Trusted by 800+ restoration contractors
        </div>
        <h1 className="text-5xl md:text-6xl font-semibold text-[#111827] tracking-tight leading-tight max-w-3xl mx-auto">
          Documentation That Gets Claims Approved
        </h1>
        <p className="mt-6 text-xl text-[#6b7280] max-w-2xl mx-auto leading-relaxed">
          RestoreDocAI generates carrier-ready damage documentation from your site photos and job data in under two minutes. Built for water, fire, mold, and storm restoration.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-[#2563eb] text-white px-6 py-3 text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
          >
            Start free trial
            <ArrowRight size={16} />
          </Link>
          <a href="#how-it-works" className="text-sm text-[#6b7280] hover:text-[#111827] underline underline-offset-4 transition-colors">
            See how it works
          </a>
        </div>
      </section>

      {/* Proof bar */}
      <section className="border-y border-[#e5e7eb] bg-[#f9fafb] py-6">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs text-[#6b7280] text-center mb-4 uppercase tracking-wider font-medium">Used by teams at</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {PROOF_LOGOS.map((name) => (
              <span key={name} className="text-sm font-medium text-[#9ca3af]">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-[#111827] tracking-tight">Three steps to an approved claim</h2>
          <p className="mt-3 text-[#6b7280]">From site to submission in minutes, not hours.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step}>
              <div className="text-4xl font-semibold text-[#e5e7eb] mb-4">{item.step}</div>
              <h3 className="text-lg font-semibold text-[#111827] mb-2">{item.title}</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-[#f9fafb] border-y border-[#e5e7eb] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-[#111827] tracking-tight">Everything your documentation needs</h2>
            <p className="mt-3 text-[#6b7280]">Purpose-built for restoration contractors who need claims approved faster.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white border border-[#e5e7eb] p-6">
                <f.icon size={20} className="text-[#2563eb] mb-4" />
                <h3 className="text-sm font-semibold text-[#111827] mb-2">{f.title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-[#111827] tracking-tight">Contractors trust RestoreDocAI</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div key={t.author} className="border border-[#e5e7eb] p-6">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-[#2563eb]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-[#374151] leading-relaxed mb-6">"{t.quote}"</p>
              <div>
                <p className="text-sm font-semibold text-[#111827]">{t.author}</p>
                <p className="text-xs text-[#6b7280]">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="bg-[#f9fafb] border-y border-[#e5e7eb] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-[#111827] tracking-tight">Simple, transparent pricing</h2>
            <p className="mt-3 text-[#6b7280]">No setup fees. No per-report costs. Cancel any time.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
            {PRICING_PREVIEW.map((p) => (
              <div
                key={p.name}
                className={`border p-6 text-center ${
                  p.highlight ? 'border-[#2563eb] bg-white' : 'border-[#e5e7eb] bg-white'
                }`}
              >
                {p.highlight && (
                  <div className="text-xs font-medium text-[#2563eb] uppercase tracking-wider mb-3">Most popular</div>
                )}
                <div className="text-sm font-medium text-[#6b7280] mb-1">{p.name}</div>
                <div className="text-3xl font-semibold text-[#111827]">
                  {p.price}
                  <span className="text-base font-normal text-[#6b7280]">{p.period}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/pricing" className="text-sm text-[#2563eb] hover:text-[#1d4ed8] underline underline-offset-4">
              View all plans and features
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-semibold text-[#111827] tracking-tight mb-4">
          Start getting claims approved faster
        </h2>
        <p className="text-[#6b7280] mb-8">14-day free trial. No credit card required.</p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-[#2563eb] text-white px-6 py-3 text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
          >
            Start free trial
            <ArrowRight size={16} />
          </Link>
          <Link to="/pricing" className="text-sm text-[#6b7280] hover:text-[#111827] underline underline-offset-4">
            Compare plans
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5e7eb] py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <div className="text-sm font-semibold text-[#111827] mb-2">RestoreDocAI</div>
            <p className="text-xs text-[#6b7280] max-w-xs">
              AI-powered documentation for property restoration contractors.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-2">
            <a href="#features" className="text-xs text-[#6b7280] hover:text-[#111827]">Features</a>
            <Link to="/pricing" className="text-xs text-[#6b7280] hover:text-[#111827]">Pricing</Link>
            <Link to="/signup" className="text-xs text-[#6b7280] hover:text-[#111827]">Sign up</Link>
            <Link to="/login" className="text-xs text-[#6b7280] hover:text-[#111827]">Sign in</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-8 pt-8 border-t border-[#e5e7eb]">
          <p className="text-xs text-[#9ca3af]">
            {new Date().getFullYear()} RestoreDocAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
