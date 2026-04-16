import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe, AMOUNTS } from '@/lib/stripe';
import { db } from '@/lib/db';
import { z } from 'zod';
import { sendPurchaseConfirmation } from '@/lib/email';

const schema = z.object({
  type: z.enum(['SHARED', 'EXCLUSIVE']),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId: string = session.user!.id!;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid purchase type' }, { status: 400 });
  }

  const { type } = parsed.data;

  // Fetch lead
  const lead = await db.lead.findUnique({ where: { id: params.id } });
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  // Check if already purchased by this user
  const existing = await db.purchase.findUnique({
    where: { userId_leadId: { userId: userId, leadId: params.id } },
  });
  if (existing?.status === 'COMPLETED') {
    return NextResponse.json({ error: 'You already own this lead', alreadyOwned: true });
  }

  // Validate lead availability
  if (type === 'EXCLUSIVE') {
    if (lead.exclusiveBuyerId && lead.exclusiveExpiresAt && lead.exclusiveExpiresAt > new Date()) {
      return NextResponse.json({ error: 'Lead already has an active exclusive buyer' }, { status: 409 });
    }
  } else {
    if (lead.sharedBuyerCount >= lead.maxSharedBuyers) {
      return NextResponse.json({ error: 'No shared slots remaining for this lead' }, { status: 409 });
    }
  }

  const amount = type === 'EXCLUSIVE' ? AMOUNTS.EXCLUSIVE_LEAD : AMOUNTS.SHARED_LEAD;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  // Check if user has Pro subscription with remaining credits
  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (subscription?.status === 'ACTIVE' && subscription.leadsRemaining > 0 && type === 'EXCLUSIVE') {
    // Use subscription credit — no Stripe checkout needed
    const purchase = await db.$transaction(async (tx) => {
      const p = await tx.purchase.create({
        data: {
          userId: userId,
          leadId: params.id,
          type,
          amount: 0, // covered by subscription
          status: 'COMPLETED',
        },
      });
      await tx.subscription.update({
        where: { id: subscription.id },
        data: { leadsRemaining: { decrement: 1 } },
      });
      await tx.lead.update({
        where: { id: params.id },
        data: {
          exclusiveBuyerId: userId,
          exclusiveExpiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
          status: 'SOLD_EXCLUSIVE',
        },
      });
      return p;
    });
    // Send confirmation email (non-blocking)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lotleads.vercel.app';
    sendPurchaseConfirmation({
      buyerEmail: session.user.email!,
      buyerName: session.user.name ?? 'there',
      leadCity: lead.city,
      leadState: lead.state,
      conditionScore: lead.conditionScore,
      estimatedJobMin: lead.estimatedJobMin,
      estimatedJobMax: lead.estimatedJobMax,
      purchaseType: type,
      dashboardUrl: `${appUrl}/dashboard/leads/${params.id}`,
    }).catch(console.error);

    return NextResponse.json({ success: true, purchaseId: purchase.id, usedCredit: true });
  }

  // Create Stripe Checkout Session
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: amount,
          product_data: {
            name: `${type === 'EXCLUSIVE' ? 'Exclusive' : 'Shared'} Lead — ${lead.city}, ${lead.state}`,
            description: `Condition score ${lead.conditionScore}/10 | Est. job: $${(lead.estimatedJobMin / 1000).toFixed(0)}K–$${(lead.estimatedJobMax / 1000).toFixed(0)}K${type === 'EXCLUSIVE' ? ' | 72-hour exclusive access' : ' | Shared with up to 3 contractors'}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/dashboard/leads/${params.id}?success=1`,
    cancel_url: `${appUrl}/leads/${params.id}?cancelled=1`,
    metadata: {
      leadId: params.id,
      userId: userId,
      type,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
