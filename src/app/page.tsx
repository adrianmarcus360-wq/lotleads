'use client';
import Link from 'next/link';
import { useState } from 'react';

/* ── Lead card data ──────────────────────────────── */
const LEADS = [
  { city: 'Phoenix', type: 'Strip Mall', score: 91, urgency: 'CRITICAL', lotSqft: 28400, gradient: 'from-[#1a0a0a] to-[#0d0d1a]', scoreColor: '#FF453A', scoreGlow: 'rgba(255,69,58,0.4)', badge: 'Critical Damage', shared: 2, max: 3 },
  { city: 'Scottsdale', type: 'Office Park', score: 87, urgency: 'CRITICAL', lotSqft: 34200, gradient: 'from-[#1a0f08] to-[#0d0d1a]', scoreColor: '#FF6B35', scoreGlow: 'rgba(255,107,53,0.4)', badge: 'Severe Cracking', shared: 1, max: 3 },
  { city: 'Tempe', type: 'Retail Center', score: 79, urgency: 'HIGH', lotSqft: 42000, gradient: 'from-[#0d1008] to-[#0d0d1a]', scoreColor: '#FF9F0A', scoreGlow: 'rgba(255,159,10,0.3)', badge: 'High Priority', shared: 0, max: 3 },
];

/* ── Score ring SVG ──────────────────────────────── */
function ScoreRing({ score, color, glow }: { score: number; color: string; glow: string }) {
  const r = 36, c = 2 * Math.PI * r;
  const fill = (score / 100) * c;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 90, height: 90 }}>
      <svg width="90" height="90" style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
        <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${c}`}
          style={{ filter: `drop-shadow(0 0 8px ${glow})` }} />
      </svg>
      <div className="relative text-center z-10">
        <div className="font-mono text-xl font-bold leading-none" style={{ color, textShadow: `0 0 12px ${glow}` }}>{score}</div>
        <div className="text-[9px] font-semibold text-white/40 mt-0.5 tracking-widest">SCORE</div>
      </div>
    </div>
  );
}

/* ── Lead card ───────────────────────────────────── */
function LeadCard({ lead, idx }: { lead: typeof LEADS[0]; idx: number }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] cursor-pointer transition-all duration-300 hover:border-white/[0.14] hover:translate-y-[-2px]"
      style={{
        background: 'linear-gradient(160deg, #0f0f20 0%, #0a0a16 100%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.5)',
        animationDelay: `${idx * 100}ms`,
      }}
    >
      {/* Aerial image placeholder with scan lines */}
      <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${lead.gradient}`}>
        <div className="absolute inset-0 bg-dot opacity-30" />
        {/* Simulated aerial grid */}
        <div className="absolute inset-0 bg-grid opacity-20" style={{ backgroundSize: '20px 20px' }} />
        {/* Damage heat overlay */}
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse 60% 40% at 35% 55%, ${lead.scoreColor}20 0%, transparent 70%)`
        }} />
        {/* Scan line sweep */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 h-px opacity-40 animate-pulse" style={{ top: '55%', background: `linear-gradient(90deg, transparent, ${lead.scoreColor}, transparent)` }} />
        </div>
        {/* Corner crosshairs */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t border-l opacity-60" style={{ borderColor: lead.scoreColor }} />
        <div className="absolute top-3 right-3 w-4 h-4 border-t border-r opacity-60" style={{ borderColor: lead.scoreColor }} />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l opacity-60" style={{ borderColor: lead.scoreColor }} />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r opacity-60" style={{ borderColor: lead.scoreColor }} />
        {/* Locked overlay */}
        <div className="absolute inset-0 backdrop-blur-[10px]" style={{ background: 'rgba(5,5,15,0.55)' }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <span className="text-[10px] font-semibold tracking-widest text-white/40 uppercase">Unlock to view</span>
        </div>
        {/* Score badge top-right */}
        <div className="absolute top-3 right-3 z-10">
          <span className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest border"
            style={{ borderColor: `${lead.scoreColor}50`, background: `${lead.scoreColor}18`, color: lead.scoreColor }}>
            {lead.urgency}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[11px] font-semibold tracking-widest text-white/35 uppercase mb-1">{lead.type}</div>
            <div className="text-lg font-bold text-white/90 tracking-tight">{lead.city}, AZ</div>
          </div>
          <ScoreRing score={lead.score} color={lead.scoreColor} glow={lead.scoreGlow} />
        </div>

        {/* Blurred address */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 mb-4">
          <div className="text-[10px] font-semibold tracking-widest text-white/30 uppercase mb-2">Property Address</div>
          <div className="h-4 rounded bg-white/10 blur-sm w-3/4 mb-1.5" />
          <div className="h-3 rounded bg-white/07 blur-sm w-1/2" />
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between text-xs mb-4">
          <span className="font-mono text-white/40">{(lead.lotSqft / 1000).toFixed(1)}k sq ft</span>
          <span className="text-white/40">·</span>
          <span className="text-white/40">{lead.shared}/{lead.max} buyers</span>
          <span className="text-white/40">·</span>
          <span className="font-mono text-white/50">$65</span>
        </div>

        {/* CTA */}
        <Link href="/leads"
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200"
          style={{ background: lead.scoreColor, color: '#fff', boxShadow: `0 4px 16px ${lead.scoreGlow}` }}>
          Unlock Lead
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────── */
export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div style={{ background: '#05050F', minHeight: '100vh', color: '#F0F4FF' }}>

      {/* ── Nav ──────────────────────────────────────── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(14,165,233,0.25)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', color: '#F0F4FF' }}>LotLeads</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/leads" style={{ fontSize: 13, color: 'rgba(240,244,255,0.5)', padding: '6px 12px', borderRadius: 8, textDecoration: 'none', transition: 'color 0.2s' }}>Browse Leads</Link>
            <Link href="#pricing" style={{ fontSize: 13, color: 'rgba(240,244,255,0.5)', padding: '6px 12px', borderRadius: 8, textDecoration: 'none' }}>Pricing</Link>
            <Link href="/auth/signin" style={{ fontSize: 13, color: 'rgba(240,244,255,0.5)', padding: '6px 12px', borderRadius: 8, textDecoration: 'none' }}>Sign in</Link>
            <Link href="/leads" style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: '#0EA5E9', padding: '7px 16px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 16px rgba(14,165,233,0.3)' }}>Browse Leads</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <section style={{ position: 'relative', paddingTop: 140, paddingBottom: 80, overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        {/* Radial glow */}
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 600, background: 'radial-gradient(ellipse, rgba(14,165,233,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
        {/* Grid */}
        <div className="absolute inset-0 bg-grid" style={{ backgroundSize: '44px 44px', opacity: 0.4 }} />
        {/* Scan line */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(14,165,233,0.04) 0%, transparent 30%, transparent 70%, rgba(14,165,233,0.03) 100%)' }} />

        <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', padding: '0 24px', textAlign: 'center', width: '100%' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 99, border: '1px solid rgba(14,165,233,0.3)', background: 'rgba(14,165,233,0.08)', padding: '6px 16px', marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0EA5E9', boxShadow: '0 0 8px rgba(14,165,233,0.8)', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#38BDF8', textTransform: 'uppercase' }}>AI-Powered Aerial Lead Detection</span>
          </div>

          {/* Headline — this is where Apple/Tesla energy lives */}
          <h1 style={{ fontSize: 'clamp(44px, 7vw, 88px)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.02, marginBottom: 28, color: '#F0F4FF' }}>
            Find commercial lots<br />
            <span style={{ color: '#38BDF8', textShadow: '0 0 60px rgba(56,189,248,0.4)' }}>before your competition</span><br />
            <span style={{ color: 'rgba(240,244,255,0.5)', fontWeight: 400 }}>even looks.</span>
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(122,139,181,1)', lineHeight: 1.65, maxWidth: 560, margin: '0 auto 40px', fontWeight: 400 }}>
            AI scans aerial imagery of every commercial property daily. Oxidized asphalt, failed striping, alligator cracking — flagged and ready. Evidence package delivered before your phone rings.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/leads" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0EA5E9', color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 14, padding: '14px 28px', textDecoration: 'none', boxShadow: '0 4px 24px rgba(14,165,233,0.4)', letterSpacing: '-0.01em' }}>
                Browse Live Leads
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <a href="#how-it-works" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', color: 'rgba(240,244,255,0.7)', fontWeight: 600, fontSize: 15, borderRadius: 14, padding: '14px 28px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
                See how it works
              </a>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(122,139,181,0.6)', letterSpacing: '0.05em' }}>No credit card · First lead free · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* ── Stats — BIG numbers, Tesla spec-page energy ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { num: '12,847', label: 'Lots Monitored', sub: 'Phoenix metro' },
            { num: '94', label: 'Avg Condition Score', sub: 'On critical leads' },
            { num: '$65', label: 'Per Lead', sub: 'Shared · 3 buyers max' },
            { num: '72hr', label: 'Exclusivity Window', sub: 'On exclusive leads' },
          ].map((s) => (
            <div key={s.label} style={{ padding: '40px 24px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="font-mono" style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 700, color: '#38BDF8', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 8 }}>{s.num}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(240,244,255,0.7)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(122,139,181,0.6)', letterSpacing: '0.04em' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live lead preview ─────────────────────────── */}
      <section style={{ padding: '100px 24px', background: '#05050F' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 56, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: '#0EA5E9', textTransform: 'uppercase', marginBottom: 12 }}>Live Intelligence Feed</div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#F0F4FF', margin: 0 }}>
                Lots found<br /><span style={{ color: 'rgba(240,244,255,0.4)', fontWeight: 400 }}>this week.</span>
              </h2>
            </div>
            <Link href="/leads" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#38BDF8', textDecoration: 'none', border: '1px solid rgba(14,165,233,0.25)', borderRadius: 10, padding: '8px 16px' }}>
              View all leads
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {LEADS.map((lead, idx) => <LeadCard key={lead.city} lead={lead} idx={idx} />)}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(180deg, #060612 0%, #05050F 100%)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: '#0EA5E9', textTransform: 'uppercase', marginBottom: 12 }}>The System</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#F0F4FF', margin: 0 }}>Automated. Every day. Zero effort on your end.</h2>
          </div>

          <div style={{ display: 'grid', gap: 20 }}>
            {[
              { n: '01', title: 'Aerial scan', desc: 'AI processes satellite imagery across 12,000+ commercial properties daily. Oxidation, cracking, alligator patterns, failed striping — all flagged automatically.' },
              { n: '02', title: 'Score and rank', desc: 'Each lot receives a deterioration score from 1–100. Only lots scoring above 60 enter the intelligence feed. You see the worst lots first.' },
              { n: '03', title: 'Evidence package', desc: 'Aerial photo crop, estimated repair value, owner name, mailing address, and property details — bundled and ready when you unlock.' },
              { n: '04', title: 'You close the deal', desc: 'Show up with evidence they can\'t argue with. Aerial proof of damage + your quote = closed. Your competitors are still cold-calling blind.' },
            ].map((step, i) => (
              <div key={step.n} onClick={() => setActiveStep(i)}
                style={{
                  display: 'flex', gap: 24, padding: '28px 32px', borderRadius: 16, cursor: 'pointer',
                  border: `1px solid ${activeStep === i ? 'rgba(14,165,233,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  background: activeStep === i ? 'rgba(14,165,233,0.05)' : 'rgba(255,255,255,0.015)',
                  transition: 'all 0.2s',
                }}>
                <div className="font-mono" style={{ fontSize: 12, fontWeight: 700, color: activeStep === i ? '#38BDF8' : 'rgba(122,139,181,0.4)', letterSpacing: '0.05em', minWidth: 28, paddingTop: 3 }}>{step.n}</div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: activeStep === i ? '#F0F4FF' : 'rgba(240,244,255,0.7)', letterSpacing: '-0.02em', marginBottom: 8, margin: '0 0 8px' }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: 'rgba(122,139,181,0.8)', lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────── */}
      <section id="pricing" style={{ padding: '100px 24px', background: '#05050F', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: '#0EA5E9', textTransform: 'uppercase', marginBottom: 12 }}>Pricing</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#F0F4FF', margin: '0 0 16px' }}>Pay for what you use.</h2>
            <p style={{ fontSize: 16, color: 'rgba(122,139,181,0.8)', margin: 0 }}>No subscriptions required. Buy a lead, close a job.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { name: 'Shared Lead', price: '$65', unit: 'per lead', highlight: false, accent: 'rgba(14,165,233,0.8)', features: ['Up to 3 buyers total', 'Full aerial evidence package', 'Owner name + address', 'Deterioration score', 'Property details'] },
              { name: 'Exclusive Lead', price: '$149', unit: 'per lead', highlight: true, accent: '#38BDF8', features: ['Only you for 72 hours', 'First-mover advantage', 'Full aerial evidence package', 'Owner name + address', 'SkyFi high-res add-on'] },
              { name: 'Pro Territory', price: '$297', unit: 'per month', highlight: false, accent: 'rgba(14,165,233,0.8)', features: ['5 exclusive leads / mo', 'Territory badge', 'Priority new lot alerts', 'Everything in Exclusive', 'Dedicated market'] },
            ].map((tier) => (
              <div key={tier.name} style={{
                borderRadius: 20, padding: '32px 28px',
                border: `1px solid ${tier.highlight ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.07)'}`,
                background: tier.highlight ? 'linear-gradient(160deg, rgba(14,165,233,0.08) 0%, rgba(5,5,15,0.95) 100%)' : 'rgba(255,255,255,0.02)',
                boxShadow: tier.highlight ? '0 0 40px rgba(14,165,233,0.12), 0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.3)',
                position: 'relative',
              }}>
                {tier.highlight && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#0EA5E9', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', padding: '4px 14px', borderRadius: 99, textTransform: 'uppercase' }}>Most Popular</div>
                )}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(122,139,181,0.6)', textTransform: 'uppercase', marginBottom: 8 }}>{tier.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span className="font-mono" style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.04em', color: tier.accent }}>{tier.price}</span>
                    <span style={{ fontSize: 12, color: 'rgba(122,139,181,0.5)' }}>{tier.unit}</span>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, marginBottom: 24 }}>
                  {tier.features.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(14,165,233,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#0EA5E9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span style={{ fontSize: 13, color: 'rgba(240,244,255,0.6)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/leads" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none',
                  background: tier.highlight ? '#0EA5E9' : 'rgba(255,255,255,0.05)',
                  color: tier.highlight ? '#fff' : 'rgba(240,244,255,0.7)',
                  border: tier.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: tier.highlight ? '0 4px 20px rgba(14,165,233,0.35)' : 'none',
                }}>
                  {tier.name === 'Pro Territory' ? 'Join Pro' : 'Get Started'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section style={{ padding: '120px 24px', background: 'linear-gradient(180deg, #05050F 0%, #080816 100%)', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(14,165,233,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 700, letterSpacing: '-0.04em', color: '#F0F4FF', margin: '0 0 20px', lineHeight: 1.05 }}>
            Your next big job<br />
            <span style={{ color: '#38BDF8', textShadow: '0 0 40px rgba(56,189,248,0.3)' }}>is already on the map.</span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(122,139,181,0.75)', margin: '0 0 40px' }}>First lead is on us. See exactly what your competition is missing.</p>
          <Link href="/leads" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#0EA5E9', color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 16, padding: '16px 36px', textDecoration: 'none', boxShadow: '0 8px 32px rgba(14,165,233,0.4)', letterSpacing: '-0.01em' }}>
            Browse Available Leads
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 24px', background: '#05050F' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(240,244,255,0.4)', letterSpacing: '-0.01em' }}>LotLeads</span>
          <span style={{ fontSize: 12, color: 'rgba(122,139,181,0.4)' }}>© 2026 LotLeads. AI parking lot intelligence.</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Contact'].map(l => <a key={l} href="#" style={{ fontSize: 12, color: 'rgba(122,139,181,0.4)', textDecoration: 'none' }}>{l}</a>)}
          </div>
        </div>
      </footer>
    </div>
  );
}
