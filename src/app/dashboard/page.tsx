import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Building2, MapPin, CheckCircle, Lock, TrendingUp, CreditCard, Zap } from 'lucide-react';
import { formatCurrency, getConditionLabel } from '@/lib/utils';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { checkout?: string; subscription?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const userId = session.user.id;

  const [user, purchases, subscription] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.purchase.findMany({
      where: { userId, status: 'COMPLETED' },
      include: {
        lead: {
          select: {
            id: true,
            city: true,
            state: true,
            conditionScore: true,
            estimatedJobMin: true,
            estimatedJobMax: true,
            address: true,
            propertyManagerName: true,
            propertyManagerPhone: true,
            propertyManagerEmail: true,
            propertyType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.subscription.findUnique({ where: { userId } }),
  ]);

  const totalSpent = purchases.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-7 w-7 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">LotLeads</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/leads" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                Browse Leads
              </Link>
              <span className="text-sm text-gray-600">{user?.name ?? user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {searchParams.subscription === 'success' && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3 text-center text-sm font-semibold text-green-700">
          ✅ Pro subscription activated! Your 5 exclusive leads will be delivered soon.
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0] ?? 'there'}</h1>
          <p className="text-gray-500 mt-1">
            {purchases.length} lead{purchases.length !== 1 ? 's' : ''} purchased · {formatCurrency(totalSpent / 100)} total invested
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { label: 'Leads purchased', value: String(purchases.length), icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total invested', value: formatCurrency(totalSpent / 100), icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50' },
            {
              label: subscription?.status === 'ACTIVE' ? 'Pro credits left' : 'Plan',
              value: subscription?.status === 'ACTIVE' ? `${subscription.leadsRemaining}/5` : 'Free',
              icon: Zap,
              color: 'text-purple-600',
              bg: 'bg-purple-50',
            },
            { label: 'Markets active', value: String(new Set(purchases.map((p) => p.lead.city)).size || 0), icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Pro CTA */}
        {!subscription || subscription.status !== 'ACTIVE' ? (
          <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-blue-900">Upgrade to Pro</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Get 5 exclusive leads auto-delivered every month before they hit the shared pool. $297/month.
                </p>
              </div>
              <Link
                href="/api/stripe/subscription"
                className="shrink-0 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 text-center"
                onClick={() => {
                  fetch('/api/stripe/subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plan: 'PRO' }),
                  }).then((r) => r.json()).then((d) => { if (d.url) window.location.href = d.url; });
                }}
              >
                Start Pro — $297/mo
              </Link>
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-2xl border border-purple-200 bg-purple-50 p-6">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-purple-600" />
              <div>
                <h3 className="font-bold text-purple-900">Pro Plan Active</h3>
                <p className="text-sm text-purple-700">
                  {subscription.leadsRemaining} exclusive lead{subscription.leadsRemaining !== 1 ? 's' : ''} remaining this month.
                  Resets {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Purchased leads */}
        <div>
          <h2 className="mb-4 text-lg font-bold text-gray-900">Your Leads</h2>
          {purchases.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
              <MapPin className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="font-medium text-gray-500">No leads yet</p>
              <p className="mt-1 text-sm text-gray-400">
                Browse available lots and unlock your first lead.
              </p>
              <Link
                href="/leads"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Browse Leads
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {purchases.map((purchase) => {
                const condition = getConditionLabel(purchase.lead.conditionScore);
                return (
                  <div key={purchase.id} className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${condition.bg}`}>
                          <span className={`text-sm font-bold ${condition.color}`}>{purchase.lead.conditionScore}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {purchase.lead.address ?? `${purchase.lead.propertyType} — ${purchase.lead.city}, ${purchase.lead.state}`}
                          </p>
                          <p className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="h-3.5 w-3.5" />
                            {purchase.lead.city}, {purchase.lead.state}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                            {purchase.lead.propertyManagerPhone && (
                              <span className="flex items-center gap-1">
                                📞 {purchase.lead.propertyManagerPhone}
                              </span>
                            )}
                            {purchase.lead.propertyManagerEmail && (
                              <span className="flex items-center gap-1">
                                ✉️ {purchase.lead.propertyManagerEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          purchase.type === 'EXCLUSIVE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {purchase.type === 'EXCLUSIVE' ? '⭐ Exclusive' : 'Shared'}
                        </span>
                        <Link
                          href={`/leads/${purchase.lead.id}`}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
