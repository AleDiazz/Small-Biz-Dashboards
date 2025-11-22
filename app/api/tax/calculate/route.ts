import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { Expense, Revenue, TaxSettings, TaxCategory } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId, userId, period, year, quarter } = body

    if (!businessId || !userId || !period || !year) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get tax settings
    const settingsSnapshot = await adminDb
      .collection('taxSettings')
      .where('businessId', '==', businessId)
      .where('userId', '==', userId)
      .limit(1)
      .get()

    let taxSettings: TaxSettings | null = null
    if (!settingsSnapshot.empty) {
      const doc = settingsSnapshot.docs[0]
      taxSettings = {
        id: doc.id,
        ...doc.data(),
      } as TaxSettings
    }

    // Get tax categories
    const categoriesSnapshot = await adminDb
      .collection('taxCategories')
      .where('businessId', '==', businessId)
      .get()

    const categories = new Map<string, TaxCategory>()
    categoriesSnapshot.forEach((doc) => {
      const category = { id: doc.id, ...doc.data() } as TaxCategory
      categories.set(doc.id, category)
    })

    // Calculate date range based on period
    let startDate: Date
    let endDate: Date

    if (period === 'quarterly' && quarter) {
      const quarterStartMonth = (quarter - 1) * 3
      startDate = new Date(year, quarterStartMonth, 1)
      endDate = new Date(year, quarterStartMonth + 3, 0)
    } else {
      // Annual
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31)
    }

    // Fetch revenues
    const revenuesSnapshot = await adminDb
      .collection('revenues')
      .where('businessId', '==', businessId)
      .where('userId', '==', userId)
      .get()

    let totalRevenue = 0
    revenuesSnapshot.forEach((doc) => {
      const revenue = doc.data() as Revenue
      const revenueDate = revenue.date instanceof Date ? revenue.date : (revenue.date as any).toDate()
      
      if (revenueDate >= startDate && revenueDate <= endDate) {
        totalRevenue += revenue.amount
      }
    })

    // Fetch expenses with tax info
    const expensesSnapshot = await adminDb
      .collection('expenses')
      .where('businessId', '==', businessId)
      .where('userId', '==', userId)
      .get()

    let totalExpenses = 0
    let deductibleExpenses = 0

    expensesSnapshot.forEach((doc) => {
      const expense = doc.data() as Expense
      const expenseDate = expense.date instanceof Date ? expense.date : (expense.date as any).toDate()
      
      if (expenseDate >= startDate && expenseDate <= endDate) {
        totalExpenses += expense.amount
        // For MVP, assume all business expenses are deductible
        // In production, you'd check the expense tax info
        deductibleExpenses += expense.amount
      }
    })

    // Calculate tax obligations
    const taxableIncome = Math.max(0, totalRevenue - deductibleExpenses)
    
    const federalTaxRate = taxSettings?.federalTaxRate || 0.15
    const stateTaxRate = taxSettings?.stateTaxRate || 0.05
    const salesTaxRate = taxSettings?.salesTaxRate || 0

    const estimatedTaxOwed = taxableIncome * (federalTaxRate + stateTaxRate)
    const salesTaxCollected = totalRevenue * salesTaxRate
    const salesTaxOwed = salesTaxCollected

    // Save the tax report
    const reportData = {
      businessId,
      userId,
      reportType: period,
      year,
      quarter: period === 'quarterly' ? quarter : undefined,
      totalRevenue,
      totalExpenses,
      deductibleExpenses,
      taxableIncome,
      estimatedTaxOwed,
      salesTaxCollected,
      salesTaxOwed,
      createdAt: new Date(),
    }

    const reportRef = await adminDb.collection('taxReports').add(reportData)
    const reportDoc = await reportRef.get()

    const report = {
      id: reportDoc.id,
      ...reportDoc.data(),
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Error calculating tax:', error)
    return NextResponse.json(
      { error: 'Failed to calculate tax' },
      { status: 500 }
    )
  }
}

