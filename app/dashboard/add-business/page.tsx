'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { useBusiness } from '@/hooks/useBusiness'
import { SUBSCRIPTION_TIERS } from '@/types'
import toast from 'react-hot-toast'
import { Store, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const BUSINESS_TYPES = [
  'Food Truck',
  'Salon',
  'Personal Trainer',
  'Boutique',
  'Restaurant',
  'Cafe',
  'Retail Store',
  'Service Business',
  'Other',
]

export default function AddBusinessPage() {
  const router = useRouter()
  const { user, userData } = useAuth()
  const { businesses } = useBusiness()
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [loading, setLoading] = useState(false)

  const currentTier = SUBSCRIPTION_TIERS.find(t => t.id === userData?.subscriptionTier)
  const canAddBusiness = currentTier?.businessLimit === null || (currentTier?.businessLimit ? businesses.length < currentTier.businessLimit : false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !userData) return

    if (!canAddBusiness) {
      toast.error('You have reached your business limit. Please upgrade your plan.')
      return
    }

    setLoading(true)

    try {
      await addDoc(collection(db, 'businesses'), {
        userId: user.uid,
        name: businessName,
        type: businessType,
        currency: 'USD',
        createdAt: new Date(),
      })

      toast.success('Business created successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error creating business:', error)
      toast.error('Failed to create business. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <Store className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Business</h1>
            <p className="text-gray-600 text-sm">
              {currentTier?.businessLimit === null 
                ? 'Add unlimited businesses' 
                : `${businesses.length} of ${currentTier?.businessLimit} businesses used`}
            </p>
          </div>
        </div>

        {!canAddBusiness && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-orange-900 font-semibold mb-2">Business Limit Reached</p>
            <p className="text-sm text-orange-800 mb-3">
              You've reached the maximum number of businesses for your current plan.
            </p>
            <Link 
              href="/dashboard/settings"
              className="inline-block bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              Upgrade Plan
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
              Business Name *
            </label>
            <input
              id="businessName"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., Maria's Food Truck"
              required
              disabled={!canAddBusiness}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
              Business Type *
            </label>
            <select
              id="businessType"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              required
              disabled={!canAddBusiness}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select a type</option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Link
              href="/dashboard"
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !canAddBusiness}
              className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Business'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

