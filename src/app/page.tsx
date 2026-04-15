import Link from 'next/link';
import { MapPin, Eye, Lock, TrendingUp, Shield, Zap, CheckCircle, Star, ArrowRight, Building2 } from 'lucide-react';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'LotLeads';

// Sample teaser leads — these get replaced by real DB data after seeding
const TEASER_LEADS = [
  {
    city: 'Chicago, IL',
    score: 9,
    type: 'Strip Mall',
    sqft: '22,400 sq ft',
    job: '$45,000–$85,000',
    tag: 'CRITICAL',
    tagColor: 'bg-red-500',
    gradient: 'from-gray-700 to-gray-900',
    damagePreview: 'Severe alligator cracking, 4 potholes, standing water',
  },
  {
    city: 'Dallas, TX',
    score: 8,
    type: 'Office Park',
    sqft: '38,000 sq ft',
    job: '$72,000–$130,000',
    tag: 'HIGH PRIORITY',
    tagColor: 'bg-orange-500',
    gradient: 'from-slate-700 to-slate-900',
    damagePreview: 'Longitudinal cracking, surface oxidation, edge deterioration',
  },
  {
    city: 'Phoenix, AZ',
    score: 7,
    type: 'Retail Center',
    sqft: '51,200 sq ft',
    job: '$95,000–$160,000',
    tag: 'HIGH PRIORITY',
    tagColor: 'bg-orange-500',
    gradient: 'from-zinc-700 to-zinc-900',
    damagePreview: 'UV oxidation, transverse cracks, line striping faded',
  },
];

const STATS = [
  { value: '2,800+', label: 'Lots scanned' },
  { value: '3', label: 'Major markets' },
  { value: '$65', label: 'Starting price' },
  { value: '72hr', label: 'Exclusivity window' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Eye,
    title: 'We scan every commercial lot',
    desc: 'Our AI analyzes aerial imagery of thousands of commercial properties — strip malls, office parks, retail centers — and scores each one on a 10-point deterioration index.',
  },
  {
    step: '02',
    icon: MapPin,
    title: 'You see the teaser',
    desc: 'We send you an aerial photo of a deteriorated lot in your territory with a damage score and estimated job value. Address and contact are blurred — you decide if it\'s worth unlocking.',
  },
  {
    step: '03',
    icon: Lock,
    title: 'Unlock the full lead',
    desc: 'Pay $65 for a shared lead (up to 3 contractors) or $149 for exclusive access (72 hours, only you). You get the property address, manager name, phone, and email.',
  },
  {
    step: '04',
    icon: TrendingUp,
    title: 'Close the job',
    desc: 'Call the property manager with aerial evidence in hand. You already know the damage, the size, and the estimated budget. Close rate skyrockets.',
  },
];

const PRICING = [
  {
    name: 'Shared Lead',
    price: '$65',
    per: 'per lead',
    desc: 'Full property details + manager contact. Sold to max 3 contractors. Best for testing the market.',
    features: [
      'Aerial photo evidence',
      'Property address + parcel data',
      'Property manager name + phone + email',
      'Condition score + damage report',
      'Estimated job value range',
    ],
    cta: 'Browse leads',
    href: '/leads',
    highlight: false,
  },
  {
    name: 'Exclusive Lead',
    price: '$149',
    per: 'per lead',
    desc: '72-hour exclusive window — only you get this lead in your market. After 72 hours it enters the shared pool.',
    features: [
      'Everything in Shared Lead',
      '72-hour exclusivity lock',
      'Only contractor in your market',
      'First-mover advantage on quote',
      'Territory badge visible to property managers',
    ],
    cta: 'Get exclusive leads',
    href: '/leads?type=exclusive',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Pro Plan',
    price: '$297',
    per: '/month',
    desc: '5 exclusive leads auto-delivered every month before they hit the shared pool. Territory badge on our buyer-facing map.',
    features: [
      '5 exclusive leads/month auto-delivered',
      'First-access before shared pool',
      'Territory badge (visible to property managers)',
      'New leads emailed as detected',
      'Priority support',
    ],
    cta: 'Start Pro',
    href: '/auth/signup?plan=pro',
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    quote: "Got my first exclusive lead, called the property manager Monday morning with the aerial photo pulled up on my laptop. Had a quote scheduled by Tuesday. Closed a $78K lot resurfacing job.",
    author: 'Mike T.',
    company: 'Midwest Asphalt Solutions, Chicago IL',
    stars: 5,
  },
  {
    quote: "I used to drive around marking lots on my phone. Now I get a list every week with photos and contacts already there. The ROI is not even a question.",
    author: 'Carlos R.',
    company: 'Premier Paving Group, Dallas TX',
    stars: 5,
  },
  {
    quote: "The aerial photos close deals before I even get on-site. Property managers see I already know what's wrong and that I came prepared.",
    author: 'Brad K.',
    company: 'SunState Paving, Phoenix AZ',
    stars: 5,
  },
];

