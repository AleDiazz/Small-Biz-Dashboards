'use client'

import { Insight } from '@/types'
import { 
  AlertCircle, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle, 
  DollarSign,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

interface InsightsCardProps {
  insight: Insight
  onAcknowledge?: (id: string) => void
}

export default function InsightsCard({ insight, onAcknowledge }: InsightsCardProps) {
  const [expanded, setExpanded] = useState(false)

  const getIcon = () => {
    switch (insight.type) {
      case 'cost-savings':
        return <DollarSign className="w-5 h-5" />
      case 'anomaly':
        return <AlertTriangle className="w-5 h-5" />
      case 'opportunity':
        return <TrendingUp className="w-5 h-5" />
      case 'warning':
        return <AlertCircle className="w-5 h-5" />
      default:
        return <Lightbulb className="w-5 h-5" />
    }
  }

  const getColor = () => {
    switch (insight.impact) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          iconBg: 'bg-red-100',
          iconText: 'text-red-600',
          badge: 'bg-red-100 text-red-700',
        }
      case 'medium':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          iconBg: 'bg-orange-100',
          iconText: 'text-orange-600',
          badge: 'bg-orange-100 text-orange-700',
        }
      case 'low':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          iconBg: 'bg-blue-100',
          iconText: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-700',
        }
    }
  }

  const colors = getColor()

  return (
    <div
      className={`${colors.bg} border ${colors.border} rounded-xl p-5 transition-all ${
        insight.acknowledged ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`${colors.iconBg} ${colors.iconText} p-3 rounded-lg flex-shrink-0`}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <h3 className={`font-semibold ${colors.text} mb-1`}>{insight.title}</h3>
              <p className="text-sm text-gray-700">{insight.description}</p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors.badge}`}>
                {insight.impact.toUpperCase()}
              </span>
              {insight.acknowledged && (
                <CheckCircle className="w-5 h-5 text-success-600" />
              )}
            </div>
          </div>

          {/* Estimated Savings */}
          {insight.estimatedSavings && insight.estimatedSavings > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-success-100 text-success-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
                💰 Potential Savings: {formatCurrency(insight.estimatedSavings)}
              </div>
            </div>
          )}

          {/* Confidence Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-600">
              Confidence: <span className="font-semibold">{insight.confidence}%</span>
            </span>
          </div>

          {/* Action Items */}
          {insight.actionable && insight.actionItems.length > 0 && (
            <div>
              <button
                onClick={() => setExpanded(!expanded)}
                className={`flex items-center gap-2 text-sm font-medium ${colors.text} hover:underline mb-2`}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide Action Items
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show Action Items ({insight.actionItems.length})
                  </>
                )}
              </button>

              {expanded && (
                <ul className="space-y-2 ml-2 mb-3">
                  {insight.actionItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className={`${colors.text} mt-0.5`}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Actions */}
          {!insight.acknowledged && onAcknowledge && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => onAcknowledge(insight.id)}
                className={`px-4 py-2 ${colors.iconBg} ${colors.text} rounded-lg text-sm font-medium hover:opacity-80 transition-opacity`}
              >
                Mark as Acknowledged
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

