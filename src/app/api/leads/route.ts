import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { type NextRequest } from 'next/server';
import { DEMO_LEADS } from '@/lib/demo-leads';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const city     = searchParams.get('city');
  const market   = searchParams.get('market');
  const vertical = searchParams.get('vertical'); // PAVING | STRIPING
  const minScore = parseInt(searchParams.get('minScore') ?? '1');
  const maxScore = parseInt(searchParams.get('maxScore') ?? '10');
  const type     = searchParams.get('type'); // shared | exclusive | available
  const page     = parseInt(searchParams.get('page') ?? '1');
  const limit    = Math.min(parseInt(searchParams.get('limit') ?? '12'), 50);
  const skip     = (page - 1) * limit;

  const where: Record<string, unknown> = {
    conditionScore: { gte: minScore, lte: maxScore },
    status: { in: ['AVAILABLE', 'PARTIALLY_SOLD'] },
  };

  if (market)   where.market   = market;
  if (city)     where.city     = { contains: city, mode: 'insensitive' };
  if (vertical) where.vertical = { has: vertical };

  if (type === 'exclusive') {
    where.exclusiveBuyerId = null;
    where.status = 'AVAILABLE';
  }

  // ── Try production DB first ───────────────────────────────────────────────
  try {
    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        select: {
          id: true,
          city: true,
          state: true,
          market: true,
          conditionScore: true,
          urgency: true,
          damageTypes: true,
          estimatedJobMin: true,
          estimatedJobMax: true,
          propertyType: true,
          lotSqFt: true,
          blurredImageUrl: true,
          aerialImageUrl: true,
          lat: true,
          lng: true,
          vertical: true,
          status: true,
          sharedBuyerCount: true,
          maxSharedBuyers: true,
          exclusiveBuyerId: true,
          exclusiveExpiresAt: true,
          createdAt: true,
        },
        orderBy: [{ conditionScore: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      db.lead.count({ where }),
    ]);

    // If DB has real data, use it
    if (total > 0) {
      return NextResponse.json({
        leads,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }
  } catch {
    // DB not reachable — fall through to demo data
  }

  // ── Demo data fallback ────────────────────────────────────────────────────
  // Filter demo leads to match query params
  let demo = DEMO_LEADS.filter(l => {
    if (l.conditionScore < minScore || l.conditionScore > maxScore) return false;
    if (market && l.market !== market) return false;
    if (city && !l.city.toLowerCase().includes(city.toLowerCase())) return false;
    if (vertical) {
      const verts = Array.isArray(l.vertical) ? l.vertical : [];
      if (!verts.includes(vertical)) return false;
    }
    return true;
  });

  // Sort by conditionScore desc
  demo = demo.sort((a, b) => b.conditionScore - a.conditionScore);

  const total = demo.length;
  const paginated = demo.slice(skip, skip + limit);

  return NextResponse.json({
    leads: paginated,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    _demo: true,
  });
}
