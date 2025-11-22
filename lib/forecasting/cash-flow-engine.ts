import {
  Expense,
  Revenue,
  RecurringTransaction,
  CashFlowForecast,
  CashFlowDay,
  ForecastAssumption,
} from '@/types'
import { addDays, startOfDay, differenceInDays, format } from 'date-fns'

export class CashFlowEngine {
  /**
   * Generate a cash flow forecast based on historical data and recurring transactions
   */
  generateForecast(
    historicalData: { revenues: Revenue[]; expenses: Expense[] },
    recurringTransactions: RecurringTransaction[],
    period: number,
    currentBalance: number = 0
  ): CashFlowForecast {
    const startDate = startOfDay(new Date())
    const endDate = addDays(startDate, period)

    // Calculate historical averages
    const historicalAverages = this.calculateHistoricalAverages(historicalData)

    // Generate daily projections
    const dailyProjections: CashFlowDay[] = []
    let runningBalance = currentBalance

    for (let i = 0; i < period; i++) {
      const date = addDays(startDate, i)

      // Calculate recurring transactions for this day
      const recurringRevenue = this.calculateRecurringForDay(
        date,
        recurringTransactions.filter((t) => t.type === 'revenue' && t.active)
      )

      const recurringExpenses = this.calculateRecurringForDay(
        date,
        recurringTransactions.filter((t) => t.type === 'expense' && t.active)
      )

      // Apply historical averages for non-recurring transactions
      const projectedRevenue = recurringRevenue + historicalAverages.dailyRevenue
      const projectedExpenses = recurringExpenses + historicalAverages.dailyExpense

      runningBalance += projectedRevenue - projectedExpenses

      dailyProjections.push({
        date,
        projectedRevenue,
        projectedExpenses,
        projectedBalance: runningBalance,
        confidence: this.calculateConfidence(i, period, historicalData),
        recurringTransactions: {
          revenue: recurringRevenue,
          expenses: recurringExpenses,
        },
        historicalAverage: {
          revenue: historicalAverages.dailyRevenue,
          expenses: historicalAverages.dailyExpense,
        },
      })
    }

    // Calculate overall confidence
    const overallConfidence = this.calculateOverallConfidence(
      historicalData,
      recurringTransactions,
      period
    )

    // Generate assumptions
    const assumptions = this.generateAssumptions(
      historicalData,
      recurringTransactions,
      historicalAverages
    )

    const forecast: CashFlowForecast = {
      id: `forecast-${Date.now()}`,
      businessId: historicalData.revenues[0]?.businessId || '',
      userId: historicalData.revenues[0]?.userId || '',
      forecastPeriod: period.toString() as CashFlowForecast['forecastPeriod'],
      startDate,
      endDate,
      currentBalance,
      projectedBalance: runningBalance,
      dailyProjections,
      confidence: overallConfidence,
      assumptions,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return forecast
  }

  /**
   * Detect recurring patterns in transactions
   */
  detectRecurringTransactions(
    transactions: (Revenue | Expense)[]
  ): RecurringTransaction[] {
    const recurring: RecurringTransaction[] = []
    const grouped = new Map<string, (Revenue | Expense)[]>()

    // Group similar transactions by amount and description
    transactions.forEach((transaction) => {
      const key = `${transaction.amount.toFixed(2)}-${
        'source' in transaction ? transaction.source : transaction.category
      }`

      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(transaction)
    })

    // Analyze each group for recurring patterns
    grouped.forEach((group, key) => {
      if (group.length < 2) return

      // Sort by date
      const sorted = group.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : (a.date as any).toDate()
        const dateB = b.date instanceof Date ? b.date : (b.date as any).toDate()
        return dateA.getTime() - dateB.getTime()
      })

      // Calculate intervals between transactions
      const intervals: number[] = []
      for (let i = 1; i < sorted.length; i++) {
        const date1 = sorted[i - 1].date instanceof Date ? sorted[i - 1].date : (sorted[i - 1].date as any).toDate()
        const date2 = sorted[i].date instanceof Date ? sorted[i].date : (sorted[i].date as any).toDate()
        intervals.push(differenceInDays(date2, date1))
      }

      // Check if intervals are consistent
      const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length
      const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length
      const stdDev = Math.sqrt(variance)

      // If intervals are consistent (low variance), it's likely recurring
      if (stdDev < avgInterval * 0.2 && group.length >= 3) {
        const frequency = this.determineFrequency(avgInterval)
        const firstTransaction = sorted[0]

        const recurringTransaction: RecurringTransaction = {
          id: `recurring-${Date.now()}-${Math.random()}`,
          businessId: firstTransaction.businessId,
          userId: firstTransaction.userId,
          type: 'source' in firstTransaction ? 'revenue' : 'expense',
          name:
            'source' in firstTransaction
              ? firstTransaction.source
              : firstTransaction.category,
          amount: firstTransaction.amount,
          frequency,
          startDate: firstTransaction.date instanceof Date ? firstTransaction.date : (firstTransaction.date as any).toDate(),
          category:
            'category' in firstTransaction ? firstTransaction.category : undefined,
          source: 'source' in firstTransaction ? firstTransaction.source : undefined,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        recurring.push(recurringTransaction)
      }
    })

    return recurring
  }

