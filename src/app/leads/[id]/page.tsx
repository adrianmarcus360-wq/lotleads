'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Lock, Unlock, CheckCircle, ArrowLeft, Building2,
  Phone, Mail, User, Loader2, Star, ChevronDown, ChevronUp,
  Calculator, Satellite, Info, Zap,
} from 'lucide-react';
import LotImage from '@/components/LotImage';
import { getConditionLabel, formatCurrency } from '@/lib/utils';

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type Lead = {
  id: string;
  city: string;
  state: string;
  zip: string;
  market: string;
  address: string | null;
  propertyName: string | null;
  conditionScore: number;
  urgency: string;
  damageTypes: string;
  estimatedJobMin: number;
  estimatedJobMax: number;
  propertyType: string;
  lotSqFt: number | null;
  lat: number;
  lng: number;
  vertical: string[];
  status: string;
  sharedBuyerCount: number;
  maxSharedBuyers: number;
  exclusiveBuyerId: string | null;
  exclusiveExpiresAt: string | null;
  propertyManagerName: string | null;
  propertyManagerEmail: string | null;
  propertyManagerPhone: string | null;
  locked: boolean;
  purchases?: { type: string; createdAt: string }[];
};

/* ─────────────────────────────────────────────
   CALCULATOR DATA
───────────────────────────────────────────── */
type WorkType = 'sealcoat' | 'crackfill' | 'mill_overlay' | 'full_replacement';

const WORK_TYPES: {
  id: WorkType;
  label: string;
  short: string;
  rateMin: number;
  rateMax: number;
  rateDefault: number;
  scoreRange: string;
}[] = [
  { id: 'sealcoat',        label: 'Sealcoat',            short: 'Sealcoat',    rateMin: 0.15, rateMax: 0.40, rateDefault: 0.22, scoreRange: '1–3' },
  { id: 'crackfill',       label: 'Crack Fill + Seal',   short: 'Crack Seal',  rateMin: 0.30, rateMax: 0.65, rateDefault: 0.45, scoreRange: '4–6' },
  { id: 'mill_overlay',    label: 'Mill & Overlay 2"',   short: 'Mill & OL',   rateMin: 1.50, rateMax: 3.50, rateDefault: 2.00, scoreRange: '7–8' },
  { id: 'full_replacement',label: 'Full Replacement',    short: 'Full Replace', rateMin: 3.00, rateMax: 7.00, rateDefault: 4.50, scoreRange: '9–10' },
];

function scoreToWorkType(score: number): WorkType {
  if (score <= 3) return 'sealcoat';
  if (score <= 6) return 'crackfill';
  if (score <= 8) return 'mill_overlay';
  return 'full_replacement';
}

