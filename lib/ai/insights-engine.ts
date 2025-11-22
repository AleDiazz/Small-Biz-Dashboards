import { Expense, Revenue, Insight, SpendingPattern, CostOptimization } from '@/types'

export class InsightsEngine {
  /**
   * Detect unusual spending spikes (anomalies)
   */
  detectAnomalies(expenses: Expense[], threshold: number = 2): Insight[] {
    const insights: Insight[] = []
    
    // Group expenses by category
    const categoryExpenses = this.groupByCategory(expenses)
    
    for (const [category, expensesForCategory] of Object.entries(categoryExpenses)) {
      const amounts = expensesForCategory.map((e) => e.amount)
      const average = this.calculateAverage(amounts)
      const stdDev = this.calculateStdDev(amounts, average)
      
      // Find expenses that are significantly above average
      const anomalies = expensesForCategory.filter((expense) => {
        return expense.amount > average + threshold * stdDev
      })
      
      if (anomalies.length > 0) {
        const totalAnomaly = anomalies.reduce((sum, e) => sum + e.amount, 0)
        
        insights.push({
          id: `anomaly-${category}-${Date.now()}`,
          businessId: expenses[0]?.businessId || '',
          userId: expenses[0]?.userId || '',
          type: 'anomaly',
          category,
          title: `Unusual ${category} Spending Detected`,
          description: `Found ${anomalies.length} expense(s) in ${category} that are ${threshold}x above average. Total: $${totalAnomaly.toFixed(2)}`,
          impact: totalAnomaly > average * 3 ? 'high' : totalAnomaly > average * 1.5 ? 'medium' : 'low',
          confidence: 85,
          actionable: true,
          actionItems: [
            'Review these transactions for accuracy',
            'Verify if these are one-time expenses',
            'Consider negotiating with vendors if recurring',
          ],
          relatedExpenses: anomalies.map((e) => e.id),
          createdAt: new Date(),
          acknowledged: false,
        })
      }
    }
    
    return insights
  }