  /**
   * Calculate seasonal factors based on historical data
   */
  calculateSeasonalFactors(
    transactions: (Revenue | Expense)[]
  ): { month: number; multiplier: number }[] {
    const monthlyTotals = new Map<number, number[]>()

    // Group transactions by month
    transactions.forEach((transaction) => {
      const date = transaction.date instanceof Date ? transaction.date : (transaction.date as any).toDate()
      const month = date.getMonth()

      if (!monthlyTotals.has(month)) {
        monthlyTotals.set(month, [])
      }
      monthlyTotals.get(month)!.push(transaction.amount)
    })

    // Calculate average for each month
    const monthlyAverages = new Map<number, number>()
    monthlyTotals.forEach((amounts, month) => {
      const avg = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length
      monthlyAverages.set(month, avg)
    })

    // Calculate overall average
    const overallAvg =
      Array.from(monthlyAverages.values()).reduce((sum, avg) => sum + avg, 0) /
      monthlyAverages.size

    // Calculate multipliers
    const factors: { month: number; multiplier: number }[] = []
    monthlyAverages.forEach((avg, month) => {
      factors.push({
        month,
        multiplier: overallAvg > 0 ? avg / overallAvg : 1.0,
      })
    })

    return factors
  }

  /**
   * Apply trend analysis to forecast
   */
  applyTrendAnalysis(
    historicalData: (Revenue | Expense)[]
  ): { slope: number; direction: 'up' | 'down' | 'stable' } {
    if (historicalData.length < 10) {
      return { slope: 0, direction: 'stable' }
    }

    // Sort by date
    const sorted = historicalData.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : (a.date as any).toDate()
      const dateB = b.date instanceof Date ? b.date : (b.date as any).toDate()
      return dateA.getTime() - dateB.getTime()
    })

    // Group by week for smoother trend
    const weekly = this.groupByWeek(sorted)
    const weeks = Array.from(weekly.values())

    if (weeks.length < 4) {
      return { slope: 0, direction: 'stable' }
    }

    // Simple linear regression
    const n = weeks.length
    const x = Array.from({ length: n }, (_, i) => i)
    const y = weeks.map((week) => week.reduce((sum, t) => sum + t.amount, 0))

    const sumX = x.reduce((sum, val) => sum + val, 0)
    const sumY = y.reduce((sum, val) => sum + val, 0)
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0)
    const sumXX = x.reduce((sum, val) => sum + val * val, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)

    let direction: 'up' | 'down' | 'stable' = 'stable'
    if (slope > 50) direction = 'up'
    else if (slope < -50) direction = 'down'

    return { slope, direction }
  }

  // Private helper methods

  private calculateHistoricalAverages(historicalData: {
    revenues: Revenue[]
    expenses: Expense[]
  }): { dailyRevenue: number; dailyExpense: number; monthlyRevenue: number; monthlyExpense: number } {
    const totalRevenue = historicalData.revenues.reduce((sum, r) => sum + r.amount, 0)
    const totalExpense = historicalData.expenses.reduce((sum, e) => sum + e.amount, 0)

    // Calculate date range
    const allDates = [
      ...historicalData.revenues.map((r) => r.date instanceof Date ? r.date : (r.date as any).toDate()),
      ...historicalData.expenses.map((e) => e.date instanceof Date ? e.date : (e.date as any).toDate()),
    ]

    if (allDates.length === 0) {
      return { dailyRevenue: 0, dailyExpense: 0, monthlyRevenue: 0, monthlyExpense: 0 }
    }

    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())))
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())))
    const daysDiff = Math.max(1, differenceInDays(maxDate, minDate))

    const dailyRevenue = totalRevenue / daysDiff
    const dailyExpense = totalExpense / daysDiff
    const monthlyRevenue = dailyRevenue * 30
    const monthlyExpense = dailyExpense * 30

    return { dailyRevenue, dailyExpense, monthlyRevenue, monthlyExpense }
  }

  private calculateRecurringForDay(
    date: Date,
    recurringTransactions: RecurringTransaction[]
  ): number {
    let total = 0

    recurringTransactions.forEach((transaction) => {
      if (this.shouldOccurOnDate(date, transaction)) {
        total += transaction.amount
      }
    })

    return total
  }

  private shouldOccurOnDate(date: Date, transaction: RecurringTransaction): boolean {
    const startDate = transaction.startDate instanceof Date ? transaction.startDate : new Date(transaction.startDate)
    
    if (date < startDate) return false
    if (transaction.endDate) {
      const endDate = transaction.endDate instanceof Date ? transaction.endDate : new Date(transaction.endDate)
      if (date > endDate) return false
    }

    const daysSinceStart = differenceInDays(date, startDate)

    switch (transaction.frequency) {
      case 'daily':
        return true
      case 'weekly':
        return daysSinceStart % 7 === 0
      case 'bi-weekly':
        return daysSinceStart % 14 === 0
      case 'monthly':
        return date.getDate() === startDate.getDate()
      case 'quarterly':
        return (
          date.getDate() === startDate.getDate() &&
          (date.getMonth() - startDate.getMonth()) % 3 === 0
        )
      case 'annually':
        return (
          date.getDate() === startDate.getDate() &&
          date.getMonth() === startDate.getMonth()
        )
      default:
        return false
    }
  }

  private calculateConfidence(
    dayIndex: number,
    totalDays: number,
    historicalData: { revenues: Revenue[]; expenses: Expense[] }
  ): number {
    // Confidence decreases over time
    const timeDecay = 1 - dayIndex / totalDays

    // Confidence increases with more historical data
    const dataPoints = historicalData.revenues.length + historicalData.expenses.length
    const dataConfidence = Math.min(1, dataPoints / 100)

    return Math.round((timeDecay * 0.6 + dataConfidence * 0.4) * 100)
  }

  private calculateOverallConfidence(
    historicalData: { revenues: Revenue[]; expenses: Expense[] },
    recurringTransactions: RecurringTransaction[],
    period: number
  ): number {
    const dataPoints = historicalData.revenues.length + historicalData.expenses.length
    const recurringCount = recurringTransactions.filter((t) => t.active).length

    let confidence = 50 // Base confidence

    // More historical data = higher confidence
    if (dataPoints > 100) confidence += 20
    else if (dataPoints > 50) confidence += 15
    else if (dataPoints > 20) confidence += 10

    // More recurring transactions = higher confidence
    if (recurringCount > 5) confidence += 15
    else if (recurringCount > 2) confidence += 10

    // Shorter periods = higher confidence
    if (period <= 30) confidence += 10
    else if (period <= 90) confidence += 5

    return Math.min(95, confidence)
  }

  private generateAssumptions(
    historicalData: { revenues: Revenue[]; expenses: Expense[] },
    recurringTransactions: RecurringTransaction[],
    averages: { dailyRevenue: number; dailyExpense: number }
  ): ForecastAssumption[] {
    const assumptions: ForecastAssumption[] = []

    // Recurring transactions assumption
    const activeRecurring = recurringTransactions.filter((t) => t.active)
    if (activeRecurring.length > 0) {
      const recurringTotal = activeRecurring.reduce((sum, t) => sum + t.amount, 0)
      assumptions.push({
        type: 'recurring',
        description: `${activeRecurring.length} recurring transactions identified`,
        impact: recurringTotal,
      })
    }

    // Historical average assumption
    const dataPoints = historicalData.revenues.length + historicalData.expenses.length
    assumptions.push({
      type: 'historical',
      description: `Based on ${dataPoints} historical transactions`,
      impact: averages.dailyRevenue - averages.dailyExpense,
    })

    return assumptions
  }

  private determineFrequency(
    avgInterval: number
  ): RecurringTransaction['frequency'] {
    if (avgInterval <= 2) return 'daily'
    if (avgInterval >= 5 && avgInterval <= 9) return 'weekly'
    if (avgInterval >= 12 && avgInterval <= 16) return 'bi-weekly'
    if (avgInterval >= 28 && avgInterval <= 32) return 'monthly'
    if (avgInterval >= 88 && avgInterval <= 95) return 'quarterly'
    if (avgInterval >= 360 && avgInterval <= 370) return 'annually'
    return 'monthly' // Default
  }

  private groupByWeek(
    transactions: (Revenue | Expense)[]
  ): Map<string, (Revenue | Expense)[]> {
    const weekly = new Map<string, (Revenue | Expense)[]>()

    transactions.forEach((transaction) => {
      const date = transaction.date instanceof Date ? transaction.date : (transaction.date as any).toDate()
      const weekKey = format(date, 'yyyy-ww')

      if (!weekly.has(weekKey)) {
        weekly.set(weekKey, [])
      }
      weekly.get(weekKey)!.push(transaction)
    })

    return weekly
  }
}

// Export singleton instance
export const cashFlowEngine = new CashFlowEngine()

