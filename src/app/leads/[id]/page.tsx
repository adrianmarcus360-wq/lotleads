'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Lock, Unlock, AlertTriangle, CheckCircle, ArrowLeft, Building2,
  Phone, Mail, User, Loader2, Star
} from 'lucide-react';
import { getConditionLabel, formatCurrency } from '@/lib/utils';

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

export default function LeadDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const defaultType = (searchParams.get('type') as 'shared' | 'exclusive') ?? 'exclusive';
  const success = searchParams.get('success') === '1';

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'SHARED' | 'EXCLUSIVE'>(
    defaultType === 'exclusive' ? 'EXCLUSIVE' : 'SHARED'
  );

  useEffect(() => {
    fetch(`/api/leads/${id}`)
      .then((r) => r.json())
      .then((data) => { setLead(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handlePurchase() {
    setPurchasing(true);
    try {
      const res = await fetch(`/api/leads/${id}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: purchaseType }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.alreadyOwned || data.usedCredit) {
        router.refresh();
        setLead((prev) => prev ? { ...prev, locked: false } : prev);
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Lead not found or no longer available.</p>
        <Link href="/leads" className="text-blue-600 hover:underline">Back to leads</Link>
      </div>
    );
  }

  const condition = getConditionLabel(lead.conditionScore);
  const damages = JSON.parse(lead.damageTypes || '[]') as string[];
  const isExclusive = lead.exclusiveBuyerId && lead.exclusiveExpiresAt && new Date(lead.exclusiveExpiresAt) > new Date();
  const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${lead.lat},${lead.lng}&zoom=18&size=800x400&markers=${lead.lat},${lead.lng}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex h-16 items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-gray-900">LotLeads</span>
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <Link href="/leads" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
              Back to leads
            </Link>
          </div>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3 text-center text-sm font-semibold text-green-700">
          ✅ Purchase complete! Contact information is now unlocked below.
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Left: Lead details */}
          <div className="space-y-6">
            {/* Aerial map */}
            <div className="relative h-64 overflow-hidden rounded-2xl bg-gray-800 sm:h-80">
              <img
                src={mapUrl}
                alt="Lot aerial view"
                className={`h-full w-full object-cover ${lead.locked ? 'blur-sm scale-105' : ''}`}
                loading="lazy"
              />
              {lead.locked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-white/20 bg-black/50 px-6 py-4 backdrop-blur-sm">
                    <Lock className="h-6 w-6 text-white" />
                    <p className="font-semibold text-white">Unlock to see exact location</p>
                  </div>
                </div>
              )}
              <div className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white ${condition.bg.replace('100', '500')}`}>
                Score {lead.conditionScore}/10 — {condition.label}
              </div>
            </div>

            {/* Details */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h1 className="mb-1 text-xl font-bold text-gray-900">
                {lead.locked ? `${lead.propertyType?.replace(/_/g, ' ')} lot` : lead.address}
              </h1>
              <p className="flex items-center gap-1 text-gray-500">
                <MapPin className="h-4 w-4" />
                {lead.locked ? `${lead.city}, ${lead.state}` : `${lead.address}, ${lead.city}, ${lead.state} ${lead.zip}`}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: 'Condition', value: `${lead.conditionScore}/10` },
                  { label: 'Lot size', value: lead.lotSqFt ? `${lead.lotSqFt.toLocaleString()} sq ft` : 'N/A' },
                  { label: 'Est. job min', value: formatCurrency(lead.estimatedJobMin) },
                  { label: 'Est. job max', value: formatCurrency(lead.estimatedJobMax) },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="mt-0.5 font-bold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="mb-3 font-semibold text-gray-900">Damage assessment</h3>
                <div className="flex flex-wrap gap-2">
                  {damages.map((d) => (
                    <span key={d} className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-medium text-red-700">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="mb-3 font-semibold text-gray-900">Vertical opportunity</h3>
                <div className="flex gap-2">
                  {lead.vertical.map((v) => (
                    <span key={v} className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700">
                      {v === 'PAVING' ? '🏗️ Paving' : '🖌️ Striping'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact info (locked or unlocked) */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                {lead.locked ? <Lock className="h-4 w-4 text-gray-400" /> : <Unlock className="h-4 w-4 text-green-500" />}
                Property manager contact
              </h3>

              {lead.locked ? (
                <div className="space-y-3">
                  {[
                    { icon: User, label: 'Name', value: '████████ ████' },
                    { icon: Phone, label: 'Phone', value: '███-███-████' },
                    { icon: Mail, label: 'Email', value: '████@████████.com' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                      <item.icon className="h-4 w-4 shrink-0 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className="font-mono text-sm text-gray-300">{item.value}</p>
                      </div>
                    </div>
                  ))}
                  <p className="text-center text-xs text-gray-400 mt-2">
                    Unlock this lead to reveal contact information
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { icon: User, label: 'Name', value: lead.propertyManagerName },
                    { icon: Phone, label: 'Phone', value: lead.propertyManagerPhone },
                    { icon: Mail, label: 'Email', value: lead.propertyManagerEmail },
                  ].filter(item => item.value).map((item) => (
                    <div key={item.label} className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                      <item.icon className="h-4 w-4 shrink-0 text-green-600" />
                      <div>
                        <p className="text-xs text-green-700">{item.label}</p>
                        <p className="font-semibold text-gray-900">{item.value}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    Data verified from county assessor records
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Purchase panel */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            {lead.locked ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-gray-900">Unlock this lead</h2>

                {!isExclusive && (
                  <div className="mb-4 space-y-2">
                    <button
                      onClick={() => setPurchaseType('EXCLUSIVE')}
                      className={`w-full rounded-xl border-2 p-4 text-left transition-colors ${
                        purchaseType === 'EXCLUSIVE'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-gray-900">Exclusive</span>
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">Best</span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">Only you for 72 hours</p>
                        </div>
                        <span className="text-xl font-extrabold text-gray-900">$149</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setPurchaseType('SHARED')}
                      className={`w-full rounded-xl border-2 p-4 text-left transition-colors ${
                        purchaseType === 'SHARED'
                          ? 'border-gray-400 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-gray-900">Shared</span>
                          <p className="mt-1 text-xs text-gray-500">
                            Up to 3 contractors — {3 - lead.sharedBuyerCount} slot{(3 - lead.sharedBuyerCount) !== 1 ? 's' : ''} left
                          </p>
                        </div>
                        <span className="text-xl font-extrabold text-gray-900">$65</span>
                      </div>
                    </button>
                  </div>
                )}

                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-base font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {purchasing && <Loader2 className="h-4 w-4 animate-spin" />}
                  {purchasing ? 'Processing...' : `Unlock for $${purchaseType === 'EXCLUSIVE' ? 149 : 65}`}
                </button>

                <ul className="mt-4 space-y-2 text-xs text-gray-500">
                  {[
                    'Instant delivery after payment',
                    'Property address + contact info',
                    '24-hr satisfaction guarantee',
                    purchaseType === 'EXCLUSIVE' ? '72-hour exclusive window' : 'Up to 3 contractors see this',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 border-t border-gray-100 pt-4 text-center">
                  <p className="text-xs text-gray-400 mb-2">Or get 5 exclusive leads/month</p>
                  <Link
                    href="/auth/signup?plan=pro"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Subscribe to Pro — $297/mo →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h2 className="text-lg font-bold text-green-900">Lead unlocked</h2>
                </div>
                <p className="text-sm text-green-700">
                  Contact information is visible above. Good luck closing this job!
                </p>
                <div className="mt-4 border-t border-green-200 pt-4">
                  <Link href="/leads" className="text-sm font-semibold text-blue-600 hover:underline">
                    ← Browse more leads
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
