import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Building2, DollarSign, Users, MapPin, TrendingUp, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== 'ADMIN') redirect('/dashboard');

  const [
    totalUsers,
    totalLeads,
    totalPurchases,
    revenueResult,
    activeSubscriptions,
    recentPurchases,
    leadsByMarket,
    recentUsers,
  ] = await Promise.all([
    db.user.count(),
    db.lead.count(),
    db.purchase.count({ where: { status: 'COMPLETED' } }),
    db.purchase.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
    db.subscription.count({ where: { status: 'ACTIVE' } }),
    db.purchase.findMany({
      where: { status: 'COMPLETED' },
      include: {
        user: { select: { email: true, name: true, company: true } },
        lead: { select: { city: true, state: true, conditionScore: true, address: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    db.lead.groupBy({
      by: ['market'],
      _count: { id: true },
    }),
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, email: true, name: true, company: true, createdAt: true, role: true },
    }),
  ]);

  const totalRevenue = revenueResult._sum.amount ?? 0;
  const subscriptionRevenue = activeSubscriptions * 29700;
  const mrr = subscriptionRevenue / 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-7 w-7 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">LotLeads Admin</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/leads" className="text-sm text-gray-600 hover:text-gray-900">Live site</Link>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">My account</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Overview</h1>

        {/* KPIs */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            { label: 'Total revenue', value: formatCurrency(totalRevenue / 100), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'MRR (subscriptions)', value: formatCurrency(mrr), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active subscribers', value: String(activeSubscriptions), icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Total users', value: String(totalUsers), icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Leads in DB', value: String(totalLeads), icon: MapPin, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Total purchases', value: String(totalPurchases), icon: DollarSign, color: 'text-gray-600', bg: 'bg-gray-50' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent purchases */}
          <div>
            <h2 className="mb-4 text-lg font-bold text-gray-900">Recent Purchases</h2>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Buyer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Lead</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentPurchases.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{p.user.name ?? p.user.email}</p>
                        <p className="text-xs text-gray-400">{p.user.company}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700">{p.lead.city}, {p.lead.state}</p>
                        <p className="text-xs text-gray-400">Score {p.lead.conditionScore}/10</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          p.type === 'EXCLUSIVE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {p.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {formatCurrency(p.amount / 100)}
                      </td>
                    </tr>
                  ))}
                  {recentPurchases.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400">No purchases yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent users + Market breakdown */}
          <div className="space-y-6">
            <div>
              <h2 className="mb-4 text-lg font-bold text-gray-900">Leads by Market</h2>
              <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
                {leadsByMarket.map((m) => (
                  <div key={m.market} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{m.market}</span>
                    <span className="font-bold text-gray-900">{m._count.id} lots</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-bold text-gray-900">Recent Signups</h2>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{u.name ?? u.email}</p>
                          <p className="text-xs text-gray-400">{u.company ?? u.email}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
