'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MapPin, Lock, Zap, Building2, Star } from 'lucide-react';
import LotImage from '@/components/LotImage';
import { formatCurrency } from '@/lib/utils';

type Lead = {
  id: string;
  city: string;
  state: string;
  market: string;
  conditionScore: number;
  urgency: string;
  damageTypes: string;
  estimatedJobMin: number;
  estimatedJobMax: number;
  propertyType: string;
  lotSqFt: number | null;
  blurredImageUrl: string | null;
  lat: number;
  lng: number;
  vertical: string[];
  status: string;
  sharedBuyerCount: number;
  maxSharedBuyers: number;
  exclusiveBuyerId: string | null;
  exclusiveExpiresAt: string | null;
  createdAt: string;
};

const MARKETS = [
  { id: '', label: 'All Markets' },
  { id: 'chicago_il', label: 'Chicago, IL' },
  { id: 'dallas_tx', label: 'Dallas, TX' },
  { id: 'phoenix_az', label: 'Phoenix, AZ' },
];

const VERTICALS = [
  { id: '', label: 'All Types' },
  { id: 'PAVING', label: 'Paving' },
  { id: 'STRIPING', label: 'Striping' },
];



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

function scoreColor(score: number) {
  if (score >= 9) return '#FF453A';
  if (score >= 7) return '#FF6B35';
  if (score >= 4) return '#FF9F0A';
  return '#30D158';
}

