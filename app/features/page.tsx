import Link from 'next/link'
import { TrendingUp, ArrowLeft, DollarSign, BarChart3, Package, FileText, TrendingUp as TrendingUpIcon, Shield, Zap, Clock } from 'lucide-react'
import { generateMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateMetadata({
  title: 'Features',
  description: 'Discover all the features of LedgerAI - revenue tracking, expense management, inventory tracking, analytics dashboard, PDF reports, and more.',
  path: '/features',
})

export default function FeaturesPage() {
  const features = [
    {
      icon: DollarSign,
      title: 'Revenue Tracking',
      description: 'Log daily sales and income effortlessly. See your revenue trends at a glance with beautiful charts and analytics.',
      color: 'success',
    },
    {
      icon: BarChart3,
      title: 'Expense Management',
      description: 'Categorize and track all business expenses. Understand where your money goes with detailed breakdowns and insights.',
      color: 'danger',
    },
    {
      icon: Package,
      title: 'Inventory Tracking',
      description: 'Never run out of stock. Get alerts when inventory is low and track all your supplies in one place.',
      color: 'primary',
    },
    {
      icon: TrendingUpIcon,
      title: 'Analytics Dashboard',
      description: 'Visual insights into your business performance. Track profit margins and identify growth opportunities.',
      color: 'purple',
    },
    {
      icon: FileText,
      title: 'PDF Reports',
      description: 'Generate professional weekly and monthly reports. Perfect for reviewing performance and tax preparation.',
      color: 'blue',
    },
    {
      icon: Zap,
      title: 'Real-Time Updates',
      description: 'All your data is updated in real-time. See changes instantly across all your devices.',
      color: 'orange',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and stored securely. We never share your business information with third parties.',
      color: 'green',
    },
    {
      icon: Clock,
      title: 'Time-Saving',
      description: 'Spend less time on paperwork and more time growing your business. Our tools automate the tedious tasks.',
      color: 'indigo',
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

        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Everything You Need to Grow</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, powerful tools designed for food trucks, salons, trainers, boutiques, and more.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const colorClasses = {
                success: 'bg-success-100 text-success-600',
                danger: 'bg-danger-100 text-danger-600',
                primary: 'bg-primary-100 text-primary-600',
                purple: 'bg-purple-100 text-purple-600',
                blue: 'bg-blue-100 text-blue-600',
                orange: 'bg-orange-100 text-orange-600',
                green: 'bg-green-100 text-green-600',
                indigo: 'bg-indigo-100 text-indigo-600',
              }

              return (
                <div 
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all"
                >
                  <div className={`w-12 h-12 ${colorClasses[feature.color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>

          {/* Detailed Features */}
          <div className="space-y-8 mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Revenue Tracking</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Track all your income sources in one place. Log daily sales, record revenue from different sources, 
                and see your financial growth over time with beautiful visualizations.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Log revenue from multiple sources</li>
                <li>View revenue trends with interactive charts</li>
                <li>Compare periods to track growth</li>
                <li>Export revenue data for tax purposes</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Expense Management</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Keep track of every business expense with our intuitive expense management system. Categorize expenses, 
                track spending patterns, and identify areas where you can save money.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Categorize expenses for better organization</li>
                <li>View expense breakdowns by category</li>
                <li>Track recurring expenses automatically</li>
                <li>Generate expense reports for accounting</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Inventory Tracking</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Never run out of essential supplies. Our inventory management system helps you track stock levels, 
                set minimum quantities, and get alerts when items are running low.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Track inventory levels in real-time</li>
                <li>Set minimum stock alerts</li>
                <li>Calculate inventory value automatically</li>
                <li>Track inventory costs and pricing</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Analytics & Insights</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Get deep insights into your business performance with our comprehensive analytics dashboard. 
                Understand your profit margins, identify trends, and make data-driven decisions.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>View profit and loss statements</li>
                <li>Analyze revenue and expense trends</li>
                <li>Compare performance across time periods</li>
                <li>Identify top revenue sources and expense categories</li>
              </ul>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Start using all these features today. No credit card required for your free trial.
            </p>
            <Link 
              href="/signup"
              className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all text-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

