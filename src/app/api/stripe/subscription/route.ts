import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe, AMOUNTS } from '@/lib/stripe';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  plan: z.enum(['PRO']),
  market: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const { plan, market } = parsed.data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  // Check for existing active subscription
  const existing = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (existing?.status === 'ACTIVE') {
    return NextResponse.json({ error: 'Already subscribed' }, { status: 409 });
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });

  // Create or get Stripe customer
  let customerId: string;
  const existingCustomer = await stripe.customers.list({ email: user!.email, limit: 1 });
  if (existingCustomer.data.length > 0) {
    customerId = existingCustomer.data[0].id;
  } else {
    const customer = await stripe.customers.create({
      email: user!.email,
      name: user?.name ?? undefined,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
  }

  const priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;

  if (!priceId) {
    // Create price on-the-fly if not configured yet (useful for test mode)
    const price = await stripe.prices.create({
      currency: 'usd',
      unit_amount: AMOUNTS.PRO_MONTHLY,
      recurring: { interval: 'month' },
      product_data: {
        name: 'LotLeads Pro — 5 Exclusive Leads/Month',
      },
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: price.id, quantity: 1 }],
      success_url: `${appUrl}/dashboard?subscription=success`,
      cancel_url: `${appUrl}/dashboard?subscription=cancelled`,
      metadata: { userId: session.user.id as string, plan, market: market ?? '' },
      subscription_data: {
        metadata: { userId: session.user.id as string, plan },
        trial_period_days: 0,
      },
    });

    // Pre-create subscription record (will be confirmed by webhook)
    await db.subscription.upsert({
      where: { stripeSubscriptionId: checkoutSession.id },
      create: {
        userId: session.user.id as string,
        stripeSubscriptionId: checkoutSession.id, // temp, replaced by webhook
        stripeCustomerId: customerId,
        status: 'TRIALING',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        leadsPerMonth: 5,
        leadsRemaining: 5,
        territory: market,
      },
      update: {},
    });

    return NextResponse.json({ url: checkoutSession.url });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?subscription=success`,
    cancel_url: `${appUrl}/dashboard?subscription=cancelled`,
    metadata: { userId: session.user.id as string, plan, market: market ?? '' },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
