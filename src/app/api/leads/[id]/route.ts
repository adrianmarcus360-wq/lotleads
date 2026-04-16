import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { DEMO_LEADS } from '@/lib/demo-leads';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // ── Demo lead fallback ────────────────────────────────────────────────────
  if (params.id.startsWith('demo-')) {
    const demo = DEMO_LEADS.find(l => l.id === params.id);
    if (!demo) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    return NextResponse.json({
      ...demo,
      zip: '85001',
      address: null,
      propertyName: null,
      propertyManagerName: null,
      propertyManagerEmail: null,
      propertyManagerPhone: null,
      locked: true,
      purchases: [],
    });
  }

  // ── Production DB path ────────────────────────────────────────────────────
  try {
    const session = await auth();
    const lead = await db.lead.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        city: true,
        state: true,
        zip: true,
        market: true,
        conditionScore: true,
        urgency: true,
        damageTypes: true,
        estimatedJobMin: true,
        estimatedJobMax: true,
        propertyType: true,
        lotSqFt: true,
        lat: true,
        lng: true,
        blurredImageUrl: true,
        aerialImageUrl: true,
        vertical: true,
        status: true,
        sharedBuyerCount: true,
        maxSharedBuyers: true,
        exclusiveBuyerId: true,
        exclusiveExpiresAt: true,
        createdAt: true,
        ...(session?.user?.id
          ? {
              address: true,
              propertyManagerName: true,
              propertyManagerEmail: true,
              propertyManagerPhone: true,
              propertyName: true,
            }
          : {}),
        purchases: session?.user?.id
          ? {
              where: { userId: session.user.id, status: 'COMPLETED' },
              select: { type: true, createdAt: true },
            }
          : false,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const hasPurchased = session?.user?.id
      ? ((lead.purchases as { type: string; createdAt: Date }[] | undefined)?.length ?? 0) > 0
      : false;

    if (!hasPurchased) {
      return NextResponse.json({
        ...lead,
        address: null,
        propertyName: null,
        propertyManagerName: null,
        propertyManagerEmail: null,
        propertyManagerPhone: null,
        purchases: [],
        locked: true,
      });
    }

    return NextResponse.json({ ...lead, locked: false });
  } catch {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }
}
