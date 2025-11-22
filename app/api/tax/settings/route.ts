import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { TaxSettings } from '@/types'

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

    // Get tax settings for the business
    const settingsRef = adminDb
      .collection('taxSettings')
      .where('businessId', '==', businessId)
      .where('userId', '==', userId)
      .limit(1)

    const snapshot = await settingsRef.get()

    if (snapshot.empty) {
      return NextResponse.json({ settings: null })
    }

    const doc = snapshot.docs[0]
    const settings = {
      id: doc.id,
      ...doc.data(),
    } as TaxSettings

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching tax settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tax settings' },
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
      businessType,
      taxYear,
      federalTaxRate,
      stateTaxRate,
      salesTaxRate,
      estimatedQuarterlyPayments,
      id,
    } = body

    if (!businessId || !userId) {
      return NextResponse.json(
        { error: 'Business ID and User ID are required' },
        { status: 400 }
      )
    }

    const now = new Date()

    const settingsData: Partial<TaxSettings> = {
      businessId,
      userId,
      businessType: businessType || 'sole-proprietor',
      taxYear: taxYear || new Date().getFullYear(),
      federalTaxRate: federalTaxRate || 0,
      stateTaxRate: stateTaxRate || 0,
      salesTaxRate: salesTaxRate || 0,
      estimatedQuarterlyPayments: estimatedQuarterlyPayments || [0, 0, 0, 0],
      updatedAt: now,
    }

    let docRef

    if (id) {
      // Update existing settings
      docRef = adminDb.collection('taxSettings').doc(id)
      await docRef.update(settingsData)
    } else {
      // Create new settings
      settingsData.createdAt = now
      docRef = await adminDb.collection('taxSettings').add(settingsData)
    }

    const doc = await docRef.get()
    const settings = {
      id: doc.id,
      ...doc.data(),
    } as TaxSettings

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error saving tax settings:', error)
    return NextResponse.json(
      { error: 'Failed to save tax settings' },
      { status: 500 }
    )
  }
}

