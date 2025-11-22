'use client'

import { useState, useEffect } from 'react'
import { useBusiness } from '@/hooks/useBusiness'
import { useAuth } from '@/hooks/useAuth'
import { CashFlowForecast, RecurringTransaction } from '@/types'
import CashFlowChart from '@/components/CashFlowChart'
import ForecastCard from '@/components/ForecastCard'
import RecurringTransactionForm from '@/components/RecurringTransactionForm'
import {
  LineChart as LineChartIcon,
  TrendingUp,
  Calendar,
  RefreshCw,
  Clock,
  AlertCircle,
  DollarSign,
  Repeat,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

export default function ForecastPage() {
  const { selectedBusiness } = useBusiness()
  const { user } = useAuth()
  const [forecasts, setForecasts] = useState<CashFlowForecast[]>([])
  const [currentForecast, setCurrentForecast] = useState<CashFlowForecast | null>(null)
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '60' | '90'>('30')
  const [currentBalance, setCurrentBalance] = useState('0')

  useEffect(() => {
    if (selectedBusiness && user) {
      fetchForecasts()
      fetchRecurringTransactions()
    }
  }, [selectedBusiness, user])

  const fetchForecasts = async () => {
    if (!selectedBusiness || !user) return

    try {
      setLoading(true)
      const response = await fetch(
        `/api/forecast?businessId=${selectedBusiness.id}&userId=${user.uid}`
      )
      const data = await response.json()
      setForecasts(data.forecasts || [])
      if (data.forecasts && data.forecasts.length > 0) {
        setCurrentForecast(data.forecasts[0])
      }
    } catch (error) {
      console.error('Error fetching forecasts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecurringTransactions = async () => {
    if (!selectedBusiness || !user) return

    try {
      const response = await fetch(
        `/api/forecast/recurring?businessId=${selectedBusiness.id}&userId=${user.uid}`
      )
      const data = await response.json()
      setRecurringTransactions(data.transactions || [])
    } catch (error) {
      console.error('Error fetching recurring transactions:', error)
    }
  }

  const handleGenerateForecast = async () => {
    if (!selectedBusiness || !user) {
      toast.error('Please select a business first')
      return
    }

    try {
      setGenerating(true)
      const response = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBusiness.id,
          userId: user.uid,
          period: parseInt(selectedPeriod),
          currentBalance: parseFloat(currentBalance) || 0,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate forecast')
      }

      if (data.forecast) {
        setCurrentForecast(data.forecast)
        setForecasts([data.forecast, ...forecasts])
        toast.success('Cash flow forecast generated!')
      } else {
        toast.error(data.message || 'Not enough data to generate forecast')
      }
    } catch (error: any) {
      console.error('Error generating forecast:', error)
      toast.error(error.message || 'Failed to generate forecast')
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteRecurring = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/forecast/recurring?transactionId=${transactionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete transaction')
      }

      setRecurringTransactions(
        recurringTransactions.filter((t) => t.id !== transactionId)
      )
      toast.success('Recurring transaction deleted')
    } catch (error) {
      console.error('Error deleting transaction:', error)
      toast.error('Failed to delete transaction')
    }
  }

  const activeRecurring = recurringTransactions.filter((t) => t.active)
  const totalRecurringRevenue = activeRecurring
    .filter((t) => t.type === 'revenue')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalRecurringExpenses = activeRecurring
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  if (!selectedBusiness || !user) {
    return (
      <div className="text-center py-12">
        <LineChartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Business Selected</h2>
        <p className="text-gray-600">Please select a business to view cash flow forecasts</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <LineChartIcon className="w-8 h-8 text-indigo-600" />
            </div>
            Cash Flow Forecasting
          </h1>
          <p className="text-gray-600 mt-2">
            Predict future cash flow based on historical data and recurring transactions
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-sm text-indigo-700 font-medium mb-1">Forecasts Generated</p>
          <p className="text-3xl font-bold text-indigo-900">{forecasts.length}</p>
        </div>

        <div className="bg-gradient-to-br from-success-50 to-emerald-100 rounded-xl p-5 border border-success-200">
          <div className="flex items-center justify-between mb-2">
            <Repeat className="w-6 h-6 text-success-600" />
          </div>
          <p className="text-sm text-success-700 font-medium mb-1">Active Recurring</p>
          <p className="text-3xl font-bold text-success-900">{activeRecurring.length}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm text-blue-700 font-medium mb-1">Monthly Recurring Revenue</p>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrency(totalRecurringRevenue)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-sm text-orange-700 font-medium mb-1">Monthly Recurring Expenses</p>
          <p className="text-2xl font-bold text-orange-900">
            {formatCurrency(totalRecurringExpenses)}
          </p>
        </div>
      </div>

      {/* Generate Forecast Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Generate Cash Flow Forecast</h2>
            <p className="text-sm text-gray-600">
              Project your future cash position based on historical trends
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Period Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forecast Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as '30' | '60' | '90')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="30">30 Days</option>
              <option value="60">60 Days</option>
              <option value="90">90 Days</option>
            </select>
          </div>

          {/* Current Balance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Balance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
            <button
              onClick={handleGenerateForecast}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <LineChartIcon className="w-5 h-5" />
                  Generate Forecast
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Current Forecast */}
      {currentForecast && (
        <>
          <ForecastCard forecast={currentForecast} />
          <CashFlowChart dailyProjections={currentForecast.dailyProjections} />
        </>
      )}

      {/* Recurring Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Repeat className="w-6 h-6 text-primary-600" />
            Recurring Transactions
          </h2>
        </div>

        <div className="space-y-4">
          <RecurringTransactionForm
            businessId={selectedBusiness.id}
            userId={user.uid}
            onSuccess={() => {
              fetchRecurringTransactions()
              toast.success('Transaction added! Generate a new forecast to see the impact.')
            }}
          />

          {recurringTransactions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">No Recurring Transactions</h3>
              <p className="text-sm text-gray-600">
                Add recurring revenue or expenses to improve forecast accuracy
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-3">
                {recurringTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      transaction.type === 'revenue'
                        ? 'bg-success-50 border-success-200'
                        : 'bg-orange-50 border-orange-200'
                    } ${!transaction.active ? 'opacity-50' : ''}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-gray-900">{transaction.name}</h4>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            transaction.type === 'revenue'
                              ? 'bg-success-100 text-success-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {transaction.type.toUpperCase()}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {transaction.frequency}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{formatCurrency(transaction.amount)}</span>
                        <span>•</span>
                        <span>
                          Starts: {format(transaction.startDate instanceof Date ? transaction.startDate : new Date(transaction.startDate), 'MMM dd, yyyy')}
                        </span>
                        {transaction.endDate && (
                          <>
                            <span>•</span>
                            <span>
                              Ends: {format(transaction.endDate instanceof Date ? transaction.endDate : new Date(transaction.endDate), 'MMM dd, yyyy')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRecurring(transaction.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                    >
                      <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">How Cash Flow Forecasting Works</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>Historical Analysis:</strong> Uses your past revenue and expense patterns
              </li>
              <li>
                • <strong>Recurring Transactions:</strong> Incorporates scheduled payments and income
              </li>
              <li>
                • <strong>Trend Detection:</strong> Identifies growth or decline patterns
              </li>
              <li>
                • <strong>Confidence Scoring:</strong> Shows reliability based on data quality
              </li>
              <li>
                • <strong>Multiple Scenarios:</strong> Generate forecasts for different time periods
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

