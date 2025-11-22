'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useBusiness } from '@/hooks/useBusiness'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import toast from 'react-hot-toast'
import FloatingActionButton from './FloatingActionButton'
import {
  LayoutDashboard,
  DollarSign,
  TrendingDown,
  Package,
  FileText,
  Settings,
  LogOut,
  TrendingUp,
  Menu,
  X,
  ChevronDown,
  Plus,
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, userData } = useAuth()
  const { businesses, selectedBusiness, setSelectedBusiness } = useBusiness()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [businessDropdownOpen, setBusinessDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setBusinessDropdownOpen(false)
      }
    }

    if (businessDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [businessDropdownOpen])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('Failed to log out')
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/dashboard/transactions', icon: DollarSign },
    { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Business Selector */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">BizOps Lite</span>
              </Link>

              {/* Business Selector */}
              {businesses.length > 0 && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setBusinessDropdownOpen(!businessDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <span className="font-medium text-gray-900 text-sm">
                      {selectedBusiness?.name || 'Select Business'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* Dropdown */}
                  {businessDropdownOpen && (
                    <div className="absolute top-full mt-2 left-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      {businesses.map((business) => (
                        <button
                          key={business.id}
                          onClick={() => {
                            setSelectedBusiness(business)
                            setBusinessDropdownOpen(false)
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                            selectedBusiness?.id === business.id ? 'bg-primary-50 text-primary-700' : ''
                          }`}
                        >
                          <div className="font-medium">{business.name}</div>
                          <div className="text-xs text-gray-500">{business.type}</div>
                        </button>
                      ))}
                      <hr className="my-2" />
                      <button
                        onClick={() => {
                          setBusinessDropdownOpen(false)
                          router.push('/dashboard/add-business')
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-primary-600 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add New Business
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard/settings"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden sm:block"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden sm:flex items-center gap-2 px-3"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">Logout</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              <Link
                href="/dashboard/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  )
}

