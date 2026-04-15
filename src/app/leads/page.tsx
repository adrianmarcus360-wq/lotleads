'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MapPin, Lock, Filter, Search, Zap, Building2, ChevronRight } from 'lucide-react';
import { getConditionLabel, formatCurrency } from '@/lib/utils';

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

function getPropertyTypeLabel(type: string) {
  const labels: Record<string, string> = {
    COMMERCIAL_PARKING: 'Commercial Parking',
    RETAIL_STRIP: 'Retail Strip Mall',
    OFFICE_PARK: 'Office Park',
    INDUSTRIAL: 'Industrial',
    MIXED_USE: 'Mixed Use',
  };
  return labels[type] ?? type;
}

function getVerticalBadge(verticals: string[]) {
  if (verticals.includes('PAVING') && verticals.includes('STRIPING')) return '🏗️ Paving + Striping';
  if (verticals.includes('PAVING')) return '🏗️ Paving';
  if (verticals.includes('STRIPING')) return '🖌️ Striping';
  return '';
}

function SlotsIndicator({ current, max }: { current: number; max: number }) {
  const remaining = max - current;
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full ${i < current ? 'bg-gray-300' : 'bg-green-400'}`}
        />
      ))}
      <span className="text-gray-500">{remaining} shared slot{remaining !== 1 ? 's' : ''} left</span>
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const condition = getConditionLabel(lead.conditionScore);
  const damages = JSON.parse(lead.damageTypes || '[]') as string[];
  const isExclusiveLocked =
    lead.exclusiveBuyerId &&
    lead.exclusiveExpiresAt &&
    new Date(lead.exclusiveExpiresAt) > new Date();

  const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${lead.lat},${lead.lng}&zoom=18&size=600x300&markers=${lead.lat},${lead.lng}`;

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Map preview with blur */}
      <div className="relative h-44 bg-gradient-to-br from-gray-700 to-gray-900 overflow-hidden">
        {/* We show a satellite map centered on the lot but without revealing exact address */}
        <img
          src={mapUrl}
          alt="Lot aerial view"
          className="h-full w-full object-cover blur-md scale-110 opacity-60"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-white/20 bg-black/50 px-4 py-3 text-center backdrop-blur-sm">
            <Lock className="h-5 w-5 text-white" />
            <span className="text-xs font-semibold text-white">Address locked until purchase</span>
          </div>
        </div>

        {/* Score badge */}
        <div className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white ${condition.bg.replace('bg-', 'bg-').replace('100', '500')}`}>
          Score {lead.conditionScore}/10 — {condition.label}
        </div>

        {/* New badge */}
        {new Date(lead.createdAt) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) && (
          <div className="absolute right-3 top-3 rounded-full bg-blue-500 px-2.5 py-1 text-xs font-bold text-white">
            NEW
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-gray-900">{getPropertyTypeLabel(lead.propertyType)}</p>
            <p className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {lead.city}, {lead.state}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {getVerticalBadge(lead.vertical)}
          </span>
        </div>

        <div className="mb-3 space-y-1 text-sm">
          {lead.lotSqFt && (
            <p className="text-gray-600">📐 {lead.lotSqFt.toLocaleString()} sq ft</p>
          )}
          <p className="text-gray-600">
            💰 Est. job: {formatCurrency(lead.estimatedJobMin)} – {formatCurrency(lead.estimatedJobMax)}
          </p>
          {damages.length > 0 && (
            <p className="text-red-600 text-xs">⚠️ {damages.join(', ')}</p>
          )}
        </div>

        {/* Contact preview (locked) */}
        <div className="mb-4 rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">Property manager contact</p>
          <p className="font-mono text-xs text-gray-300">████████ ████ • ████@████.com</p>
        </div>

        {/* Slot availability */}
        {!isExclusiveLocked && (
          <div className="mb-4">
            <SlotsIndicator current={lead.sharedBuyerCount} max={lead.maxSharedBuyers} />
          </div>
        )}

        {isExclusiveLocked ? (
          <div className="rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-xs text-orange-700 text-center">
            🔒 Exclusively locked — available{' '}
            {lead.exclusiveExpiresAt &&
              new Date(lead.exclusiveExpiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/leads/${lead.id}?type=shared`}
              className="rounded-lg border border-blue-600 px-3 py-2 text-center text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              Shared $65
            </Link>
            <Link
              href={`/leads/${lead.id}?type=exclusive`}
              className="rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
            >
              Exclusive $149
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [market, setMarket] = useState('');
  const [vertical, setVertical] = useState('');
  const [minScore, setMinScore] = useState(1);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '12',
        minScore: String(minScore),
        ...(market && { market }),
        ...(vertical && { vertical }),
      });
      const res = await fetch(`/api/leads?${params}`);
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

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-7 w-7 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">LotLeads</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Page header */}
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900">Available Leads</h1>
          <p className="text-gray-500">
            {total.toLocaleString()} lots scanned across {MARKETS.length - 1} markets. Sorted by urgency.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <select
            value={market}
            onChange={(e) => { setMarket(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
          >
            {MARKETS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>

          <select
            value={vertical}
            onChange={(e) => { setVertical(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
          >
            {VERTICALS.map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>

          <select
            value={minScore}
            onChange={(e) => { setMinScore(parseInt(e.target.value)); setPage(1); }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
          >
            <option value={1}>All scores</option>
            <option value={5}>Score 5+ (Moderate+)</option>
            <option value={7}>Score 7+ (High Priority+)</option>
            <option value={9}>Score 9+ (Critical only)</option>
          </select>

          <div className="ml-auto flex items-center gap-1 text-sm text-gray-500">
            <Zap className="h-4 w-4 text-blue-500" />
            <span>New lots added weekly</span>
          </div>
        </div>

        {/* Lead grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-96 rounded-2xl border border-gray-200 bg-white animate-pulse" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <p className="text-gray-500">No leads match your filters. Try adjusting the market or score range.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
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
