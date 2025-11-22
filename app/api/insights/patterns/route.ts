import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { Expense, SpendingPattern } from '@/types'
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

    // Fetch spending patterns from database
    const patternsRef = adminDb
      .collection('spendingPatterns')
      .where('businessId', '==', businessId)

    const snapshot = await patternsRef.get()
    const patterns: SpendingPattern[] = []

    snapshot.forEach((doc) => {
      patterns.push(doc.data() as SpendingPattern)
    })

    return NextResponse.json({ patterns })
  } catch (error) {
    console.error('Error fetching patterns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patterns' },
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
        patterns: [],
        message: 'Not enough data to analyze patterns',
      })
    }

    // Analyze patterns using AI engine
    const patterns = insightsEngine.analyzeTrends(expenses)

    // Save patterns to database (upsert by category)
    const savedPatterns: SpendingPattern[] = []

    for (const pattern of patterns) {
      const existingRef = adminDb
        .collection('spendingPatterns')
        .where('businessId', '==', businessId)
        .where('category', '==', pattern.category)

      const existing = await existingRef.get()

      if (!existing.empty) {
        // Update existing pattern
        const docRef = existing.docs[0].ref
        await docRef.update(pattern)
        savedPatterns.push(pattern)
      } else {
        // Create new pattern
        await adminDb.collection('spendingPatterns').add(pattern)
        savedPatterns.push(pattern)
      }
    }

    return NextResponse.json({
      patterns: savedPatterns,
      message: `Analyzed ${savedPatterns.length} spending patterns`,
    })
  } catch (error) {
    console.error('Error analyzing patterns:', error)
    return NextResponse.json(
      { error: 'Failed to analyze patterns' },
      { status: 500 }
    )
  }
}

