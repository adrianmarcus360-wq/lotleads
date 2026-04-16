import Link from 'next/link';
import { MapPin, Eye, Lock, TrendingUp, Shield, Zap, CheckCircle, Star, ArrowRight, Building2, Satellite } from 'lucide-react';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'LotLeads';

const TEASER_LEADS = [
  {
    city: 'Chicago, IL',
    score: 9,
    type: 'Strip mall',
    sqft: '22,400',
    job: '$45K–$85K',
    tag: 'CRITICAL',
    damages: ['Alligator cracking', 'Standing water', '4 potholes'],
  },
  {
    city: 'Dallas, TX',
    score: 8,
    type: 'Office park',
    sqft: '38,000',
    job: '$72K–$130K',
    tag: 'HIGH',
    damages: ['Longitudinal cracking', 'Surface oxidation'],
  },
  {
    city: 'Phoenix, AZ',
    score: 7,
    type: 'Retail center',
    sqft: '51,200',
    job: '$95K–$160K',
    tag: 'HIGH',
    damages: ['UV oxidation', 'Transverse cracks', 'Faded striping'],
  },
];

const STATS = [
  { value: '10,800+', label: 'Lots scanned' },
  { value: '3',       label: 'Markets active' },
  { value: '$65',     label: 'Starting price' },
  { value: '72hr',    label: 'Exclusivity window' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Eye,
    title: 'We scan every commercial lot',
    desc: 'AI analyzes aerial imagery of thousands of commercial properties and scores each on a 10-point deterioration index — oxidation, cracking, alligator patterns, faded striping.',
  },
  {
    step: '02',
    icon: MapPin,
    title: 'You see the teaser',
    desc: 'A blurred aerial crop of the damaged lot in your market — city only, no address. You see the damage score and estimated job range. You decide if it\'s worth unlocking.',
  },
  {
    step: '03',
    icon: Lock,
    title: 'Unlock the full lead',
    desc: '$65 shared (max 3 contractors) or $149 exclusive (72 hours, only you). You get the address, manager name, phone, and email.',
  },
  {
    step: '04',
    icon: TrendingUp,
    title: 'Close with evidence',
    desc: 'Call the property manager with aerial photo evidence. You already know the damage, lot size, and estimated budget. Close rates are dramatically higher.',
  },
];

function scoreColor(score: number) {
  if (score >= 9) return '#FF453A';
  if (score >= 7) return '#FF6B35';
  return '#FF9F0A';
}

