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

// ==================== TAX INTEGRATION TYPES ====================

export interface TaxSettings {
  id?: string
  businessId: string
  userId: string
  businessType: 'sole-proprietor' | 'llc' | 's-corp' | 'c-corp' | 'partnership'
  taxYear: number
  federalTaxRate: number
  stateTaxRate: number
  salesTaxRate: number
  estimatedQuarterlyPayments: number[]
  createdAt: Date
  updatedAt: Date
}

export interface TaxCategory {
  id: string
  name: string
  deductible: boolean
  deductionType: 'full' | 'partial' | 'depreciation'
  irsCategory: string
  description: string
  partialPercentage?: number
}

export interface ExpenseTaxInfo {
  id?: string
  expenseId: string
  taxCategoryId: string
  deductible: boolean
  deductionAmount: number
  depreciationSchedule?: {
    method: 'straight-line' | 'declining-balance'
    years: number
    annualAmount: number
  }
  receiptAttached: boolean
  receiptUrl?: string
  createdAt: Date
}

export interface TaxReport {
  id: string
  businessId: string
  userId: string
  reportType: 'quarterly' | 'annual'
  year: number
  quarter?: number
  totalRevenue: number
  totalExpenses: number
  deductibleExpenses: number
  taxableIncome: number
  estimatedTaxOwed: number
  salesTaxCollected: number
  salesTaxOwed: number
  createdAt: Date
}

// Default tax categories based on IRS Schedule C
export const DEFAULT_TAX_CATEGORIES: Omit<TaxCategory, 'id'>[] = [
  {
    name: 'Advertising',
    deductible: true,
    deductionType: 'full',
    irsCategory: 'Part II - Line 8',
    description: 'Business advertising and marketing expenses',
  },
  {
    name: 'Car and Truck Expenses',
    deductible: true,
    deductionType: 'partial',
    irsCategory: 'Part II - Line 9',
    description: 'Business vehicle expenses',
    partialPercentage: 50,
  },
  {
    name: 'Commissions and Fees',
    deductible: true,
    deductionType: 'full',
    irsCategory: 'Part II - Line 10',
    description: 'Commissions and fees paid',
  },
  {
    name: 'Contract Labor',
    deductible: true,
    deductionType: 'full',
    irsCategory: 'Part II - Line 11',
    description: 'Payments to contractors',
  },
  {
    name: 'Depreciation',
    deductible: true,
    deductionType: 'depreciation',
    irsCategory: 'Part II - Line 13',
    description: 'Depreciation of business assets',
  },
  {
    name: 'Insurance',
    deductible: true,
    deductionType: 'full',
    irsCategory: 'Part II - Line 15',
    description: 'Business insurance premiums',
  },
  {
    name: 'Legal and Professional Services',
    deductible: true,
    deductionType: 'full',
    irsCategory: 'Part II - Line 17',
    description: 'Attorney, accountant, consultant fees',
  },
  {
    name: 'Office Expenses',
    deductible: true,
    deductionType: 'full',
    irsCategory: 'Part II - Line 18',
    description: 'Office supplies and expenses',
  },
  {
    name: 'Rent or Lease',
    deductible: true,
    deductionType: 'full',
    irsCategory: 'Part II - Line 20',
    description: 'Business property and equipment rental',
  },
  {
    name: 'Repairs and Maintenance',
    deductible: true,
    deductionType: 'full',
    irsCategory: 'Part II - Line 21',
    description: 'Repairs to business property',
  },
  {
    name: 'Supplies',
    deductible: true,
    deductionType: 'full',
    irsCategory: 'Part II - Line 22',
    description: 'Business supplies',
  },
  {
    name: 'Taxes and Licenses',
    deductible: true,
    deductionType: 'full',
    irsCategory: 'Part II - Line 23',
    description: 'Business taxes and licenses',
  },
  {
    name: 'Travel',
    deductible: true,
    deductionType: 'full',
    irsCategory: 'Part II - Line 24',
    description: 'Business travel expenses',
  },
  {
    name: 'Meals',
    deductible: true,
    deductionType: 'partial',
    irsCategory: 'Part II - Line 24b',
    description: 'Business meals',
    partialPercentage: 50,
  },
  {
    name: 'Utilities',
    deductible: true,
    deductionType: 'full',
    irsCategory: 'Part II - Line 25',
    description: 'Business utilities',
  },
  {
    name: 'Wages',
    deductible: true,
    deductionType: 'full',
    irsCategory: 'Part II - Line 26',
    description: 'Employee wages',
  },
  {
    name: 'Other Expenses',
    deductible: true,
    deductionType: 'full',
    irsCategory: 'Part II - Line 27',
    description: 'Other business expenses',
  },
  {
    name: 'Personal/Non-Deductible',
    deductible: false,
    deductionType: 'full',
    irsCategory: 'N/A',
    description: 'Personal or non-deductible expenses',
  },
]

// ==================== AI INSIGHTS TYPES ====================

export interface Insight {
  id: string
  businessId: string
  userId: string
  type: 'cost-savings' | 'anomaly' | 'opportunity' | 'warning'
  category: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  estimatedSavings?: number
  confidence: number
  actionable: boolean
  actionItems: string[]
  relatedExpenses: string[]
  relatedRevenues?: string[]
  createdAt: Date
  acknowledged: boolean
  acknowledgedAt?: Date
}

export interface SpendingPattern {
  businessId: string
  category: string
  averageMonthly: number
  trend: 'increasing' | 'decreasing' | 'stable'
  variance: number
  seasonalFactors: {
    month: number
    multiplier: number
  }[]
  lastUpdated: Date
}

export interface CostOptimization {
  id: string
  businessId: string
  category: string
  currentSpend: number
  recommendedSpend: number
  potentialSavings: number
  recommendation: string
  vendorSuggestions?: {
    vendor: string
    estimatedSavings: number
    rating?: number
  }[]
  createdAt: Date
}

// ==================== CASH FLOW FORECASTING TYPES ====================

export interface CashFlowForecast {
  id: string
  businessId: string
  userId: string
  forecastPeriod: '30' | '60' | '90' | '180' | '365'
  startDate: Date
  endDate: Date
  currentBalance: number
  projectedBalance: number
  dailyProjections: CashFlowDay[]
  confidence: number
  assumptions: ForecastAssumption[]
  createdAt: Date
  updatedAt: Date
}

export interface CashFlowDay {
  date: Date
  projectedRevenue: number
  projectedExpenses: number
  projectedBalance: number
  confidence: number
  recurringTransactions: {
    revenue: number
    expenses: number
  }
  historicalAverage: {
    revenue: number
    expenses: number
  }
}

export interface ForecastAssumption {
  type: 'recurring' | 'historical' | 'manual' | 'seasonal'
  description: string
  impact: number
}

export interface RecurringTransaction {
  id: string
  businessId: string
  userId: string
  type: 'revenue' | 'expense'
  name: string
  amount: number
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annually'
  startDate: Date
  endDate?: Date
  category?: string
  source?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

