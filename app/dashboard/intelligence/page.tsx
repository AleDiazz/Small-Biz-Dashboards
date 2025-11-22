'use client'

import { useState, useEffect } from 'react'
import { useBusiness } from '@/hooks/useBusiness'
import { useAuth } from '@/hooks/useAuth'
import { Insight, CostOptimization, SpendingPattern, CashFlowForecast, RecurringTransaction } from '@/types'
import InsightsCard from '@/components/InsightsCard'
import CostOptimizationPanel from '@/components/CostOptimizationPanel'
import CashFlowChart from '@/components/CashFlowChart'
import ForecastCard from '@/components/ForecastCard'
import RecurringTransactionForm from '@/components/RecurringTransactionForm'
import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Target,
  Activity,
  LineChart as LineChartIcon,
  Calendar,
  Repeat,
  DollarSign,
  Trash2,
  Clock,
  Lightbulb,
  Award,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

type Tab = 'insights' | 'forecast'
type InsightFilter = 'all' | 'cost-savings' | 'anomaly' | 'opportunity' | 'warning'

export default function IntelligencePage() {
  const { selectedBusiness } = useBusiness()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('insights')

  // Insights state
  const [insights, setInsights] = useState<Insight[]>([])
  const [optimizations, setOptimizations] = useState<CostOptimization[]>([])
  const [patterns, setPatterns] = useState<SpendingPattern[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [generatingInsights, setGeneratingInsights] = useState(false)
  const [filter, setFilter] = useState<InsightFilter>('all')

  // Forecast state
  const [forecasts, setForecasts] = useState<CashFlowForecast[]>([])
  const [currentForecast, setCurrentForecast] = useState<CashFlowForecast | null>(null)
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [forecastLoading, setForecastLoading] = useState(false)
  const [generatingForecast, setGeneratingForecast] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '60' | '90'>('30')
  const [currentBalance, setCurrentBalance] = useState('0')

  useEffect(() => {
    if (selectedBusiness && user) {
      if (activeTab === 'insights') {
        fetchInsights()
        fetchOptimizations()
        fetchPatterns()
      } else {
        fetchForecasts()
        fetchRecurringTransactions()
      }
    }
  }, [selectedBusiness, user, activeTab])

  // Insights functions
  const fetchInsights = async () => {
    if (!selectedBusiness || !user) return
    try {
      setInsightsLoading(true)
      const response = await fetch(`/api/insights?businessId=${selectedBusiness.id}&userId=${user.uid}`)
      const data = await response.json()
      setInsights(data.insights || [])
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setInsightsLoading(false)
    }
  }

  const fetchOptimizations = async () => {
    if (!selectedBusiness) return
    try {
      const response = await fetch(`/api/insights/optimization?businessId=${selectedBusiness.id}`)
      const data = await response.json()
      setOptimizations(data.optimizations || [])
    } catch (error) {
      console.error('Error fetching optimizations:', error)
    }
  }

  const fetchPatterns = async () => {
    if (!selectedBusiness) return
    try {
      const response = await fetch(`/api/insights/patterns?businessId=${selectedBusiness.id}`)
      const data = await response.json()
      setPatterns(data.patterns || [])
    } catch (error) {
      console.error('Error fetching patterns:', error)
    }
  }

  const handleGenerateInsights = async () => {
    if (!selectedBusiness || !user) {
      toast.error('Please select a business first')
      return
    }
    try {
      setGeneratingInsights(true)
      await Promise.all([
        fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: selectedBusiness.id, userId: user.uid }),
        }),
        fetch('/api/insights/optimization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: selectedBusiness.id, userId: user.uid }),
        }),
        fetch('/api/insights/patterns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: selectedBusiness.id, userId: user.uid }),
        }),
      ])
      toast.success('AI insights generated successfully!')
      await Promise.all([fetchInsights(), fetchOptimizations(), fetchPatterns()])
    } catch (error) {
      console.error('Error generating insights:', error)
      toast.error('Failed to generate insights')
    } finally {
      setGeneratingInsights(false)
    }
  }

  const handleAcknowledge = async (insightId: string) => {
    try {
      const response = await fetch('/api/insights', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insightId, acknowledged: true }),
      })
      if (!response.ok) throw new Error('Failed to acknowledge insight')
      setInsights(insights.map((insight) => insight.id === insightId ? { ...insight, acknowledged: true } : insight))
      toast.success('Insight acknowledged')
    } catch (error) {
      console.error('Error acknowledging insight:', error)
      toast.error('Failed to acknowledge insight')
    }
  }

  // Forecast functions
  const fetchForecasts = async () => {
    if (!selectedBusiness || !user) return
    try {
      setForecastLoading(true)
      const response = await fetch(`/api/forecast?businessId=${selectedBusiness.id}&userId=${user.uid}`)
      const data = await response.json()
      setForecasts(data.forecasts || [])
      if (data.forecasts && data.forecasts.length > 0) {
        setCurrentForecast(data.forecasts[0])
      }
    } catch (error) {
      console.error('Error fetching forecasts:', error)
    } finally {
      setForecastLoading(false)
    }
  }

  const fetchRecurringTransactions = async () => {
    if (!selectedBusiness || !user) return
    try {
      const response = await fetch(`/api/forecast/recurring?businessId=${selectedBusiness.id}&userId=${user.uid}`)
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
      setGeneratingForecast(true)
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
      if (!response.ok) throw new Error(data.message || 'Failed to generate forecast')
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
      setGeneratingForecast(false)
    }
  }

  const handleDeleteRecurring = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/forecast/recurring?transactionId=${transactionId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete transaction')
      setRecurringTransactions(recurringTransactions.filter((t) => t.id !== transactionId))
      toast.success('Recurring transaction deleted')
    } catch (error) {
      console.error('Error deleting transaction:', error)
      toast.error('Failed to delete transaction')
    }
  }

  // Computed values
  const filteredInsights = insights.filter((insight) => filter === 'all' || insight.type === filter)
  const unacknowledgedCount = insights.filter((i) => !i.acknowledged).length
  const totalSavings = insights.reduce((sum, i) => sum + (i.estimatedSavings || 0), 0)
  const highImpactCount = insights.filter((i) => i.impact === 'high').length
  const activeRecurring = recurringTransactions.filter((t) => t.active)
  const totalRecurringRevenue = activeRecurring.filter((t) => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0)
  const totalRecurringExpenses = activeRecurring.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  if (!selectedBusiness || !user) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Business Selected</h2>
        <p className="text-gray-600">Please select a business to view financial intelligence</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            Financial Intelligence
          </h1>
          <p className="text-gray-600 mt-2">AI-powered insights and cash flow predictions</p>
        </div>

        <button
          onClick={activeTab === 'insights' ? handleGenerateInsights : handleGenerateForecast}
          disabled={activeTab === 'insights' ? generatingInsights : generatingForecast}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {(activeTab === 'insights' ? generatingInsights : generatingForecast) ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate {activeTab === 'insights' ? 'Insights' : 'Forecast'}
            </>
          )}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'insights'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Lightbulb className="w-5 h-5" />
            AI Insights
            {unacknowledgedCount > 0 && activeTab !== 'insights' && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unacknowledgedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'forecast'
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LineChartIcon className="w-5 h-5" />
            Cash Flow Forecast
          </button>
        </div>
      </div>

      {/* Insights Tab Content */}
      {activeTab === 'insights' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
              <Lightbulb className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm text-purple-700 font-medium mb-1">Total Insights</p>
              <p className="text-3xl font-bold text-purple-900">{insights.length}</p>
              <p className="text-xs text-purple-600 mt-1">{unacknowledgedCount} unacknowledged</p>
            </div>
            <div className="bg-gradient-to-br from-success-50 to-emerald-100 rounded-xl p-5 border border-success-200">
              <Target className="w-6 h-6 text-success-600 mb-2" />
              <p className="text-sm text-success-700 font-medium mb-1">Potential Savings</p>
              <p className="text-3xl font-bold text-success-900">{formatCurrency(totalSavings)}</p>
              <p className="text-xs text-success-600 mt-1">{optimizations.length} opportunities</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
              <AlertCircle className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-sm text-orange-700 font-medium mb-1">High Priority</p>
              <p className="text-3xl font-bold text-orange-900">{highImpactCount}</p>
              <p className="text-xs text-orange-600 mt-1">requiring attention</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <Activity className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-sm text-blue-700 font-medium mb-1">Spending Patterns</p>
              <p className="text-3xl font-bold text-blue-900">{patterns.length}</p>
              <p className="text-xs text-blue-600 mt-1">categories analyzed</p>
            </div>
          </div>

          {optimizations.length > 0 && <CostOptimizationPanel optimizations={optimizations} />}

          {patterns.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Spending Patterns</h2>
                  <p className="text-sm text-gray-600">Historical trends across your expense categories</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patterns.map((pattern) => (
                  <div key={`${pattern.category}-${pattern.lastUpdated}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">{pattern.category}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Monthly Average:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(pattern.averageMonthly)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Trend:</span>
                        <span className={`font-semibold flex items-center gap-1 ${pattern.trend === 'increasing' ? 'text-orange-600' : pattern.trend === 'decreasing' ? 'text-success-600' : 'text-blue-600'}`}>
                          {pattern.trend === 'increasing' && <TrendingUp className="w-4 h-4" />}
                          {pattern.trend === 'decreasing' && <TrendingUp className="w-4 h-4 rotate-180" />}
                          {pattern.trend.charAt(0).toUpperCase() + pattern.trend.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            {['all', 'cost-savings', 'anomaly', 'opportunity', 'warning'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as InsightFilter)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filter === f ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {f === 'all' ? 'All' : f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} ({insights.filter((i) => f === 'all' || i.type === f).length})
              </button>
            ))}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Insights</h2>
            {insightsLoading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading insights...</p>
              </div>
            ) : filteredInsights.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Insights Yet</h3>
                <p className="text-gray-600 mb-6">Generate your first AI-powered insights to discover cost savings and optimization opportunities.</p>
                <button onClick={handleGenerateInsights} disabled={generatingInsights} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md">
                  <Sparkles className="w-5 h-5" />
                  Generate Insights
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInsights.map((insight) => (
                  <InsightsCard key={insight.id} insight={insight} onAcknowledge={handleAcknowledge} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Forecast Tab Content */}
      {activeTab === 'forecast' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200">
              <Calendar className="w-6 h-6 text-indigo-600 mb-2" />
              <p className="text-sm text-indigo-700 font-medium mb-1">Forecasts Generated</p>
              <p className="text-3xl font-bold text-indigo-900">{forecasts.length}</p>
            </div>
            <div className="bg-gradient-to-br from-success-50 to-emerald-100 rounded-xl p-5 border border-success-200">
              <Repeat className="w-6 h-6 text-success-600 mb-2" />
              <p className="text-sm text-success-700 font-medium mb-1">Active Recurring</p>
              <p className="text-3xl font-bold text-success-900">{activeRecurring.length}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <TrendingUp className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-sm text-blue-700 font-medium mb-1">Monthly Recurring Revenue</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalRecurringRevenue)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
              <DollarSign className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-sm text-orange-700 font-medium mb-1">Monthly Recurring Expenses</p>
              <p className="text-2xl font-bold text-orange-900">{formatCurrency(totalRecurringExpenses)}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Generate Cash Flow Forecast</h2>
                <p className="text-sm text-gray-600">Project your future cash position based on historical trends</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Forecast Period</label>
                <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value as '30' | '60' | '90')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white">
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Balance</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input type="number" step="0.01" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
                <button onClick={handleGenerateForecast} disabled={generatingForecast} className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                  {generatingForecast ? (
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

          {currentForecast && (
            <>
              <ForecastCard forecast={currentForecast} />
              <CashFlowChart dailyProjections={currentForecast.dailyProjections} />
            </>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Repeat className="w-6 h-6 text-primary-600" />
                Recurring Transactions
              </h2>
            </div>
            <div className="space-y-4">
              <RecurringTransactionForm businessId={selectedBusiness.id} userId={user.uid} onSuccess={() => { fetchRecurringTransactions(); toast.success('Transaction added! Generate a new forecast to see the impact.') }} />
              {recurringTransactions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">No Recurring Transactions</h3>
                  <p className="text-sm text-gray-600">Add recurring revenue or expenses to improve forecast accuracy</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="space-y-3">
                    {recurringTransactions.map((transaction) => (
                      <div key={transaction.id} className={`flex items-center justify-between p-4 rounded-lg border ${transaction.type === 'revenue' ? 'bg-success-50 border-success-200' : 'bg-orange-50 border-orange-200'} ${!transaction.active ? 'opacity-50' : ''}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-semibold text-gray-900">{transaction.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${transaction.type === 'revenue' ? 'bg-success-100 text-success-700' : 'bg-orange-100 text-orange-700'}`}>{transaction.type.toUpperCase()}</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{transaction.frequency}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{formatCurrency(transaction.amount)}</span>
                            <span>•</span>
                            <span>Starts: {format(transaction.startDate instanceof Date ? transaction.startDate : new Date(transaction.startDate), 'MMM dd, yyyy')}</span>
                            {transaction.endDate && (
                              <>
                                <span>•</span>
                                <span>Ends: {format(transaction.endDate instanceof Date ? transaction.endDate : new Date(transaction.endDate), 'MMM dd, yyyy')}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button onClick={() => handleDeleteRecurring(transaction.id)} className="p-2 hover:bg-red-100 rounded-lg transition-colors group">
                          <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

