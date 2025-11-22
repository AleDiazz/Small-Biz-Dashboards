import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { TaxCategory, DEFAULT_TAX_CATEGORIES } from '@/types'

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

    // Check if categories exist for this business
    const categoriesRef = adminDb
      .collection('taxCategories')
      .where('businessId', '==', businessId)

    const snapshot = await categoriesRef.get()

    if (snapshot.empty) {
      // Initialize default categories
      const categories: TaxCategory[] = []
      
      for (const defaultCategory of DEFAULT_TAX_CATEGORIES) {
        const docRef = await adminDb.collection('taxCategories').add({
          ...defaultCategory,
          businessId,
        })
        
        const doc = await docRef.get()
        categories.push({
          id: doc.id,
          ...doc.data(),
        } as TaxCategory)
      }

      return NextResponse.json({ categories })
    }

    const categories: TaxCategory[] = []
    snapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data(),
      } as TaxCategory)
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching tax categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tax categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId, name, deductible, deductionType, irsCategory, description, partialPercentage } = body

    if (!businessId || !name) {
      return NextResponse.json(
        { error: 'Business ID and name are required' },
        { status: 400 }
      )
    }

    const categoryData = {
      businessId,
      name,
      deductible: deductible ?? true,
      deductionType: deductionType || 'full',
      irsCategory: irsCategory || 'Custom',
      description: description || '',
      partialPercentage: partialPercentage || undefined,
    }

    const docRef = await adminDb.collection('taxCategories').add(categoryData)
    const doc = await docRef.get()
    
    const category: TaxCategory = {
      id: doc.id,
      ...doc.data(),
    } as TaxCategory

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error creating tax category:', error)
    return NextResponse.json(
      { error: 'Failed to create tax category' },
      { status: 500 }
    )
  }
}

