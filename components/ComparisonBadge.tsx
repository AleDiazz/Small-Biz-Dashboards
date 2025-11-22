'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ComparisonBadgeProps {
  change: number
  text?: string
}

export default function ComparisonBadge({ change, text }: ComparisonBadgeProps) {
  const isPositive = change > 0
  const isNegative = change < 0
  const isNeutral = change === 0

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        isPositive
          ? 'bg-success-50 text-success-700'
          : isNegative
          ? 'bg-danger-50 text-danger-700'
          : 'bg-gray-50 text-gray-600'
      }`}
    >
      {isPositive && <TrendingUp className="w-3 h-3" />}
      {isNegative && <TrendingDown className="w-3 h-3" />}
      {isNeutral && <Minus className="w-3 h-3" />}
      <span>
        {isNeutral ? '0%' : `${Math.abs(change).toFixed(1)}%`}
        {text && ` ${text}`}
      </span>
    </div>
  )
}

