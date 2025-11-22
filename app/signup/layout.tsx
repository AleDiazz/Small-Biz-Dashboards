import { generateMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateMetadata({
  title: 'Sign Up',
  description: 'Create your free LedgerAI account. Start tracking expenses, revenue, and inventory for your small business. 14-day free trial, no credit card required.',
  path: '/signup',
})

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

