// Utility functions for BizOps Lite

/**
 * Format currency to USD with proper formatting
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

/**
 * Format date to short format (MMM DD)
 */
export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

/**
 * Get date range for reports
 */
export function getDateRange(period: 'day' | 'week' | 'month' | 'this-week' | 'last-week' | 'this-month' | 'last-month') {
  const now = new Date()
  let start = new Date()
  let end = new Date()

  switch (period) {
    case 'day':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      break
    case 'week':
    case 'this-week':
      start = new Date(now)
      start.setDate(now.getDate() - now.getDay())
      start.setHours(0, 0, 0, 0)
      end = new Date(start)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59)
      break
    case 'month':
    case 'this-month':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      break
    case 'last-week':
      start = new Date(now)
      start.setDate(now.getDate() - now.getDay() - 7)
      start.setHours(0, 0, 0, 0)
      end = new Date(start)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59)
      break
    case 'last-month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      break
  }

  return { start, end }
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Get comparison text
 */
export function getComparisonText(change: number): string {
  if (change === 0) return 'No change from last period'
  const direction = change > 0 ? 'increase' : 'decrease'
  return `${Math.abs(change).toFixed(1)}% ${direction} from last period`
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Get chart color by index
 */
export function getChartColor(index: number): string {
  const colors = [
    '#f06020', // Primary orange
    '#f38244', // Light orange
    '#f7ae7a', // Lighter orange
    '#22c55e', // Success green
    '#4ade80', // Light green
    '#ef4444', // Danger red
    '#f87171', // Light red
    '#60a5fa', // Blue
    '#a78bfa', // Purple
    '#f59e0b', // Amber
  ]
  return colors[index % colors.length]
}

/**
 * Convert Firestore timestamp to Date
 */
export function firestoreTimestampToDate(timestamp: any): Date {
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000)
  }
  return new Date(timestamp)
}

/**
 * Group data by date period
 */
export function groupByPeriod<T extends { date: any }>(
  data: T[],
  period: 'day' | 'week' | 'month'
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {}

  data.forEach((item) => {
    const date = firestoreTimestampToDate(item.date)
    let key: string

    switch (period) {
      case 'day':
        key = formatDate(date)
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = formatDate(weekStart)
        break
      case 'month':
        key = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(date)
        break
    }

    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(item)
  })

  return grouped
}

/**
 * Calculate total from grouped data
 */
export function calculateTotalByPeriod<T extends { amount: number }>(
  groupedData: Record<string, T[]>
): { period: string; total: number }[] {
  return Object.entries(groupedData).map(([period, items]) => ({
    period,
    total: items.reduce((sum, item) => sum + item.amount, 0),
  }))
}

