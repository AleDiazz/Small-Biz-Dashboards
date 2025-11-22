import Link from 'next/link'
import { TrendingUp, ArrowLeft } from 'lucide-react'
import { generateMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateMetadata({
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about LedgerAI pricing, features, support, and more. Get help with your small business dashboard.',
  path: '/faq',
})

export default function FAQPage() {
  const faqs = [
    {
      category: 'Pricing & Plans',
      questions: [
        {
          q: 'How much does LedgerAI cost?',
          a: 'We offer three pricing tiers: Basic at $15/month for 1 business, Pro at $30/month for 3 businesses, and Unlimited at $50/month for unlimited businesses. All plans include the full dashboard and PDF reports.',
        },
        {
          q: 'Can I change my plan later?',
          a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any charges.',
        },
        {
          q: 'Is there a free trial?',
          a: 'Yes, we offer a 14-day free trial for all new users. No credit card required to start your trial.',
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit cards and process payments securely through Stripe. All payments are processed monthly.',
        },
        {
          q: 'Can I cancel anytime?',
          a: 'Absolutely! You can cancel your subscription at any time. There are no long-term contracts or cancellation fees.',
        },
      ],
    },
    {
      category: 'Features',
      questions: [
        {
          q: 'What features are included?',
          a: 'All plans include revenue tracking, expense management, inventory tracking, analytics dashboard, PDF reports, and multi-business support (based on your plan tier).',
        },
        {
          q: 'Can I track multiple businesses?',
          a: 'Yes! The Basic plan includes 1 business, Pro includes 3 businesses, and Unlimited includes unlimited businesses. You can manage all businesses from one dashboard.',
        },
        {
          q: 'Do you offer mobile apps?',
          a: 'Our dashboard is fully responsive and works great on mobile devices. We\'re working on dedicated mobile apps for iOS and Android.',
        },
        {
          q: 'Can I export my data?',
          a: 'Yes! You can generate comprehensive PDF reports for any time period. We also offer data export options for your records.',
        },
        {
          q: 'Is my data secure?',
          a: 'Absolutely. We use industry-standard encryption and security practices. Your data is stored securely and backed up regularly.',
        },
      ],
    },
    {
      category: 'Support',
      questions: [
        {
          q: 'What kind of support do you offer?',
          a: 'Basic plan includes email support. Pro and Unlimited plans include priority support with faster response times.',
        },
        {
          q: 'How quickly do you respond to support requests?',
          a: 'We typically respond to email support within 24-48 hours. Priority support customers receive responses within 4-8 hours.',
        },
        {
          q: 'Do you offer training or onboarding?',
          a: 'Yes! We provide comprehensive onboarding guides and tutorials. Our support team is happy to help you get started.',
        },
      ],
    },
    {
      category: 'Technical',
      questions: [
        {
          q: 'Do I need to install anything?',
          a: 'No! LedgerAI is a web-based application. Just sign up and start using it in your browser. No downloads or installations required.',
        },
        {
          q: 'What browsers are supported?',
          a: 'LedgerAI works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your browser.',
        },
        {
          q: 'Is there an API?',
          a: 'API access is available for Unlimited plan subscribers. Contact us for more information about API integration.',
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
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

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 mb-12">
            Find answers to common questions about LedgerAI
          </p>

          <div className="space-y-12">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{category.category}</h2>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <div 
                      key={faqIndex}
                      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{faq.q}</h3>
                      <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-16 bg-primary-50 border border-primary-200 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h2>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