function TeaserCard({ lead, idx }: { lead: typeof TEASER_LEADS[0]; idx: number }) {
  const color = scoreColor(lead.score);
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] animate-fade-up"
      style={{ animationDelay: `${idx * 120}ms` }}
    >
      {/* Blurred aerial placeholder */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a]">
        {/* Simulated aerial texture */}
        <div className="absolute inset-0 bg-dot opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Central blur effect */}
        <div className="absolute inset-4 rounded-xl bg-[rgba(255,255,255,0.03)] backdrop-blur-xl" />
        {/* Lock */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur-sm">
            <Lock className="h-5 w-5 text-white/70" />
          </div>
          <p className="text-xs font-semibold text-white/60">{lead.type} · {lead.city}</p>
        </div>
        {/* Score badge */}
        <div
          className="absolute left-3 bottom-3 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold backdrop-blur-sm"
          style={{ borderColor: `${color}40`, background: `${color}18`, color }}
        >
          <span className="font-mono">{lead.score}/10</span>
          <span>·</span>
          <span>{lead.tag}</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-ink-faint uppercase tracking-wider">{lead.type}</p>
          <p className="text-sm font-semibold text-ink flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-ink-muted" />
            {lead.city}
          </p>
        </div>
        <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
          <p className="text-[10px] uppercase tracking-wider text-ink-faint">Est. Job Size</p>
          <p className="font-mono text-base font-bold text-ink mt-0.5">{lead.job}</p>
          <p className="text-[11px] text-ink-muted mt-0.5">{lead.sqft} sq ft · based on NPCA rates</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {lead.damages.slice(0, 2).map(d => (
            <span key={d} className="rounded-full border border-score-high/20 bg-score-high/8 px-2.5 py-0.5 text-[10px] font-medium text-score-high">
              {d}
            </span>
          ))}
        </div>
        <div className="rounded-lg border border-[rgba(255,255,255,0.05)] px-3 py-2">
          <p className="font-mono text-xs text-ink-faint select-none">████████ ████ · ████@████.com</p>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="rounded-lg border border-[rgba(255,255,255,0.1)] py-2 text-center text-xs font-semibold text-ink-muted">
            Shared $65
          </div>
          <div className="rounded-lg bg-accent py-2 text-center text-xs font-semibold text-white shadow-glow-accent">
            Exclusive $149
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base">
      {/* ── Nav ───────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(255,255,255,0.06)] bg-base/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15">
              <Building2 className="h-4 w-4 text-accent" />
            </div>
            <span className="font-semibold text-ink tracking-tight">{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/leads" className="hidden text-sm text-ink-muted hover:text-ink transition-colors sm:block">Browse leads</Link>
            <Link href="/auth/login" className="text-sm text-ink-muted hover:text-ink transition-colors">Sign in</Link>
            <Link href="/auth/signup" className="btn-primary py-2 px-4 text-sm">
              Get access
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid opacity-50" style={{ backgroundSize: '40px 40px' }} />

        {/* Radial accent glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(14,165,233,0.4) 0%, transparent 70%)' }}
        />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
          {/* Label */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/8 px-4 py-1.5 text-xs font-medium text-accent-bright animate-fade-up">
            <Satellite className="h-3.5 w-3.5" />
            AI-powered commercial parking lot intelligence
          </div>

          {/* Headline */}
          <h1
            className="mb-6 text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl animate-fade-up"
            style={{ animationDelay: '80ms', letterSpacing: '-0.02em' }}
          >
            Find deteriorated lots{' '}
            <span
              className="text-glow-accent"
              style={{ color: '#38BDF8' }}
            >
              before your competition
            </span>
          </h1>

          {/* Sub */}
          <p
            className="mx-auto mb-10 max-w-2xl text-lg text-ink-muted leading-relaxed animate-fade-up"
            style={{ animationDelay: '140ms' }}
          >
            AI scans thousands of commercial properties every week. We score the damage, estimate the job,
            and deliver the property manager's contact — all before you make a single call.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center animate-fade-up" style={{ animationDelay: '200ms' }}>
            <Link href="/leads" className="btn-primary py-3.5 px-8 text-base">
              Browse live leads
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/auth/signup" className="btn-ghost py-3.5 px-8 text-sm">
              Create free account
            </Link>
          </div>

          {/* Stats bar */}
          <div
            className="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-px rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)] sm:grid-cols-4 animate-fade-up"
            style={{ animationDelay: '280ms' }}
          >
            {STATS.map(s => (
              <div key={s.label} className="bg-[rgba(255,255,255,0.025)] px-4 py-5 text-center">
                <p className="font-mono text-2xl font-bold text-ink">{s.value}</p>
                <p className="mt-0.5 text-xs text-ink-muted uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Teaser cards ─────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-accent mb-2">Live intelligence feed</p>
              <h2 className="text-2xl font-bold text-ink tracking-tight">Recent leads — blurred until unlocked</h2>
            </div>
            <Link href="/leads" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-bright transition-colors">
              View all leads
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TEASER_LEADS.map((lead, i) => (
              <TeaserCard key={lead.city} lead={lead} idx={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────── */}
      <section className="py-16 sm:py-24 border-t border-[rgba(255,255,255,0.05)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-accent mb-3">The process</p>
            <h2 className="text-3xl font-bold text-ink tracking-tight">How it works</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.step}
                className="glass rounded-xl p-6 animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="mb-4 flex items-start gap-4">
                  <span className="font-mono text-3xl font-bold text-ink-faint">{step.step}</span>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 mt-1">
                    <step.icon className="h-4.5 w-4.5 text-accent" />
                  </div>
                </div>
                <h3 className="mb-2 text-base font-semibold text-ink">{step.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────── */}
      <section className="py-16 sm:py-24 border-t border-[rgba(255,255,255,0.05)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-accent mb-3">Pricing</p>
            <h2 className="text-3xl font-bold text-ink tracking-tight">Pay per lead. No subscriptions required.</h2>
            <p className="mt-3 text-ink-muted">Or go Pro for territory exclusivity and automatic delivery.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                name: 'Shared Lead',
                price: '$65',
                per: 'per lead',
                highlight: false,
                badge: null,
                features: [
                  'Aerial photo evidence',
                  'Property address + parcel data',
                  'Manager name, phone & email',
                  'AI damage score + report',
                  'Estimated job range',
                  'Sold to max 3 contractors',
                ],
              },
              {
                name: 'Exclusive Lead',
                price: '$149',
                per: 'per lead',
                highlight: true,
                badge: 'Most popular',
                features: [
                  'Everything in Shared',
                  '72-hr exclusivity window',
                  'Only you in your market',
                  'Aerial photo evidence',
                  'Property manager contact',
                  'Enters shared pool after 72hr',
                ],
              },
              {
                name: 'Pro',
                price: '$297',
                per: 'per month',
                highlight: false,
                badge: null,
                features: [
                  '5 exclusive leads per month',
                  'Auto-delivered to your inbox',
                  'Territory badge (claimed market)',
                  'Priority scoring queue',
                  'SkyFi premium images included',
                  'Cancel anytime',
                ],
              },
            ].map(plan => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 ${
                  plan.highlight
                    ? 'border border-accent/40 bg-accent/5 shadow-glow-accent'
                    : 'glass'
                }`}
              >
                {plan.badge && (
                  <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-bold text-accent-bright uppercase tracking-wider">
                    <Star className="h-3 w-3" />
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-base font-semibold text-ink">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl font-bold text-ink">{plan.price}</span>
                  <span className="text-sm text-ink-muted">{plan.per}</span>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-muted">
                      <CheckCircle className="h-4 w-4 shrink-0 text-accent/70 mt-px" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.name === 'Pro' ? '/auth/signup?plan=pro' : '/leads'}
                  className={`mt-6 block rounded-xl py-2.5 text-center text-sm font-semibold transition-all ${
                    plan.highlight
                      ? 'bg-accent text-white hover:bg-accent-bright shadow-glow-accent'
                      : 'border border-[rgba(255,255,255,0.12)] text-ink-muted hover:border-[rgba(255,255,255,0.25)] hover:text-ink'
                  }`}
                >
                  {plan.name === 'Pro' ? 'Start Pro' : 'Browse leads'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust signals ─────────────────── */}
      <section className="py-16 border-t border-[rgba(255,255,255,0.05)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3 text-center">
            {[
              { Icon: Shield,       title: 'Verified data',       desc: 'Owner contacts sourced from county assessor records via Regrid API.' },
              { Icon: Satellite,    title: 'Real aerial imagery',  desc: 'Google Maps + SkyFi satellite imagery. Not stock photos or estimates.' },
              { Icon: Zap,          title: 'Instant delivery',     desc: 'Pay → unlock → contact info delivered in under 3 seconds.' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="glass rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                </div>
                <h3 className="mb-2 text-sm font-semibold text-ink">{title}</h3>
                <p className="text-xs text-ink-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────── */}
      <section className="py-20 border-t border-[rgba(255,255,255,0.05)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-ink tracking-tight mb-4">
            Your next $80K job is already deteriorating.
          </h2>
          <p className="mb-8 text-ink-muted">
            While your competition is cold calling lists, you'll be walking in with aerial photos and a cost estimate. That's the difference.
          </p>
          <Link href="/leads" className="btn-primary py-3.5 px-10 text-base animate-pulse-glow">
            Browse live leads →
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────── */}
      <footer className="border-t border-[rgba(255,255,255,0.05)] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-accent/15">
              <Building2 className="h-3 w-3 text-accent" />
            </div>
            <span className="font-medium text-ink">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-ink transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-ink transition-colors">Terms</Link>
            <Link href="/leads"   className="hover:text-ink transition-colors">Browse leads</Link>
          </div>
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
