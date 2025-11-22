'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, DollarSign, TrendingDown, Package } from 'lucide-react'

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const actions = [
    {
      label: 'Add Transaction',
      icon: DollarSign,
      color: 'bg-primary-500 hover:bg-primary-600',
      href: '/dashboard/transactions',
    },
    {
      label: 'Add Inventory',
      icon: Package,
      color: 'bg-amber-500 hover:bg-amber-600',
      href: '/dashboard/inventory',
    },
  ]

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex flex-col-reverse items-end gap-4">
          {/* Action Items */}
          {isOpen && actions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => {
                  router.push(action.href)
                  setIsOpen(false)
                }}
                className={`${action.color} text-white px-5 py-3 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center gap-3 animate-slide-in-up`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{action.label}</span>
              </button>
            )
          })}

          {/* Main FAB Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-16 h-16 rounded-full shadow-2xl transition-all transform hover:scale-110 flex items-center justify-center ${
              isOpen ? 'bg-gray-600 rotate-45' : 'bg-primary-500'
            }`}
          >
            {isOpen ? (
              <X className="w-8 h-8 text-white" />
            ) : (
              <Plus className="w-8 h-8 text-white" />
            )}
          </button>
        </div>
      </div>
    </>
  )
}