/* ── Lead Card ─────────────────────────── */
function LeadCard({ lead, index }: { lead: Lead; index: number }) {
  const damages        = JSON.parse(lead.damageTypes || '[]') as string[];
  const isExcLocked    = lead.exclusiveBuyerId && lead.exclusiveExpiresAt && new Date(lead.exclusiveExpiresAt) > new Date();
  const vagueType      = 'Commercial Lot';
  const slotsLeft      = lead.maxSharedBuyers - lead.sharedBuyerCount;
  const color          = scoreColor(lead.conditionScore);

  return (
    <Link
      href={`/leads/${lead.id}?type=exclusive`}
      className="group relative block overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] transition-all duration-300 hover:border-[rgba(255,255,255,0.14)] hover:bg-[rgba(255,255,255,0.04)] hover:shadow-card-hover animate-fade-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Aerial teaser */}
      <div className="relative h-44 overflow-hidden">
        <LotImage lat={lead.lat} lng={lead.lng} zoom={19} className="h-full w-full blur-locked group-hover:brightness-75 transition-all duration-500" />
        {/* Scan lines */}
        <div className="scan-lines absolute inset-0 pointer-events-none" />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Score ring overlay */}
        <div className="absolute bottom-3 left-3">
          <div
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold backdrop-blur-sm"
            style={{
              borderColor: `${color}40`,
              background: `${color}18`,
              color,
            }}
          >
            <span className="font-mono">{lead.conditionScore}/10</span>
            <span>·</span>
            <span>{scoreLabel(lead.conditionScore)}</span>
          </div>
        </div>

        {/* Lock icon */}
        <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
          <Lock className="h-3.5 w-3.5 text-white/70" />
        </div>

        {/* Exclusive locked ribbon */}
        {isExcLocked && (
          <div className="absolute left-0 top-5 flex items-center gap-1.5 bg-score-medium/20 border-r border-y border-score-medium/30 pl-3 pr-2.5 py-1 text-[10px] font-bold text-score-medium">
            <Star className="h-3 w-3" />
            EXCLUSIVELY LOCKED
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3.5">
        {/* Property type + location */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-0.5">{vagueType}</p>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <MapPin className="h-3.5 w-3.5 text-ink-muted shrink-0" />
            {lead.city}, {lead.state}
          </p>
        </div>

        {/* Job estimate */}
        <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
          <p className="text-[10px] uppercase tracking-wider text-ink-faint mb-1">Est. Job Size</p>
          <p className="font-mono text-base font-bold text-ink">
            {formatCurrency(lead.estimatedJobMin)}–{formatCurrency(lead.estimatedJobMax)}
          </p>
          {lead.lotSqFt && (
            <p className="mt-0.5 text-[11px] text-ink-muted">{lead.lotSqFt.toLocaleString()} sq ft</p>
          )}
        </div>

        {/* Damage preview */}
        {damages.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {damages.slice(0, 2).map(d => (
              <span key={d} className="rounded-full bg-score-high/8 border border-score-high/20 px-2.5 py-0.5 text-[10px] font-medium text-score-high">
                {d}
              </span>
            ))}
            {damages.length > 2 && (
              <span className="rounded-full border border-[rgba(255,255,255,0.07)] px-2.5 py-0.5 text-[10px] text-ink-muted">
                +{damages.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Redacted contact */}
        <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.015)] px-3 py-2">
          <p className="text-[10px] text-ink-faint mb-1">Property manager contact</p>
          <p className="font-mono text-xs text-ink-faint select-none">████████ ████ · ████@████.com</p>
        </div>

        {/* Slot availability */}
        {!isExcLocked && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`h-1 w-6 rounded-full ${i < lead.sharedBuyerCount ? 'bg-ink-faint' : 'bg-score-low'}`} />
              ))}
            </div>
            <span className="text-[11px] text-ink-muted">{slotsLeft} shared slot{slotsLeft !== 1 ? 's' : ''} left</span>
          </div>
        )}

        {/* CTA */}
        {isExcLocked ? (
          <div className="rounded-lg border border-score-medium/20 bg-score-medium/6 px-3 py-2 text-center text-xs text-score-medium">
            Available after exclusive window
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div
              onClick={e => { e.preventDefault(); window.location.href = `/leads/${lead.id}?type=shared`; }}
              className="rounded-lg border border-[rgba(255,255,255,0.12)] px-3 py-2.5 text-center text-xs font-semibold text-ink-muted hover:border-[rgba(255,255,255,0.25)] hover:text-ink transition-all cursor-pointer"
            >
              Shared $65
            </div>
            <div className="rounded-lg bg-accent px-3 py-2.5 text-center text-xs font-semibold text-white hover:bg-accent-bright transition-colors cursor-pointer shadow-glow-accent">
              Exclusive $149
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

/* ── Main page ─────────────────────────── */
export default function LeadsPage() {
  const [leads, setLeads]           = useState<Lead[]>([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [market, setMarket]         = useState('');
  const [vertical, setVertical]     = useState('');
  const [minScore, setMinScore]     = useState(1);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '12',
        minScore: String(minScore),
        ...(market   && { market }),
        ...(vertical && { vertical }),
      });
      const res  = await fetch(`/api/leads?${params}`);
      const data = await res.json();
      setLeads(data.leads ?? []);
      setTotal(data.pagination?.total ?? 0);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, market, vertical, minScore]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const selectClass = "rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-ink-muted hover:border-[rgba(255,255,255,0.2)] focus:border-accent focus:outline-none transition-colors";

  return (
    <div className="min-h-screen bg-base bg-grid" style={{ backgroundSize: '40px 40px' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-base/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-ink">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15">
              <Building2 className="h-4 w-4 text-accent" />
            </div>
            LotLeads
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-ink-muted hover:text-ink transition-colors">Sign in</Link>
            <Link
              href="/auth/signup"
              className="btn-primary py-2 px-4 text-sm"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/8 px-3 py-1 text-xs font-medium text-accent-bright">
              <Zap className="h-3 w-3" />
              Live Intelligence Feed
            </div>
          </div>
          <h1 className="text-3xl font-bold text-ink tracking-tight">Available Leads</h1>
          <p className="mt-2 text-ink-muted">
            {total.toLocaleString()} lots scanned · sorted by deterioration score
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3 items-center">
          <select
            value={market}
            onChange={e => { setMarket(e.target.value); setPage(1); }}
            className={selectClass}
          >
            {MARKETS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>

          <select
            value={vertical}
            onChange={e => { setVertical(e.target.value); setPage(1); }}
            className={selectClass}
          >
            {VERTICALS.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>

          <select
            value={minScore}
            onChange={e => { setMinScore(parseInt(e.target.value)); setPage(1); }}
            className={selectClass}
          >
            <option value={1}>All scores</option>
            <option value={5}>Score 5+ (Moderate+)</option>
            <option value={7}>Score 7+ (High priority)</option>
            <option value={9}>Score 9+ (Critical only)</option>
          </select>

          <div className="ml-auto flex items-center gap-1.5 text-xs text-ink-muted">
            <div className="h-1.5 w-1.5 rounded-full bg-score-low animate-pulse" />
            New lots added weekly
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-96 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] animate-pulse" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[rgba(255,255,255,0.1)] py-20 text-center">
            <p className="text-ink-muted">No leads match your filters. Try adjusting the score range or market.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {leads.map((lead, i) => (
                <LeadCard key={lead.id} lead={lead} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-ghost disabled:opacity-30"
                >
                  Previous
                </button>
                <span className="px-4 text-sm text-ink-muted font-mono">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-ghost disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
