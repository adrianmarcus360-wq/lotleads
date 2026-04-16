import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import type Stripe from 'stripe';
import { sendPurchaseConfirmation, sendProSubscriptionConfirmation } from '@/lib/email';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(sub);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { leadId, userId, type } = session.metadata ?? {};

  // Lead purchase
  if (leadId && userId && type) {
    const purchaseType = type as 'SHARED' | 'EXCLUSIVE';

    await db.$transaction(async (tx) => {
      // Upsert purchase record
      await tx.purchase.upsert({
        where: { stripeSessionId: session.id },
        create: {
          userId,
          leadId,
          type: purchaseType,
          amount: session.amount_total ?? 0,
          status: 'COMPLETED',
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string,
        },
        update: {
          status: 'COMPLETED',
          stripePaymentIntentId: session.payment_intent as string,
        },
      });

      // Update lead availability
      if (purchaseType === 'EXCLUSIVE') {
        await tx.lead.update({
          where: { id: leadId },
          data: {
            exclusiveBuyerId: userId,
            exclusiveExpiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
            status: 'SOLD_EXCLUSIVE',
          },
        });
      } else {
        const lead = await tx.lead.findUnique({ where: { id: leadId } });
        if (lead) {
          const newCount = lead.sharedBuyerCount + 1;
          await tx.lead.update({
            where: { id: leadId },
            data: {
              sharedBuyerCount: newCount,
              status: newCount >= lead.maxSharedBuyers ? 'SOLD_SHARED' : 'PARTIALLY_SOLD',
            },
          });
        }
      }
    });

    // Send purchase confirmation email (non-blocking)
    const user = await db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
    const lead = await db.lead.findUnique({ where: { id: leadId }, select: { city: true, state: true, conditionScore: true, estimatedJobMin: true, estimatedJobMax: true } });
    if (user?.email && lead) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lotleads.vercel.app';
      sendPurchaseConfirmation({
        buyerEmail: user.email,
        buyerName: user.name ?? 'there',
        leadCity: lead.city,
        leadState: lead.state,
        conditionScore: lead.conditionScore,
        estimatedJobMin: lead.estimatedJobMin,
        estimatedJobMax: lead.estimatedJobMax,
        purchaseType: purchaseType,
        dashboardUrl: `${appUrl}/dashboard/leads/${leadId}`,
      }).catch(console.error);
    }

    return;
  }

  // Pro subscription checkout (handled by subscription events)
}

async function handleSubscriptionUpdate(sub: Stripe.Subscription) {
  const customerId = sub.customer as string;

  // Find user by Stripe customer ID or subscription ID
  const existingSubscription = await db.subscription.findFirst({
    where: { stripeSubscriptionId: sub.id },
  });

  const userId = existingSubscription?.userId;
  if (!userId) {
    console.log(`No user found for subscription ${sub.id}`);
    return;
  }

  const periodEnd = new Date((sub.current_period_end ?? 0) * 1000);
  const isActive = sub.status === 'active' || sub.status === 'trialing';

  const wasAlreadyActive = existingSubscription?.status === 'ACTIVE';

  await db.subscription.upsert({
    where: { stripeSubscriptionId: sub.id },
    create: {
      userId,
      stripeSubscriptionId: sub.id,
      stripeCustomerId: customerId,
      status: isActive ? 'ACTIVE' : 'PAST_DUE',
      currentPeriodEnd: periodEnd,
      leadsPerMonth: 5,
      leadsRemaining: 5,
      leadsResetAt: periodEnd,
    },
    update: {
      status: isActive ? 'ACTIVE' : 'PAST_DUE',
      currentPeriodEnd: periodEnd,
      ...(sub.status === 'active' && {
        leadsRemaining: 5,
        leadsResetAt: periodEnd,
      }),
    },
  });

  // Send Pro confirmation email only on new activation
  if (isActive && !wasAlreadyActive) {
    const user = await db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
    if (user?.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lotleads.vercel.app';
      sendProSubscriptionConfirmation({
        email: user.email,
        name: user.name ?? 'there',
        leadsPerMonth: 5,
        dashboardUrl: `${appUrl}/dashboard`,
      }).catch(console.error);
    }
  }
}

async function handleSubscriptionCancelled(sub: Stripe.Subscription) {
  await db.subscription.updateMany({
    where: { stripeSubscriptionId: sub.id },
    data: { status: 'CANCELLED' },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    await db.subscription.updateMany({
      where: { stripeSubscriptionId: invoice.subscription as string },
      data: { status: 'PAST_DUE' },
    });
  }
}
