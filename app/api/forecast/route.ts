import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { Expense, Revenue, RecurringTransaction, CashFlowForecast } from '@/types'
import { cashFlowEngine } from '@/lib/forecasting/cash-flow-engine'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const businessId = searchParams.get('businessId')
    const userId = searchParams.get('userId')

    if (!businessId || !userId) {
      return NextResponse.json(
        { error: 'Business ID and User ID are required' },
        { status: 400 }
      )
    }

    // Fetch existing forecasts
    const forecastsRef = adminDb
      .collection('cashFlowForecasts')
      .where('businessId', '==', businessId)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(10)

    const snapshot = await forecastsRef.get()
    const forecasts: CashFlowForecast[] = []

    snapshot.forEach((doc) => {
      forecasts.push({
        id: doc.id,
        ...doc.data(),
      } as CashFlowForecast)
    })

    return NextResponse.json({ forecasts })
  } catch (error) {
    console.error('Error fetching forecasts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forecasts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId, userId, period, currentBalance } = body

    if (!businessId || !userId || !period) {
      return NextResponse.json(
        { error: 'Business ID, User ID, and period are required' },
        { status: 400 }
      )
    }

    // Fetch historical revenues
    const revenuesSnapshot = await adminDb
      .collection('revenues')
      .where('businessId', '==', businessId)
      .where('userId', '==', userId)
      .get()

    const revenues: Revenue[] = []
    revenuesSnapshot.forEach((doc) => {
      revenues.push({ id: doc.id, ...doc.data() } as Revenue)
    })

    // Fetch historical expenses
    const expensesSnapshot = await adminDb
      .collection('expenses')
      .where('businessId', '==', businessId)
      .where('userId', '==', userId)
      .get()

    const expenses: Expense[] = []
    expensesSnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() } as Expense)
    })

    if (revenues.length === 0 && expenses.length === 0) {
      return NextResponse.json({
        forecast: null,
        message: 'Not enough historical data to generate forecast',
      })
    }

    // Fetch recurring transactions
    const recurringSnapshot = await adminDb
      .collection('recurringTransactions')
      .where('businessId', '==', businessId)
      .where('userId', '==', userId)
      .where('active', '==', true)
      .get()

    const recurringTransactions: RecurringTransaction[] = []
    recurringSnapshot.forEach((doc) => {
      recurringTransactions.push({
        id: doc.id,
        ...doc.data(),
      } as RecurringTransaction)
    })

    // Generate forecast
    const forecast = cashFlowEngine.generateForecast(
      { revenues, expenses },
      recurringTransactions,
      parseInt(period),
      currentBalance || 0
    )

    // Save forecast to database
    const forecastData = {
      ...forecast,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const docRef = await adminDb.collection('cashFlowForecasts').add(forecastData)
    const doc = await docRef.get()

    const savedForecast = {
      id: doc.id,
      ...doc.data(),
    } as CashFlowForecast

    return NextResponse.json({ forecast: savedForecast })
  } catch (error) {
    console.error('Error generating forecast:', error)
    return NextResponse.json(
      { error: 'Failed to generate forecast' },
      { status: 500 }
    )
  }
}