/* ─────────────────────────────────────────────
   SCORE RING SVG
───────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const size = 80;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;

  const color =
    score >= 9 ? '#FF453A' :
    score >= 7 ? '#FF6B35' :
    score >= 4 ? '#FF9F0A' : '#30D158';

  const glowColor =
    score >= 9 ? 'rgba(255,69,58,0.5)' :
    score >= 7 ? 'rgba(255,107,53,0.5)' :
    score >= 4 ? 'rgba(255,159,10,0.5)' : 'rgba(48,209,88,0.5)';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="rgba(255,255,255,0.07)" strokeWidth={strokeWidth} fill="none"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${glowColor})`, transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-xl font-bold leading-none" style={{ color }}>{score}</span>
        <span className="text-[9px] font-medium tracking-widest text-ink-muted uppercase mt-0.5">/ 10</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CALCULATOR COMPONENT
───────────────────────────────────────────── */
function EstimateCalculator({ lead }: { lead: Lead }) {
  const sqft = lead.lotSqFt ?? 0;
  const defaultType = scoreToWorkType(lead.conditionScore);

  const [workType, setWorkType] = useState<WorkType>(defaultType);
  const [rate, setRate] = useState(WORK_TYPES.find(w => w.id === defaultType)?.rateDefault ?? 2.00);
  const [sqftOverride, setSqftOverride] = useState(sqft);
  const [showSources, setShowSources] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const currentWorkType = WORK_TYPES.find(w => w.id === workType)!;
  const estimate = Math.round(sqftOverride * rate);

  const handleWorkTypeChange = (wt: WorkType) => {
    const next = WORK_TYPES.find(w => w.id === wt)!;
    setWorkType(wt);
    setRate(next.rateDefault);
    setAnimKey(k => k + 1);
  };

  const handleRateChange = (val: number) => {
    setRate(val);
    setAnimKey(k => k + 1);
  };

  const ratePercent = ((rate - currentWorkType.rateMin) / (currentWorkType.rateMax - currentWorkType.rateMin)) * 100;

  return (
    <div className="glass rounded-xl p-6 space-y-5 border border-[rgba(255,255,255,0.07)]">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <Calculator className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink">Job Estimate Calculator</h3>
          <p className="text-xs text-ink-muted">Adjust to match your local rates</p>
        </div>
      </div>

      {/* Work type tabs */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-faint">Work Type</p>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {WORK_TYPES.map((wt) => (
            <button
              key={wt.id}
              onClick={() => handleWorkTypeChange(wt.id)}
              className={`relative rounded-lg border px-2.5 py-2 text-center text-xs font-medium transition-all ${
                workType === wt.id
                  ? 'border-accent/50 bg-accent/10 text-accent-bright'
                  : 'border-[rgba(255,255,255,0.07)] text-ink-muted hover:border-[rgba(255,255,255,0.15)] hover:text-ink'
              }`}
            >
              {wt.short}
              {wt.id === defaultType && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-accent/20 px-1.5 py-px text-[9px] font-semibold text-accent-bright">
                  AI rec
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lot size input */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">Lot Size</p>
          <span className="text-xs text-ink-muted">from parcel data</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
          <input
            type="number"
            value={sqftOverride}
            onChange={e => { setSqftOverride(Number(e.target.value)); setAnimKey(k => k + 1); }}
            className="w-full bg-transparent font-mono text-sm font-medium text-ink outline-none"
          />
          <span className="shrink-0 text-xs text-ink-muted">sq ft</span>
        </div>
      </div>

      {/* Rate slider */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">Your Rate</p>
          <span className="font-mono text-sm font-semibold text-accent-bright">${rate.toFixed(2)} / sq ft</span>
        </div>
        <input
          type="range"
          min={currentWorkType.rateMin}
          max={currentWorkType.rateMax}
          step={0.05}
          value={rate}
          onChange={e => handleRateChange(parseFloat(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #0EA5E9 ${ratePercent}%, rgba(255,255,255,0.1) ${ratePercent}%)`
          }}
        />
        <div className="mt-1.5 flex justify-between text-[10px] text-ink-faint">
          <span>${currentWorkType.rateMin.toFixed(2)}</span>
          <span className="text-ink-muted">NPCA range: ${currentWorkType.rateMin.toFixed(2)}–${currentWorkType.rateMax.toFixed(2)}</span>
          <span>${currentWorkType.rateMax.toFixed(2)}</span>
        </div>
      </div>

      {/* Result */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-ink-muted">Your Estimate</p>
        <p key={animKey} className="font-mono text-3xl font-bold text-ink animate-count-up">
          {formatCurrency(estimate)}
        </p>
        <p className="mt-1.5 text-xs text-ink-muted">
          {sqftOverride.toLocaleString()} sq ft × ${rate.toFixed(2)}/sq ft · {currentWorkType.label}
        </p>
      </div>

      {/* Expandable data sources */}
      <button
        onClick={() => setShowSources(s => !s)}
        className="flex w-full items-center justify-between text-xs text-ink-muted hover:text-ink transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5" />
          How we calculated the default
        </span>
        {showSources ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {showSources && (
        <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4 space-y-3 text-xs animate-fade-up">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Lot area source',   value: 'County parcel data (Regrid)' },
              { label: 'AI damage score',   value: `${lead.conditionScore}/10 — AI vision model` },
              { label: 'Work type logic',   value: `Score ${currentWorkType.scoreRange} → ${currentWorkType.label}` },
              { label: 'Rate benchmark',    value: 'NPCA 2024 national average' },
            ].map(item => (
              <div key={item.label}>
                <p className="text-ink-faint mb-0.5">{item.label}</p>
                <p className="text-ink-muted font-medium">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-[rgba(255,255,255,0.05)] pt-3 text-ink-faint leading-relaxed">
            We apply industry-published rate ranges — you decide if your local market runs higher or lower.
            We score surfaces, measure lots, and do the math. You close the job.
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SKYFI TEASER (post-purchase add-on)
───────────────────────────────────────────── */
function SkyFiTeaser({ lead }: { lead: Lead }) {
  
  return (
    <div className="glass rounded-xl overflow-hidden border border-[rgba(255,255,255,0.07)]">
      {/* Blurred satellite teaser */}
      <div className="relative h-40 overflow-hidden">
        <LotImage lat={lead.lat} lng={lead.lng} zoom={19} className="h-full w-full object-cover" />
        {/* Scan lines overlay */}
        <div className="scan-lines absolute inset-0" />
        {/* Frost overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-4 py-1.5">
            <Satellite className="h-3.5 w-3.5 text-accent-bright" />
            <span className="text-xs font-semibold text-white">High-res verification image available</span>
          </div>
          <p className="text-[11px] text-white/50">Captured Jan 2025 · 30cm resolution</p>
        </div>
      </div>

      {/* Add-on CTA */}
      <div className="p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ink">Verification Shot</p>
          <p className="text-xs text-ink-muted mt-0.5">
            Full-res satellite image with exact capture date. Useful for estimating surface area and damage depth before your site visit.
          </p>
        </div>
        <button className="btn-primary shrink-0 text-sm py-2.5 px-5">
          Add $19
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCORE BADGE HELPER
───────────────────────────────────────────── */
function scoreBadgeClass(score: number) {
  if (score >= 9) return 'score-badge-critical';
  if (score >= 7) return 'score-badge-high';
  if (score >= 4) return 'score-badge-medium';
  return 'score-badge-low';
}

function scoreLabel(score: number) {
  if (score >= 9) return 'CRITICAL';
  if (score >= 7) return 'HIGH';
  if (score >= 4) return 'MEDIUM';
  return 'LOW';
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function LeadDetailPage() {
  const params      = useParams();
  const searchParams = useSearchParams();
  const router      = useRouter();
  const id          = params.id as string;
  const defaultType = (searchParams.get('type') as 'shared' | 'exclusive') ?? 'exclusive';
  const success     = searchParams.get('success') === '1';

  const [lead, setLead]       = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'SHARED' | 'EXCLUSIVE'>(
    defaultType === 'exclusive' ? 'EXCLUSIVE' : 'SHARED'
  );

  useEffect(() => {
    fetch(`/api/leads/${id}`)
      .then(r => r.json())
      .then(data => { setLead(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handlePurchase() {
    setPurchasing(true);
    try {
      const res  = await fetch(`/api/leads/${id}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: purchaseType }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.alreadyOwned || data.usedCredit) {
        router.refresh();
        setLead(prev => prev ? { ...prev, locked: false } : prev);
      } else if (!res.ok) {
        alert(data.error ?? 'Purchase failed');
      }
    } catch {
      alert('Something went wrong');
    } finally {
      setPurchasing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
          <p className="text-sm text-ink-muted">Loading lead intelligence…</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-base">
        <p className="text-ink-muted">Lead not found or no longer available.</p>
        <Link href="/leads" className="text-sm text-accent hover:text-accent-bright">← Back to leads</Link>
      </div>
    );
  }

  const damages   = JSON.parse(lead.damageTypes || '[]') as string[];
  const isExclusive = lead.exclusiveBuyerId && lead.exclusiveExpiresAt && new Date(lead.exclusiveExpiresAt) > new Date();

  // Map image: locked = blurred crop, unlocked = full precise location
  const mapZoom       = lead.locked ? 16 : 18;
  const googleMapsUrl = `https://www.google.com/maps/@${lead.lat},${lead.lng},18z`;

  const vaguePropType: Record<string, string> = {
    COMMERCIAL_PARKING: 'Commercial lot',
    RETAIL_STRIP:       'Strip mall',
    OFFICE_PARK:        'Office park',
    INDUSTRIAL:         'Industrial lot',
    MIXED_USE:          'Mixed-use property',
  };
  const vagueLabel = vaguePropType[lead.propertyType] ?? 'Commercial lot';

  return (
    <div className="min-h-screen bg-base">
      {/* ── Nav ─────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-base/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15">
              <Building2 className="h-4 w-4 text-accent" />
            </div>
            LotLeads
          </Link>
          <span className="text-ink-faint">/</span>
          <Link href="/leads" className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Leads
          </Link>
          {lead.propertyName && (
            <>
              <span className="text-ink-faint">/</span>
              <span className="text-sm text-ink truncate">{lead.propertyName}</span>
            </>
          )}
        </div>
      </nav>

      {/* ── Success banner ──────────────────── */}
      {success && (
        <div className="border-b border-score-low/20 bg-score-low/5 px-4 py-3 text-center text-sm font-semibold text-score-low">
          ✓ Purchase complete — contact information is now unlocked below
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">

          {/* ── LEFT COLUMN ─────────────────── */}
          <div className="space-y-6">

            {/* Map / aerial image */}
            <div className="relative overflow-hidden rounded-2xl" style={{ height: 320 }}>
              {/* Base image */}
              <LotImage lat={lead.lat} lng={lead.lng} zoom={lead.locked ? 19 : 18} className={`h-full w-full transition-all duration-500 ${lead.locked ? 'blur-locked' : ''}`} />

              {/* Scan lines for teaser feel */}
              {lead.locked && <div className="scan-lines absolute inset-0 pointer-events-none" />}

              {/* Dark vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

              {/* Lock overlay */}
              {lead.locked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="glass-bright flex flex-col items-center gap-2 rounded-xl px-6 py-4 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <Lock className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-white">{vagueLabel} · {lead.city}, {lead.state}</p>
                    <p className="text-xs text-white/50">Exact location unlocks after purchase</p>
                  </div>
                </div>
              )}

              {/* Unlocked: View on Google Maps link */}
              {!lead.locked && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Open in Maps
                </a>
              )}

              {/* Score badge — always visible */}
              <div className={`absolute left-3 top-3 flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold backdrop-blur-sm ${scoreBadgeClass(lead.conditionScore)}`}>
                <span>{lead.conditionScore}/10</span>
                <span>·</span>
                <span>{scoreLabel(lead.conditionScore)}</span>
              </div>
            </div>

            {/* Lead headline + stats */}
            <div className="glass rounded-2xl p-6 space-y-5">
              {/* Title row */}
              <div className="flex items-start gap-4">
                <ScoreRing score={lead.conditionScore} />
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-ink leading-tight">
                    {lead.locked
                      ? `${vagueLabel} — ${lead.city}, ${lead.state}`
                      : (lead.address ?? `${vagueLabel} — ${lead.city}, ${lead.state}`)}
                  </h1>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {lead.locked
                      ? `${lead.city}, ${lead.state} · location blurred`
                      : `${lead.address}, ${lead.city}, ${lead.state} ${lead.zip}`}
                  </p>
                  {/* Verticals */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {lead.vertical.map(v => (
                      <span key={v} className="inline-flex items-center gap-1 rounded-full border border-accent/20 bg-accent/8 px-3 py-1 text-xs font-medium text-accent-bright">
                        {v === 'PAVING' ? '🏗' : '🖌'} {v === 'PAVING' ? 'Paving' : 'Striping'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Condition',  value: `${lead.conditionScore}/10`, mono: true },
                  { label: 'Lot Size',   value: lead.lotSqFt ? `${lead.lotSqFt.toLocaleString()} sq ft` : '—', mono: true },
                  { label: 'Job Min',    value: formatCurrency(lead.estimatedJobMin), mono: true },
                  { label: 'Job Max',    value: formatCurrency(lead.estimatedJobMax), mono: true },
                ].map(item => (
                  <div key={item.label} className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
                    <p className="text-[11px] uppercase tracking-wider text-ink-faint">{item.label}</p>
                    <p className={`mt-1 font-bold text-ink ${item.mono ? 'font-mono' : ''}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Damage tags */}
              <div>
                <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-ink-faint">AI Damage Assessment</p>
                <div className="flex flex-wrap gap-2">
                  {damages.map(d => (
                    <span key={d} className="rounded-full border border-score-high/25 bg-score-high/8 px-3 py-1 text-xs font-medium text-score-high">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── CALCULATOR ────────────────── */}
            <EstimateCalculator lead={lead} />

            {/* ── CONTACT (locked/unlocked) ─── */}
            <div className="glass rounded-2xl p-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
                {lead.locked
                  ? <Lock className="h-4 w-4 text-ink-muted" />
                  : <Unlock className="h-4 w-4 text-score-low" />}
                Property Owner / Manager
              </h3>

              {lead.locked ? (
                <div className="space-y-2.5">
                  {[
                    { Icon: User,  label: 'Name',  placeholder: '████████ ████████' },
                    { Icon: Phone, label: 'Phone', placeholder: '███-███-████' },
                    { Icon: Mail,  label: 'Email', placeholder: '████@████████.com' },
                  ].map(({ Icon, label, placeholder }) => (
                    <div key={label} className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] px-4 py-3">
                      <Icon className="h-4 w-4 shrink-0 text-ink-faint" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-ink-faint">{label}</p>
                        <p className="font-mono text-sm text-ink-faint select-none">{placeholder}</p>
                      </div>
                    </div>
                  ))}
                  <p className="text-center text-xs text-ink-faint pt-1">Unlock this lead to reveal contact information</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {[
                    { Icon: User,  label: 'Name',  value: lead.propertyManagerName },
                    { Icon: Phone, label: 'Phone', value: lead.propertyManagerPhone },
                    { Icon: Mail,  label: 'Email', value: lead.propertyManagerEmail },
                  ].filter(i => i.value).map(({ Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 rounded-lg border border-score-low/20 bg-score-low/5 px-4 py-3">
                      <Icon className="h-4 w-4 shrink-0 text-score-low" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-score-low/70">{label}</p>
                        <p className="text-sm font-semibold text-ink">{value}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 rounded-lg border border-accent/15 bg-accent/5 px-4 py-3 text-xs text-accent-bright">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    Verified from county assessor records via Regrid
                  </div>
                </div>
              )}
            </div>

            {/* SkyFi verification add-on (post-purchase) */}
            {!lead.locked && <SkyFiTeaser lead={lead} />}
          </div>

          {/* ── RIGHT COLUMN — Purchase panel ── */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            {lead.locked ? (
              <div className="glass rounded-2xl p-6 space-y-5 shadow-card">
                <div>
                  <h2 className="text-lg font-bold text-ink">Unlock this lead</h2>
                  <p className="mt-1 text-xs text-ink-muted">Full address + manager contact delivered instantly</p>
                </div>

                {!isExclusive && (
                  <div className="space-y-2">
                    {/* Exclusive option */}
                    <button
                      onClick={() => setPurchaseType('EXCLUSIVE')}
                      className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                        purchaseType === 'EXCLUSIVE'
                          ? 'border-accent/50 bg-accent/8 shadow-glow-accent'
                          : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.16)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Star className="h-3.5 w-3.5 text-accent" />
                            <span className="text-sm font-semibold text-ink">Exclusive</span>
                            <span className="rounded-full bg-accent/15 px-2 py-px text-[10px] font-bold text-accent-bright">BEST</span>
                          </div>
                          <p className="text-xs text-ink-muted">Only you for 72 hours · then shared pool</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono text-2xl font-bold text-ink">$149</span>
                        </div>
                      </div>
                    </button>

                    {/* Shared option */}
                    <button
                      onClick={() => setPurchaseType('SHARED')}
                      className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                        purchaseType === 'SHARED'
                          ? 'border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.04)]'
                          : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.16)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-sm font-semibold text-ink">Shared</span>
                          <p className="mt-1 text-xs text-ink-muted">
                            {3 - lead.sharedBuyerCount} of 3 slots remaining
                          </p>
                          {/* Slot dots */}
                          <div className="mt-2 flex gap-1">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className={`h-1.5 w-5 rounded-full ${i < lead.sharedBuyerCount ? 'bg-ink-faint' : 'bg-score-low'}`} />
                            ))}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono text-2xl font-bold text-ink">$65</span>
                        </div>
                      </div>
                    </button>
                  </div>
                )}

                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="btn-primary w-full py-3.5 text-base"
                >
                  {purchasing && <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                  {purchasing ? 'Processing…' : `Unlock for $${purchaseType === 'EXCLUSIVE' ? 149 : 65}`}
                </button>

                <ul className="space-y-2">
                  {[
                    'Instant delivery after payment',
                    'Property address + parcel data',
                    'Manager name, phone & email',
                    purchaseType === 'EXCLUSIVE' ? '72-hr exclusive window' : 'Up to 3 contractors max',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-ink-muted">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 text-accent/70" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="border-t border-[rgba(255,255,255,0.06)] pt-4 text-center">
                  <p className="text-xs text-ink-faint mb-2">Get 5 exclusive leads/month</p>
                  <Link
                    href="/auth/signup?plan=pro"
                    className="text-sm font-semibold text-accent hover:text-accent-bright transition-colors"
                  >
                    Pro — $297/mo →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-6 border border-score-low/20">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-score-low/10">
                    <Unlock className="h-4.5 w-4.5 text-score-low" />
                  </div>
                  <h2 className="text-base font-bold text-ink">Lead unlocked</h2>
                </div>
                <p className="text-sm text-ink-muted">
                  Contact information is visible above. Use the estimate calculator to prep your proposal before the call.
                </p>
                <div className="mt-5 border-t border-[rgba(255,255,255,0.06)] pt-4">
                  <Link href="/leads" className="text-sm font-semibold text-accent hover:text-accent-bright transition-colors">
                    ← Browse more leads
                  </Link>
                </div>
              </div>
            )}

            {/* AI confidence note */}
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
              <Zap className="h-4 w-4 shrink-0 text-accent mt-0.5" />
              <p className="text-xs text-ink-muted leading-relaxed">
                AI-scored from aerial imagery. Surface deterioration is detected via computer vision — oxidation, cracking patterns, and striping fade. Estimate uses NPCA published rates for this work type.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
