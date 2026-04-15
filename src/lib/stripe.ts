import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    });
  }
  return _stripe;
}

// Keep named export for backward compat — lazily resolved
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string, unknown>)[prop as string];
  },
});

export const PRICES = {
  SHARED_LEAD: process.env.STRIPE_PRICE_SHARED_LEAD ?? '',
  EXCLUSIVE_LEAD: process.env.STRIPE_PRICE_EXCLUSIVE_LEAD ?? '',
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
} as const;

export const AMOUNTS = {
  SHARED_LEAD: 6500,
  EXCLUSIVE_LEAD: 14900,
  PRO_MONTHLY: 29700,
} as const;

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}
