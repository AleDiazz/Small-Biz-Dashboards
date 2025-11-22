import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { Expense, CostOptimization } from '@/types'
import { insightsEngine } from '@/lib/ai/insights-engine'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      )
    }

    // Fetch cost optimizations from database
    const optimizationsRef = adminDb
      .collection('costOptimizations')
      .where('businessId', '==', businessId)
      .orderBy('createdAt', 'desc')
      .limit(20)

    const snapshot = await optimizationsRef.get()
    const optimizations: CostOptimization[] = []

    snapshot.forEach((doc) => {
      optimizations.push({
        id: doc.id,
        ...doc.data(),
      } as CostOptimization)
    })

    return NextResponse.json({ optimizations })
  } catch (error) {
    console.error('Error fetching optimizations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch optimizations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId, userId } = body

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

    if (expenses.length === 0) {
      return NextResponse.json({
        optimizations: [],
        message: 'Not enough data to generate optimizations',
      })
    }

    // Find cost savings using AI engine
    const optimizations = insightsEngine.findCostSavings(expenses)

    // Save optimizations to database
    const savedOptimizations: CostOptimization[] = []

    for (const optimization of optimizations) {
      const docRef = await adminDb.collection('costOptimizations').add(optimization)
      const doc = await docRef.get()

      savedOptimizations.push({
        id: doc.id,
        ...doc.data(),
      } as CostOptimization)
    }

    return NextResponse.json({
      optimizations: savedOptimizations,
      message: `Found ${savedOptimizations.length} cost optimization opportunities`,
    })
  } catch (error) {
    console.error('Error generating optimizations:', error)
    return NextResponse.json(
      { error: 'Failed to generate optimizations' },
      { status: 500 }
    )
  }
}

