'use client'

import { CashFlowForecast } from '@/types'
import { TrendingUp, TrendingDown, Calendar, Target, Award } from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'

interface ForecastCardProps {
  forecast: CashFlowForecast
}

export default function ForecastCard({ forecast }: ForecastCardProps) {
  const netChange = forecast.projectedBalance - forecast.currentBalance
  const isPositive = netChange >= 0

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500 rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {forecast.forecastPeriod}-Day Forecast
            </h3>
            <p className="text-sm text-gray-600">
              {format(forecast.startDate instanceof Date ? forecast.startDate : new Date(forecast.startDate), 'MMM dd')} -{' '}
              {format(forecast.endDate instanceof Date ? forecast.endDate : new Date(forecast.endDate), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-indigo-200">
          <Award className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-semibold text-indigo-900">
            {forecast.confidence}% Confident
          </span>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Current Balance */}
        <div className="bg-white rounded-lg p-4 border border-indigo-100">
          <p className="text-xs text-gray-600 mb-1">Starting Balance</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(forecast.currentBalance)}
          </p>
        </div>

        {/* Projected Balance */}
        <div className="bg-white rounded-lg p-4 border border-indigo-100">
          <p className="text-xs text-gray-600 mb-1">Projected Balance</p>
          <p className={`text-2xl font-bold ${isPositive ? 'text-success-600' : 'text-danger-600'}`}>
            {formatCurrency(forecast.projectedBalance)}
          </p>
        </div>
      </div>

      {/* Net Change */}
      <div className="bg-white rounded-lg p-4 border border-indigo-100 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-success-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-danger-600" />
            )}
            <p className="text-sm text-gray-600">Net Change</p>
          </div>
          <p className={`text-xl font-bold ${isPositive ? 'text-success-600' : 'text-danger-600'}`}>
            {isPositive ? '+' : ''}{formatCurrency(netChange)}
          </p>
        </div>
      </div>

      {/* Assumptions */}
      {forecast.assumptions && forecast.assumptions.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-indigo-100">
          <p className="text-xs font-medium text-gray-700 mb-2">Forecast Assumptions:</p>
          <ul className="space-y-1">
            {forecast.assumptions.map((assumption, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="text-indigo-600 mt-0.5">•</span>
                <span>{assumption.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

