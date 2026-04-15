import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { type NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const city = searchParams.get('city');
  const market = searchParams.get('market');
  const vertical = searchParams.get('vertical'); // PAVING | STRIPING
  const minScore = parseInt(searchParams.get('minScore') ?? '1');
  const maxScore = parseInt(searchParams.get('maxScore') ?? '10');
  const type = searchParams.get('type'); // shared | exclusive | available
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '12'), 50);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    conditionScore: { gte: minScore, lte: maxScore },
    status: { in: ['AVAILABLE', 'PARTIALLY_SOLD'] },
  };

  if (market) where.market = market;
  if (city) where.city = { contains: city, mode: 'insensitive' };
  if (vertical) where.vertical = { has: vertical };

  if (type === 'exclusive') {
    // Only show leads that have no exclusive buyer (available for exclusive purchase)
    where.exclusiveBuyerId = null;
    where.status = 'AVAILABLE';
  }

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
        // DO NOT expose locked fields here (address, contacts)
      },
      orderBy: [{ conditionScore: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    db.lead.count({ where }),
  ]);

  return NextResponse.json({
    leads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
