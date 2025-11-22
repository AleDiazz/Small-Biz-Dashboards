'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useBusiness } from '@/hooks/useBusiness'
import { SUBSCRIPTION_TIERS, Business } from '@/types'
import { User, CreditCard, Building2, Crown, Loader2, Edit2, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

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

export default function SettingsPage() {
  const { user, userData } = useAuth()
  const { businesses, selectedBusiness, setSelectedBusiness } = useBusiness()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('')
  const [editCurrency, setEditCurrency] = useState('USD')
  const [deleting, setDeleting] = useState<string | null>(null)

  const currentTier = SUBSCRIPTION_TIERS.find(t => t.id === userData?.subscriptionTier)

  // Handle success/cancel redirects from Stripe
  useEffect(() => {
    if (searchParams.get('success')) {
      toast.success('Subscription activated successfully!')
    }
    if (searchParams.get('canceled')) {
      toast.error('Checkout canceled')
    }
  }, [searchParams])

  // Handle upgrade/downgrade
  const handleSubscriptionChange = async (tierId: 'basic' | 'pro' | 'unlimited') => {
    if (!user || !userData) {
      toast.error('Please log in to change subscription')
      return
    }

    setLoading(tierId)

    try {
      // If user already has a Stripe customer ID, send them to customer portal
      if (userData.stripeCustomerId) {
        const response = await fetch('/api/create-portal-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.uid,
          }),
        })

        const data = await response.json()

        if (data.url) {
          window.location.href = data.url
        } else {
          throw new Error('Failed to create portal session')
        }
      } else {
        // New customer - create checkout session
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tier: tierId,
            userId: user.uid,
            userEmail: userData.email,
          }),
        })

        const data = await response.json()

        if (data.url) {
          window.location.href = data.url
        } else {
          throw new Error(data.error || 'Failed to create checkout session')
        }
      }
    } catch (error: any) {
      console.error('Error changing subscription:', error)
      toast.error(error.message || 'Failed to process subscription change')
    } finally {
      setLoading(null)
    }
  }

  // Handle edit business
  const handleEditClick = (business: Business) => {
    setEditingBusiness(business)
    setEditName(business.name)
    setEditType(business.type)
    setEditCurrency(business.currency || 'USD')
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBusiness) return

    setLoading('edit')
    try {
      await updateDoc(doc(db, 'businesses', editingBusiness.id), {
        name: editName,
        type: editType,
        currency: editCurrency,
      })

      toast.success('Business updated successfully!')
      setShowEditModal(false)
      setEditingBusiness(null)
    } catch (error) {
      console.error('Error updating business:', error)
      toast.error('Failed to update business')
    } finally {
      setLoading(null)
    }
  }

  const handleCancelEdit = () => {
    setShowEditModal(false)
    setEditingBusiness(null)
    setEditName('')
    setEditType('')
    setEditCurrency('USD')
  }

  // Handle delete business
  const handleDeleteBusiness = async (business: Business) => {
    const confirmMessage = `Are you sure you want to delete "${business.name}"?\n\nThis will permanently delete:\n- All revenue entries\n- All expense entries\n- All inventory items\n\nThis action cannot be undone.`
    
    if (!confirm(confirmMessage)) return

    setDeleting(business.id)
    try {
      // Delete all related data
      const collections = ['revenues', 'expenses', 'inventory']
      
      for (const collectionName of collections) {
        const q = query(
          collection(db, collectionName),
          where('businessId', '==', business.id)
        )
        const snapshot = await getDocs(q)
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deletePromises)
      }

      // Delete the business itself
      await deleteDoc(doc(db, 'businesses', business.id))

      // If this was the selected business, clear the selection
      if (selectedBusiness?.id === business.id) {
        setSelectedBusiness(null)
      }

      toast.success('Business deleted successfully!')
    } catch (error) {
      console.error('Error deleting business:', error)
      toast.error('Failed to delete business')
    } finally {
      setDeleting(null)
    }
  }

  // Handle manage subscription (customer portal)
  const handleManageSubscription = async () => {
    if (!user || !userData?.stripeCustomerId) {
      toast.error('No active subscription found')
      return
    }

    setLoading('manage')

    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Failed to create portal session')
      }
    } catch (error: any) {
      console.error('Error opening customer portal:', error)
      toast.error(error.message || 'Failed to open subscription management')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and subscription</p>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
            <p className="text-sm text-gray-600">Your personal details</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p className="text-gray-900">{userData?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{userData?.email}</p>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <Crown className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Subscription Plan</h2>
            <p className="text-sm text-gray-600">Manage your billing and plan</p>
          </div>
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-primary-900">{currentTier?.name} Plan</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  userData?.subscriptionStatus === 'active' 
                    ? 'bg-success-200 text-success-900' 
                    : userData?.subscriptionStatus === 'past_due'
                    ? 'bg-warning-200 text-warning-900'
                    : 'bg-primary-200 text-primary-900'
                }`}>
                  {userData?.subscriptionStatus === 'past_due' ? 'Payment Failed' : 'Active'}
                </span>
              </div>
              <p className="text-primary-700 text-lg font-semibold mb-1">
                ${currentTier?.price}/month
              </p>
              <p className="text-primary-800 text-sm mb-3">
                {currentTier?.businessLimit === null 
                  ? 'Unlimited businesses' 
                  : `Up to ${currentTier?.businessLimit} business${currentTier?.businessLimit > 1 ? 'es' : ''}`}
              </p>
              {userData?.stripeCustomerId && (
                <button
                  onClick={handleManageSubscription}
                  disabled={loading === 'manage'}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {loading === 'manage' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Manage Subscription & Billing'
                  )}
                </button>
              )}
            </div>
            <Crown className="w-12 h-12 text-primary-600" />
          </div>
        </div>

        {/* Upgrade Options */}
        <div className="grid md:grid-cols-3 gap-4">
          {SUBSCRIPTION_TIERS.map((tier) => {
            const isCurrent = tier.id === userData?.subscriptionTier
            const isUpgrade = SUBSCRIPTION_TIERS.findIndex(t => t.id === userData?.subscriptionTier) < SUBSCRIPTION_TIERS.findIndex(t => t.id === tier.id)
            
            return (
              <div
                key={tier.id}
                className={`border-2 rounded-lg p-4 ${
                  isCurrent 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-primary-300 transition-colors'
                }`}
              >
                <h4 className="font-semibold text-gray-900 mb-1">{tier.name}</h4>
                <p className="text-2xl font-bold text-gray-900 mb-2">${tier.price}<span className="text-sm font-normal text-gray-600">/mo</span></p>
                <p className="text-sm text-gray-600 mb-4">
                  {tier.businessLimit === null ? 'Unlimited' : tier.businessLimit} business{tier.businessLimit !== 1 ? 'es' : ''}
                </p>
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2 bg-primary-100 text-primary-700 rounded-lg font-medium cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleSubscriptionChange(tier.id)}
                    disabled={loading === tier.id}
                    className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading === tier.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Upgrade'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscriptionChange(tier.id)}
                    disabled={loading === tier.id}
                    className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading === tier.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Change Plan'
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Businesses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Businesses</h2>
            <p className="text-sm text-gray-600">
              {businesses.length} of {currentTier?.businessLimit === null ? '∞' : currentTier?.businessLimit} businesses
            </p>
          </div>
        </div>

        {businesses.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No businesses yet</p>
            <p className="text-sm text-gray-500 mt-1">Create your first business to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{business.name}</h3>
                    {selectedBusiness?.id === business.id && (
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{business.type}</p>
                  <p className="text-xs text-gray-500 mt-1">Currency: {business.currency || 'USD'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(business)}
                    disabled={deleting === business.id}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                    title="Edit business"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBusiness(business)}
                    disabled={deleting === business.id}
                    className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                    title="Delete business"
                  >
                    {deleting === business.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
            <p className="text-sm text-gray-600">Manage your payment details</p>
          </div>
        </div>

        {userData?.stripeCustomerId ? (
          <div className="bg-success-50 border border-success-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-success-900 font-medium mb-1">Payment method on file</p>
                <p className="text-success-700 text-sm">Manage your payment methods through the customer portal</p>
              </div>
              <button
                onClick={handleManageSubscription}
                disabled={loading === 'manage'}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {loading === 'manage' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Manage'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-600 mb-4">Add a payment method by subscribing to a plan</p>
            <p className="text-sm text-gray-500">Your payment information will be securely stored with Stripe</p>
          </div>
        )}
      </div>

      {/* Edit Business Modal */}
      {showEditModal && editingBusiness && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Edit Business</h2>
              </div>
              <button 
                onClick={handleCancelEdit}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g., Maria's Food Truck"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type *
                </label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a type</option>
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <select
                  value={editCurrency}
                  onChange={(e) => setEditCurrency(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="MXN">MXN ($)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={loading === 'edit'}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading === 'edit'}
                  className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading === 'edit' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

