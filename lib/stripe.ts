import Stripe from 'stripe';

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Stripe Product IDs - These will be created in your Stripe Dashboard
export const STRIPE_PRICE_IDS = {
  basic: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC || '',
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || '',
  unlimited: process.env.NEXT_PUBLIC_STRIPE_PRICE_UNLIMITED || '',
};

// Subscription tier mapping
export const TIER_TO_PRICE_ID = {
  basic: STRIPE_PRICE_IDS.basic,
  pro: STRIPE_PRICE_IDS.pro,
  unlimited: STRIPE_PRICE_IDS.unlimited,
};

// Helper function to get price ID for a tier
export function getPriceIdForTier(tier: 'basic' | 'pro' | 'unlimited'): string {
  return TIER_TO_PRICE_ID[tier];
}

// Helper function to get tier name from Stripe price ID
export function getTierFromPriceId(priceId: string): 'basic' | 'pro' | 'unlimited' {
  switch (priceId) {
    case STRIPE_PRICE_IDS.basic:
      return 'basic';
    case STRIPE_PRICE_IDS.pro:
      return 'pro';
    case STRIPE_PRICE_IDS.unlimited:
      return 'unlimited';
    default:
      return 'basic';
  }
}

