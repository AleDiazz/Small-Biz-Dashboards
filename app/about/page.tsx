import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Target, Heart, Users } from 'lucide-react'
import { generateMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateMetadata({
  title: 'About Us',
  description: 'Learn about LedgerAI - our mission to help small businesses in Puerto Rico manage their finances, track inventory, and grow with confidence.',
  path: '/about',
})

export default function AboutPage() {
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
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">About LedgerAI</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're on a mission to help small businesses in Puerto Rico and beyond manage their finances, 
              track inventory, and grow with confidence.
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
                <Target className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">
              Small businesses are the backbone of our economy, yet many struggle with managing their finances and operations. 
              We created LedgerAI to provide simple, affordable tools that help business owners focus on what they do best - 
              running their business - while we handle the complexity of tracking revenue, expenses, and inventory.
            </p>
          </div>

          {/* Values Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Built with Love</h3>
              <p className="text-gray-600">
                We genuinely care about small businesses and are committed to creating tools that make a real difference.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">For Everyone</h3>
              <p className="text-gray-600">
                Whether you run a food truck, salon, boutique, or any small business, our tools are designed for you.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Simple & Powerful</h3>
              <p className="text-gray-600">
                We believe powerful tools don't have to be complicated. Simple design, powerful features.
              </p>
            </div>
          </div>

          {/* Story Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                LedgerAI was born from a simple observation: small business owners in Puerto Rico and beyond were 
                struggling with complex, expensive business management tools that were designed for large enterprises.
              </p>
              <p>
                We set out to create something different - a tool that's as simple to use as it is powerful. A dashboard 
                that gives you everything you need to track your business finances without the complexity and high costs 
                of enterprise software.
              </p>
              <p>
                Today, hundreds of small businesses trust LedgerAI to manage their revenue, expenses, and inventory. 
                We're proud to be part of their success stories and committed to continuing to improve our platform.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Start managing your business with confidence today. Join hundreds of small business owners who trust LedgerAI.
            </p>
            <Link 
              href="/signup"
              className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all text-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