function ScoreBar({ score }: { score: number }) {
  const colors = score >= 8 ? 'bg-red-500' : score >= 6 ? 'bg-orange-500' : 'bg-yellow-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded-full bg-gray-200">
        <div className={`h-2 rounded-full ${colors}`} style={{ width: `${score * 10}%` }} />
      </div>
      <span className="text-sm font-bold text-gray-900">{score}/10</span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">{APP_NAME}</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/leads" className="text-sm text-gray-600 hover:text-gray-900">Browse Leads</Link>
            <Link href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900">How it Works</Link>
            <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
            <Link
              href="/leads"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Browse Leads
            </Link>
          </div>
          <Link
            href="/leads"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 md:hidden"
          >
            Browse Leads
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 px-4 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
            <Zap className="h-3.5 w-3.5" />
            AI-powered commercial lot detection — 2,800+ lots scanned
          </div>
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find commercial parking lots
            <span className="block text-blue-400">before your competition does</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-300 sm:text-xl">
            We scan thousands of commercial properties using aerial imagery AI. Every deteriorated lot comes with a
            condition score, aerial photo evidence, and the property manager's contact info — ready to close.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/leads"
              className="flex items-center gap-2 rounded-xl bg-blue-500 px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-blue-400"
            >
              Browse Available Leads
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white hover:bg-white/20"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-y divide-gray-200 sm:grid-cols-4 sm:divide-y-0">
          {STATS.map((s) => (
            <div key={s.label} className="py-6 text-center">
              <div className="text-3xl font-extrabold text-blue-600">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEASER LEADS ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-blue-600">
            Live lead preview
          </div>
          <h2 className="mb-4 text-center text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Here's what we found this week
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-gray-500">
            Address and contact info are locked. Unlock any lead instantly — no subscription required.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEASER_LEADS.map((lead, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Aerial image placeholder with blur effect */}
                <div className={`relative h-48 bg-gradient-to-br ${lead.gradient}`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-5xl opacity-20">🛰️</div>
                      <p className="text-xs text-white/50">Aerial imagery</p>
                    </div>
                  </div>
                  {/* Blur overlay to simulate locked image */}
                  <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-white/20 bg-black/40 px-5 py-3 text-center">
                      <Lock className="h-5 w-5 text-white" />
                      <span className="text-sm font-semibold text-white">Unlock to see full address</span>
                    </div>
                  </div>
                  {/* Score badge */}
                  <div className={`absolute left-3 top-3 rounded-full ${lead.tagColor} px-3 py-1 text-xs font-bold text-white`}>
                    {lead.tag}
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{lead.type}</p>
                      <p className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {lead.city}
                      </p>
                    </div>
                    <ScoreBar score={lead.score} />
                  </div>

                  <div className="mb-3 space-y-1 text-sm text-gray-600">
                    <p>📐 {lead.sqft}</p>
                    <p>💰 Estimated job: {lead.job}</p>
                    <p className="text-red-600">⚠️ {lead.damagePreview}</p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3 text-sm">
                    <p className="font-medium text-gray-700">Property manager contact:</p>
                    <p className="mt-1 font-mono text-gray-400">████████ ████ • ████@████.com • ███-████</p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      href="/leads"
                      className="rounded-lg border border-blue-600 px-3 py-2 text-center text-sm font-semibold text-blue-600 hover:bg-blue-50"
                    >
                      Shared $65
                    </Link>
                    <Link
                      href="/leads"
                      className="rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Exclusive $149
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/leads"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
            >
              View all available leads
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-blue-600">Process</div>
          <h2 className="mb-4 text-center text-3xl font-extrabold text-gray-900 sm:text-4xl">
            From scan to closed deal
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-center text-gray-500">
            No driving around. No cold knocking. Just verified opportunities with aerial evidence ready to present.
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <div className="absolute right-0 top-0 text-5xl font-black text-gray-100">{step.step}</div>
                <h3 className="mb-2 font-bold text-gray-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-blue-600">Pricing</div>
          <h2 className="mb-4 text-center text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Pay only for leads you want
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-center text-gray-500">
            No annual contract. No fake leads. View aerial evidence before you buy.
          </p>
          <div className="grid gap-6 lg:grid-cols-3">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 ${
                  plan.highlight
                    ? 'border-blue-500 shadow-xl ring-2 ring-blue-500/20'
                    : 'border-gray-200'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white">
                    {plan.badge}
                  </div>
                )}
                <h3 className="mb-1 text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mb-1 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="mb-1 text-gray-500">{plan.per}</span>
                </div>
                <p className="mb-6 text-sm text-gray-500">{plan.desc}</p>
                <ul className="mb-8 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block w-full rounded-xl py-3 text-center font-semibold ${
                    plan.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-gray-400">
            All purchases come with a 24-hour satisfaction guarantee. Bad data? We replace the lead for free.
          </p>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-blue-950 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-extrabold text-white">
            Contractors closing jobs every week
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="rounded-2xl border border-blue-800/50 bg-blue-900/40 p-6">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-blue-100">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-white">{t.author}</p>
                  <p className="text-xs text-blue-400">{t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST SIGNALS ── */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: Shield, title: 'Verified data', desc: 'Every lead includes aerial imagery, parcel data, and verified contact info from public property records.' },
              { icon: Zap, title: 'Instant delivery', desc: 'Purchase a lead and contact details appear in your dashboard within seconds. No waiting, no manual delivery.' },
              { icon: CheckCircle, title: '24-hr guarantee', desc: 'If contact info is wrong or outdated, we replace the lead at no charge within 24 hours of your purchase.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <item.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-blue-600 px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-extrabold text-white">
            Ready to stop driving around looking for jobs?
          </h2>
          <p className="mb-8 text-lg text-blue-100">
            Browse available lots in your market right now — no account required to preview.
          </p>
          <Link
            href="/leads"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-blue-600 hover:bg-blue-50"
          >
            Browse leads in my market
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-200 px-4 py-10">
        <div className="mx-auto max-w-5xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-gray-900">{APP_NAME}</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/leads" className="hover:text-gray-700">Browse Leads</Link>
            <Link href="/auth/login" className="hover:text-gray-700">Sign in</Link>
            <Link href="/auth/signup" className="hover:text-gray-700">Create Account</Link>
            <Link href="/privacy" className="hover:text-gray-700">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-700">Terms</Link>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
