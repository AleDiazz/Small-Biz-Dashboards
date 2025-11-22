import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { generateMetadata } from '@/lib/seo'
import { getMarkdownContent } from '@/lib/markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Metadata } from 'next'

export const metadata: Metadata = generateMetadata({
  title: 'Privacy Policy',
  description: 'Read LedgerAI Privacy Policy. Learn how we collect, use, and protect your personal information and business data. GDPR and CCPA compliant privacy practices.',
  path: '/legal/privacy-policy',
  keywords: 'LedgerAI, privacy policy, data protection, GDPR, CCPA, privacy rights, data security, personal information, business data protection',
})

export default async function PrivacyPolicyPage() {
  const content = await getMarkdownContent('privacy-policy.md')

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

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-4 prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-8 prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-3 prose-h3:mt-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}

