import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Check } from 'lucide-react'
import { generateMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateMetadata({
  title: 'Pricing',
  description: 'Simple, transparent pricing for your small business. Choose from Basic ($15/month), Pro ($30/month), or Unlimited ($50/month) plans. Upgrade or downgrade anytime.',
  path: '/pricing',
})

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 relative">
            <Image 
              src="/logo.png" 
              alt="LedgerAI" 
              fill 
              className="object-contain"
            />
          </div>
          <span className="text-2xl font-bold text-gray-900">LedgerAI</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link 
            href="/login" 
            className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
          >
            Log In
          </Link>
          <Link 
            href="/signup" 
            className="bg-primary-500 text-white px-6 py-2.5 rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Simple, Transparent <span className="text-primary-500">Pricing</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Choose the plan that fits your business. Upgrade or downgrade anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200 hover:border-primary-500 transition-all">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic</h2>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$15</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                1 Business
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                Full Dashboard
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                PDF Reports
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                Email Support
              </li>
            </ul>
            <Link 
              href="/signup?plan=basic"
              className="block w-full bg-gray-900 text-white text-center py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-primary-500 relative transform scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro</h2>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$30</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                3 Businesses
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                Full Dashboard
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                PDF Reports
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                Priority Support
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                Advanced Analytics
              </li>
            </ul>
            <Link 
              href="/signup?plan=pro"
              className="block w-full bg-primary-500 text-white text-center py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>

          {/* Unlimited Plan */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200 hover:border-primary-500 transition-all">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlimited</h2>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$50</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                Unlimited Businesses
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                Full Dashboard
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                PDF Reports
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                Priority Support
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                Advanced Analytics
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                API Access
              </li>
            </ul>
            <Link 
              href="/signup?plan=unlimited"
              className="block w-full bg-gray-900 text-white text-center py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Can I change plans later?</h3>
              <p className="text-gray-600">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">We offer a 14-day free trial for all new users. No credit card required.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards and process payments securely through Stripe.</p>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link 
              href="/faq"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-2"
            >
              View all FAQs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-12 text-center shadow-2xl max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join hundreds of small business owners who trust LedgerAI.
          </p>
          <Link 
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all text-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}

