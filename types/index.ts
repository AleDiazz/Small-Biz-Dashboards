export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  subscriptionTier: 'basic' | 'pro' | 'unlimited'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  subscriptionStatus?: 'active' | 'past_due' | 'canceled' | 'incomplete'
  subscriptionUpdatedAt?: Date
  lastPaymentDate?: Date
}

export interface Business {
  id: string
  userId: string
  name: string
  type: string
  createdAt: Date
  currency: string
}

export interface Expense {
  id: string
  businessId: string
  userId: string
  amount: number
  category: string
  description: string
  date: Date
  createdAt: Date
}

export interface Revenue {
  id: string
  businessId: string
  userId: string
  amount: number
  source: string
  description: string
  date: Date
  createdAt: Date
}

export interface InventoryItem {
  id: string
  businessId: string
  userId: string
  name: string
  quantity: number
  minQuantity: number
  unit: string
  cost: number
  createdAt: Date
  updatedAt: Date
}

export interface SubscriptionTier {
  id: 'basic' | 'pro' | 'unlimited'
  name: string
  price: number
  businessLimit: number | null
  stripePriceId: string
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 15,
    businessLimit: 1,
    stripePriceId: 'price_basic_monthly',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 30,
    businessLimit: 3,
    stripePriceId: 'price_pro_monthly',
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: 50,
    businessLimit: null,
    stripePriceId: 'price_unlimited_monthly',
  },
]

export const EXPENSE_CATEGORIES = [
  'Supplies',
  'Utilities',
  'Rent',
  'Salaries',
  'Marketing',
  'Transportation',
  'Equipment',
  'Insurance',
  'Taxes',
  'Other',
]

export const REVENUE_SOURCES = [
  'Sales',
  'Services',
  'Products',
  'Subscriptions',
  'Tips',
  'Other',
]

