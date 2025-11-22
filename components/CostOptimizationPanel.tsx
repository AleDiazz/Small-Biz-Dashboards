'use client'

import { CostOptimization } from '@/types'
import { TrendingDown, Target, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface CostOptimizationPanelProps {
  optimizations: CostOptimization[]
}

export default function CostOptimizationPanel({ optimizations }: CostOptimizationPanelProps) {
  const totalSavings = optimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0)

  if (optimizations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-success-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Great Job! Your Spending is Optimized
        </h3>
        <p className="text-gray-600">
          No major cost optimization opportunities detected at this time.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-success-50 to-emerald-50 rounded-xl border border-success-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-success-500 rounded-lg">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Cost Optimization Opportunities</h2>
            <p className="text-sm text-gray-600">
              Potential total savings: {formatCurrency(totalSavings)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {optimizations.map((optimization) => (
          <div
            key={optimization.id}
            className="bg-white rounded-lg border border-success-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{optimization.category}</h3>
                <p className="text-xs text-gray-600">
                  Current: {formatCurrency(optimization.currentSpend)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-success-600">
                  -{formatCurrency(optimization.potentialSavings)}
                </div>
                <p className="text-xs text-gray-600">potential savings</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Current Spend</span>
                <span>Target Spend</span>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-success-500 rounded-full transition-all"
                  style={{
                    width: `${(optimization.recommendedSpend / optimization.currentSpend) * 100}%`,
                  }}
                />
              </div>
            </div>

            <p className="text-sm text-gray-700 bg-success-50 rounded-lg p-3 border border-success-100">
              {optimization.recommendation}
            </p>

            {optimization.vendorSuggestions && optimization.vendorSuggestions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">Vendor Suggestions:</p>
                <div className="space-y-2">
                  {optimization.vendorSuggestions.map((vendor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-xs bg-gray-50 rounded p-2"
                    >
                      <span className="font-medium text-gray-900">{vendor.vendor}</span>
                      <span className="text-success-600 font-semibold">
                        Save {formatCurrency(vendor.estimatedSavings)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