  /**
   * Find potential duplicate expenses
   */
  findDuplicateExpenses(expenses: Expense[]): Insight[] {
    const insights: Insight[] = []
    const potentialDuplicates: Map<string, Expense[]> = new Map()
    
    // Group by amount, category, and similar dates (within 3 days)
    for (let i = 0; i < expenses.length; i++) {
      const expense1 = expenses[i]
      const key = `${expense1.category}-${expense1.amount.toFixed(2)}`
      
      for (let j = i + 1; j < expenses.length; j++) {
        const expense2 = expenses[j]
        const date1 = expense1.date instanceof Date ? expense1.date : (expense1.date as any).toDate()
        const date2 = expense2.date instanceof Date ? expense2.date : (expense2.date as any).toDate()
        const daysDiff = Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24))
        
        if (
          expense1.category === expense2.category &&
          Math.abs(expense1.amount - expense2.amount) < 0.01 &&
          daysDiff <= 3
        ) {
          const duplicateKey = `dup-${key}-${i}`
          if (!potentialDuplicates.has(duplicateKey)) {
            potentialDuplicates.set(duplicateKey, [])
          }
          potentialDuplicates.get(duplicateKey)!.push(expense1, expense2)
        }
      }
    }
    
    // Create insights for duplicates
    potentialDuplicates.forEach((duplicates, key) => {
      const uniqueDuplicates = Array.from(new Set(duplicates.map((d) => d.id))).map((id) =>
        duplicates.find((d) => d.id === id)!
      )
      
      if (uniqueDuplicates.length >= 2) {
        const totalAmount = uniqueDuplicates.reduce((sum, e) => sum + e.amount, 0)
        const category = uniqueDuplicates[0].category
        
        insights.push({
          id: `duplicate-${key}-${Date.now()}`,
          businessId: uniqueDuplicates[0].businessId,
          userId: uniqueDuplicates[0].userId,
          type: 'warning',
          category,
          title: `Potential Duplicate ${category} Expenses`,
          description: `Found ${uniqueDuplicates.length} similar expenses totaling $${totalAmount.toFixed(2)}. These may be duplicates.`,
          impact: 'medium',
          estimatedSavings: totalAmount - uniqueDuplicates[0].amount,
          confidence: 70,
          actionable: true,
          actionItems: [
            'Review these transactions for duplicates',
            'Check bank statements for double charges',
            'Contact vendor if duplicate charge confirmed',
          ],
          relatedExpenses: uniqueDuplicates.map((e) => e.id),
          createdAt: new Date(),
          acknowledged: false,
        })
      }
    })
    
    return insights
  }

  /**
   * Compare spending to industry benchmarks (simplified)
   */
  compareToBenchmarks(expenses: Expense[], totalRevenue: number): Insight[] {
    const insights: Insight[] = []
    
    if (totalRevenue === 0) return insights
    
    const categoryExpenses = this.groupByCategory(expenses)
    
    // Industry benchmark percentages (simplified)
    const benchmarks: Record<string, number> = {
      'Marketing': 0.10, // 10% of revenue
      'Supplies': 0.05,
      'Utilities': 0.03,
      'Rent': 0.10,
      'Insurance': 0.02,
      'Transportation': 0.05,
    }
    
    for (const [category, expensesForCategory] of Object.entries(categoryExpenses)) {
      const totalCategorySpend = expensesForCategory.reduce((sum, e) => sum + e.amount, 0)
      const percentOfRevenue = totalCategorySpend / totalRevenue
      
      const benchmark = benchmarks[category]
      if (benchmark && percentOfRevenue > benchmark * 1.5) {
        const expectedSpend = totalRevenue * benchmark
        const excessSpend = totalCategorySpend - expectedSpend
        
        insights.push({
          id: `benchmark-${category}-${Date.now()}`,
          businessId: expenses[0]?.businessId || '',
          userId: expenses[0]?.userId || '',
          type: 'opportunity',
          category,
          title: `High ${category} Spending vs Industry Average`,
          description: `Your ${category} spending is ${(percentOfRevenue * 100).toFixed(1)}% of revenue, compared to the ${(benchmark * 100).toFixed(1)}% industry average.`,
          impact: excessSpend > totalRevenue * 0.05 ? 'high' : 'medium',
          estimatedSavings: excessSpend,
          confidence: 65,
          actionable: true,
          actionItems: [
            `Review ${category} vendors for better pricing`,
            'Compare multiple quotes before purchasing',
            'Consider bulk purchasing or annual contracts',
          ],
          relatedExpenses: expensesForCategory.map((e) => e.id),
          createdAt: new Date(),
          acknowledged: false,
        })
      }
    }
    
    return insights
  }

  /**
   * Find cost-saving opportunities
   */
  findCostSavings(expenses: Expense[]): CostOptimization[] {
    const optimizations: CostOptimization[] = []
    const categoryExpenses = this.groupByCategory(expenses)
    
    for (const [category, expensesForCategory] of Object.entries(categoryExpenses)) {
      const totalSpend = expensesForCategory.reduce((sum, e) => sum + e.amount, 0)
      const monthlyAverage = totalSpend / Math.max(1, this.getMonthSpan(expensesForCategory))
      
      // Suggest 5-15% potential savings based on category
      const savingsPercentage = this.getSavingsPercentage(category)
      const potentialSavings = totalSpend * savingsPercentage
      const recommendedSpend = totalSpend - potentialSavings
      
      if (potentialSavings > 50 && expensesForCategory.length >= 3) {
        optimizations.push({
          id: `optimization-${category}-${Date.now()}`,
          businessId: expenses[0]?.businessId || '',
          category,
          currentSpend: totalSpend,
          recommendedSpend,
          potentialSavings,
          recommendation: this.getRecommendation(category, potentialSavings),
          createdAt: new Date(),
        })
      }
    }
    
    return optimizations
  }

  /**
   * Analyze spending trends
   */
  analyzeTrends(expenses: Expense[]): SpendingPattern[] {
    const patterns: SpendingPattern[] = []
    const categoryExpenses = this.groupByCategory(expenses)
    
    for (const [category, expensesForCategory] of Object.entries(categoryExpenses)) {
      const monthlyData = this.groupByMonth(expensesForCategory)
      const monthlyAverages = Object.values(monthlyData).map((expenses) =>
        expenses.reduce((sum, e) => sum + e.amount, 0)
      )
      
      if (monthlyAverages.length < 2) continue
      
      const average = this.calculateAverage(monthlyAverages)
      const variance = this.calculateVariance(monthlyAverages, average)
      const trend = this.determineTrend(monthlyAverages)
      
      patterns.push({
        businessId: expenses[0]?.businessId || '',
        category,
        averageMonthly: average,
        trend,
        variance,
        seasonalFactors: this.calculateSeasonalFactors(monthlyData),
        lastUpdated: new Date(),
      })
    }
    
    return patterns
  }

  // Helper methods
  private groupByCategory(expenses: Expense[]): Record<string, Expense[]> {
    return expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = []
      }
      acc[expense.category].push(expense)
      return acc
    }, {} as Record<string, Expense[]>)
  }

  private groupByMonth(expenses: Expense[]): Record<string, Expense[]> {
    return expenses.reduce((acc, expense) => {
      const date = expense.date instanceof Date ? expense.date : (expense.date as any).toDate()
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
      if (!acc[monthKey]) {
        acc[monthKey] = []
      }
      acc[monthKey].push(expense)
      return acc
    }, {} as Record<string, Expense[]>)
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length
  }

  private calculateStdDev(numbers: number[], average: number): number {
    if (numbers.length === 0) return 0
    const variance = numbers.reduce((sum, n) => sum + Math.pow(n - average, 2), 0) / numbers.length
    return Math.sqrt(variance)
  }

  private calculateVariance(numbers: number[], average: number): number {
    if (numbers.length === 0) return 0
    return numbers.reduce((sum, n) => sum + Math.pow(n - average, 2), 0) / numbers.length
  }

  private determineTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable'
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))
    
    const firstAvg = this.calculateAverage(firstHalf)
    const secondAvg = this.calculateAverage(secondHalf)
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100
    
    if (change > 10) return 'increasing'
    if (change < -10) return 'decreasing'
    return 'stable'
  }

  private calculateSeasonalFactors(
    monthlyData: Record<string, Expense[]>
  ): { month: number; multiplier: number }[] {
    const factors: { month: number; multiplier: number }[] = []
    const months = Object.keys(monthlyData).map((key) => parseInt(key.split('-')[1]))
    
    // Simple seasonal calculation (would be more sophisticated in production)
    const uniqueMonths = Array.from(new Set(months))
    
    uniqueMonths.forEach((month) => {
      factors.push({
        month,
        multiplier: 1.0, // Simplified - would calculate based on historical patterns
      })
    })
    
    return factors
  }

  private getMonthSpan(expenses: Expense[]): number {
    if (expenses.length === 0) return 1
    
    const dates = expenses.map((e) =>
      e.date instanceof Date ? e.date : (e.date as any).toDate()
    )
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))
    
    const months =
      (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
      (maxDate.getMonth() - minDate.getMonth()) +
      1
    
    return Math.max(1, months)
  }

  private getSavingsPercentage(category: string): number {
    const savingsMap: Record<string, number> = {
      'Marketing': 0.15,
      'Supplies': 0.10,
      'Utilities': 0.08,
      'Transportation': 0.12,
      'Equipment': 0.10,
      'Other': 0.05,
    }
    
    return savingsMap[category] || 0.08
  }

  private getRecommendation(category: string, savings: number): string {
    const recommendations: Record<string, string> = {
      'Marketing': `Optimize your marketing spend by focusing on high-ROI channels. Potential savings: $${savings.toFixed(2)}`,
      'Supplies': `Negotiate bulk discounts or find alternative suppliers. Potential savings: $${savings.toFixed(2)}`,
      'Utilities': `Consider energy-efficient alternatives and compare utility providers. Potential savings: $${savings.toFixed(2)}`,
      'Transportation': `Optimize routes, consider fuel-efficient vehicles, or use ride-sharing. Potential savings: $${savings.toFixed(2)}`,
      'Equipment': `Lease instead of buy, or purchase refurbished equipment. Potential savings: $${savings.toFixed(2)}`,
    }
    
    return (
      recommendations[category] ||
      `Review ${category} expenses for optimization opportunities. Potential savings: $${savings.toFixed(2)}`
    )
  }
}

// Export singleton instance
export const insightsEngine = new InsightsEngine()

