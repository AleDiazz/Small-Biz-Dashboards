'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useBusiness } from '@/hooks/useBusiness'
import { SUBSCRIPTION_TIERS } from '@/types'
import { User, CreditCard, Building2, Crown, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'

export default function SettingsPage() {
  const { user, userData } = useAuth()
  const { businesses } = useBusiness()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<string | null>(null)

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

        <div className="space-y-3">
          {businesses.map((business) => (
            <div
              key={business.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{business.name}</h3>
                <p className="text-sm text-gray-600">{business.type}</p>
              </div>
              <span className="text-xs bg-success-100 text-success-700 px-3 py-1 rounded-full font-medium">
                Active
              </span>
            </div>
          ))}
        </div>
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
    </div>
  )
}

