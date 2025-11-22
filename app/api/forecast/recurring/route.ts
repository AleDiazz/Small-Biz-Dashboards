import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { RecurringTransaction } from '@/types'

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

    // Fetch recurring transactions
    const recurringRef = adminDb
      .collection('recurringTransactions')
      .where('businessId', '==', businessId)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')

    const snapshot = await recurringRef.get()
    const transactions: RecurringTransaction[] = []

    snapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
      } as RecurringTransaction)
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Error fetching recurring transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recurring transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      businessId,
      userId,
      type,
      name,
      amount,
      frequency,
      startDate,
      endDate,
      category,
      source,
    } = body

    if (!businessId || !userId || !type || !name || !amount || !frequency || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const transactionData: Partial<RecurringTransaction> = {
      businessId,
      userId,
      type,
      name,
      amount: parseFloat(amount),
      frequency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      category,
      source,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const docRef = await adminDb.collection('recurringTransactions').add(transactionData)
    const doc = await docRef.get()

    const transaction = {
      id: doc.id,
      ...doc.data(),
    } as RecurringTransaction

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Error creating recurring transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create recurring transaction' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionId, ...updates } = body

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    const transactionRef = adminDb.collection('recurringTransactions').doc(transactionId)

    await transactionRef.update({
      ...updates,
      updatedAt: new Date(),
    })

    const doc = await transactionRef.get()
    const transaction = {
      id: doc.id,
      ...doc.data(),
    } as RecurringTransaction

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Error updating recurring transaction:', error)
    return NextResponse.json(
      { error: 'Failed to update recurring transaction' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const transactionId = searchParams.get('transactionId')

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    await adminDb.collection('recurringTransactions').doc(transactionId).delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recurring transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete recurring transaction' },
      { status: 500 }
    )
  }
}

