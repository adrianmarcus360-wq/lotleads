import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
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
      // Locked fields only if user has purchased
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

  // If user hasn't purchased, mask the contact fields
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
}
