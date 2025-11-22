import { generateMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateMetadata({
  title: 'Log In',
  description: 'Log in to your LedgerAI account to access your small business dashboard, track revenue, manage expenses, and monitor inventory.',
  path: '/login',
  noindex: true, // Login pages typically shouldn't be indexed
})

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

