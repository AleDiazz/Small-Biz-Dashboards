import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { Expense, Revenue, Insight } from '@/types'
import { insightsEngine } from '@/lib/ai/insights-engine'

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

    // Fetch existing insights from database
    const insightsRef = adminDb
      .collection('insights')
      .where('businessId', '==', businessId)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)

    const snapshot = await insightsRef.get()
    const insights: Insight[] = []

    snapshot.forEach((doc) => {
      insights.push({
        id: doc.id,
        ...doc.data(),
      } as Insight)
    })

    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId, userId, regenerate } = body

    if (!businessId || !userId) {
      return NextResponse.json(
        { error: 'Business ID and User ID are required' },
        { status: 400 }
      )
    }

    // Fetch expenses
    const expensesSnapshot = await adminDb
      .collection('expenses')
      .where('businessId', '==', businessId)
      .where('userId', '==', userId)
      .get()

    const expenses: Expense[] = []
    expensesSnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() } as Expense)
    })

    // Fetch revenues
    const revenuesSnapshot = await adminDb
      .collection('revenues')
      .where('businessId', '==', businessId)
      .where('userId', '==', userId)
      .get()

    const revenues: Revenue[] = []
    let totalRevenue = 0
    revenuesSnapshot.forEach((doc) => {
      const revenue = { id: doc.id, ...doc.data() } as Revenue
      revenues.push(revenue)
      totalRevenue += revenue.amount
    })

    if (expenses.length === 0) {
      return NextResponse.json({
        insights: [],
        message: 'Not enough data to generate insights',
      })
    }

    // Generate insights using AI engine
    const anomalies = insightsEngine.detectAnomalies(expenses)
    const duplicates = insightsEngine.findDuplicateExpenses(expenses)
    const benchmarks = insightsEngine.compareToBenchmarks(expenses, totalRevenue)

    const allInsights = [...anomalies, ...duplicates, ...benchmarks]

    // Save insights to database
    const savedInsights: Insight[] = []
    
    for (const insight of allInsights) {
      const insightData = {
        ...insight,
        createdAt: new Date(),
      }
      
      const docRef = await adminDb.collection('insights').add(insightData)
      const doc = await docRef.get()
      
      savedInsights.push({
        id: doc.id,
        ...doc.data(),
      } as Insight)
    }

    return NextResponse.json({
      insights: savedInsights,
      message: `Generated ${savedInsights.length} new insights`,
    })
  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { insightId, acknowledged } = body

    if (!insightId) {
      return NextResponse.json(
        { error: 'Insight ID is required' },
        { status: 400 }
      )
    }

    const insightRef = adminDb.collection('insights').doc(insightId)
    
    await insightRef.update({
      acknowledged: acknowledged ?? true,
      acknowledgedAt: new Date(),
    })

    const doc = await insightRef.get()
    const insight = {
      id: doc.id,
      ...doc.data(),
    } as Insight

    return NextResponse.json({ insight })
  } catch (error) {
    console.error('Error acknowledging insight:', error)
    return NextResponse.json(
      { error: 'Failed to acknowledge insight' },
      { status: 500 }
    )
  }
}

