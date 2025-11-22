import Link from 'next/link'
import { ArrowRight, BarChart3, DollarSign, Package, FileText, TrendingUp } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">BizOps Lite</span>
        </div>
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
            Manage Your Small Business with
            <span className="text-primary-500"> Confidence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Track expenses, revenue, and inventory in one simple dashboard. Built for Puerto Rico's small businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/signup"
              className="bg-primary-500 text-white px-8 py-4 rounded-lg hover:bg-primary-600 transition-all flex items-center gap-2 text-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#features"
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-primary-500 hover:text-primary-500 transition-all text-lg font-medium"
            >
              See Features
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Starting at $15/month
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Everything You Need to Grow
        </h2>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
          Simple, powerful tools designed for food trucks, salons, trainers, boutiques, and more.
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature Card 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 bg-success-100 rounded-xl flex items-center justify-center mb-5">
              <DollarSign className="w-7 h-7 text-success-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Revenue Tracking</h3>
            <p className="text-gray-600">
              Log daily sales and income effortlessly. See your revenue trends at a glance with beautiful charts.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 bg-danger-100 rounded-xl flex items-center justify-center mb-5">
              <BarChart3 className="w-7 h-7 text-danger-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Expense Management</h3>
            <p className="text-gray-600">
              Categorize and track all business expenses. Understand where your money goes with detailed breakdowns.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-5">
              <Package className="w-7 h-7 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Inventory Tracking</h3>
            <p className="text-gray-600">
              Never run out of stock. Get alerts when inventory is low and track all your supplies in one place.
            </p>
          </div>

          {/* Feature Card 4 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-5">
              <BarChart3 className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics Dashboard</h3>
            <p className="text-gray-600">
              Visual insights into your business performance. Track profit margins and identify growth opportunities.
            </p>
          </div>

          {/* Feature Card 5 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
              <FileText className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">PDF Reports</h3>
            <p className="text-gray-600">
              Generate professional weekly and monthly reports. Perfect for reviewing performance and tax preparation.
            </p>
          </div>

          {/* Feature Card 6 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-5">
              <TrendingUp className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Business Support</h3>
            <p className="text-gray-600">
              Manage multiple businesses from one dashboard. Upgrade your plan as your empire grows.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
          Choose the plan that fits your business. Upgrade or downgrade anytime.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200 hover:border-primary-500 transition-all">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$15</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-success-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                1 Business
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-success-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Full Dashboard
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-success-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                PDF Reports
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$30</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-success-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                3 Businesses
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-success-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Full Dashboard
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-success-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                PDF Reports
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-success-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Priority Support
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Unlimited</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$50</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-success-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Unlimited Businesses
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-success-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Full Dashboard
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-success-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                PDF Reports
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-success-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Priority Support
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

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Take Control of Your Business?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of Puerto Rico small business owners who trust BizOps Lite.
          </p>
          <Link 
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all text-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Get Started Today
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">BizOps Lite</span>
          </div>
          <p className="text-gray-600">
            © 2024 BizOps Lite. Made with ❤️ for Puerto Rico small businesses.
          </p>
        </div>
      </footer>
    </div>
  )
}

