'use client'

import { useState, useEffect } from 'react'
import { useBusiness } from '@/hooks/useBusiness'
import { useAuth } from '@/hooks/useAuth'
import { Insight, CostOptimization, SpendingPattern } from '@/types'
import InsightsCard from '@/components/InsightsCard'
import CostOptimizationPanel from '@/components/CostOptimizationPanel'
import {
  Lightbulb,
  Sparkles,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Filter,
  BarChart3,
  Brain,
  Target,
  Activity,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'

type InsightFilter = 'all' | 'cost-savings' | 'anomaly' | 'opportunity' | 'warning'

export default function InsightsPage() {
  const { selectedBusiness } = useBusiness()
  const { user } = useAuth()
  const [insights, setInsights] = useState<Insight[]>([])
  const [optimizations, setOptimizations] = useState<CostOptimization[]>([])
  const [patterns, setPatterns] = useState<SpendingPattern[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [filter, setFilter] = useState<InsightFilter>('all')

  useEffect(() => {
    if (selectedBusiness && user) {
      fetchInsights()
      fetchOptimizations()
      fetchPatterns()
    }
  }, [selectedBusiness, user])

  const fetchInsights = async () => {
    if (!selectedBusiness || !user) return

    try {
      setLoading(true)
      const response = await fetch(
        `/api/insights?businessId=${selectedBusiness.id}&userId=${user.uid}`
      )
      const data = await response.json()
      setInsights(data.insights || [])
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
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
      setGenerating(true)
      
      // Generate main insights
      const insightsResponse = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBusiness.id,
          userId: user.uid,
        }),
      })

      // Generate optimizations
      const optimizationsResponse = await fetch('/api/insights/optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBusiness.id,
          userId: user.uid,
        }),
      })

      // Generate patterns
      const patternsResponse = await fetch('/api/insights/patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBusiness.id,
          userId: user.uid,
        }),
      })

      if (!insightsResponse.ok || !optimizationsResponse.ok || !patternsResponse.ok) {
        throw new Error('Failed to generate insights')
      }

      toast.success('AI insights generated successfully!')
      
      // Refresh data
      await Promise.all([fetchInsights(), fetchOptimizations(), fetchPatterns()])
    } catch (error) {
      console.error('Error generating insights:', error)
      toast.error('Failed to generate insights')
    } finally {
      setGenerating(false)
    }
  }

  const handleAcknowledge = async (insightId: string) => {
    try {
      const response = await fetch('/api/insights', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insightId,
          acknowledged: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to acknowledge insight')
      }

      // Update local state
      setInsights(
        insights.map((insight) =>
          insight.id === insightId ? { ...insight, acknowledged: true } : insight
        )
      )

      toast.success('Insight acknowledged')
    } catch (error) {
      console.error('Error acknowledging insight:', error)
      toast.error('Failed to acknowledge insight')
    }
  }

  const filteredInsights = insights.filter((insight) => {
    if (filter === 'all') return true
    return insight.type === filter
  })

  const unacknowledgedCount = insights.filter((i) => !i.acknowledged).length
  const totalSavings = insights.reduce((sum, i) => sum + (i.estimatedSavings || 0), 0)
  const highImpactCount = insights.filter((i) => i.impact === 'high').length

  if (!selectedBusiness || !user) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Business Selected</h2>
        <p className="text-gray-600">Please select a business to view insights</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Lightbulb className="w-8 h-8 text-purple-600" />
            </div>
            AI-Powered Insights
          </h1>
          <p className="text-gray-600 mt-2">
            Smart recommendations to optimize your business spending
          </p>
        </div>

        <button
          onClick={handleGenerateInsights}
          disabled={generating}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate New Insights
            </>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Lightbulb className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-sm text-purple-700 font-medium mb-1">Total Insights</p>
          <p className="text-3xl font-bold text-purple-900">{insights.length}</p>
          <p className="text-xs text-purple-600 mt-1">
            {unacknowledgedCount} unacknowledged
          </p>
        </div>

        <div className="bg-gradient-to-br from-success-50 to-emerald-100 rounded-xl p-5 border border-success-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6 text-success-600" />
          </div>
          <p className="text-sm text-success-700 font-medium mb-1">Potential Savings</p>
          <p className="text-3xl font-bold text-success-900">{formatCurrency(totalSavings)}</p>
          <p className="text-xs text-success-600 mt-1">
            {optimizations.length} opportunities
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-sm text-orange-700 font-medium mb-1">High Priority</p>
          <p className="text-3xl font-bold text-orange-900">{highImpactCount}</p>
          <p className="text-xs text-orange-600 mt-1">
            requiring attention
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm text-blue-700 font-medium mb-1">Spending Patterns</p>
          <p className="text-3xl font-bold text-blue-900">{patterns.length}</p>
          <p className="text-xs text-blue-600 mt-1">
            categories analyzed
          </p>
        </div>
      </div>

      {/* Cost Optimization Panel */}
      {optimizations.length > 0 && (
        <CostOptimizationPanel optimizations={optimizations} />
      )}

      {/* Spending Patterns */}
      {patterns.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Spending Patterns</h2>
              <p className="text-sm text-gray-600">
                Historical trends across your expense categories
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patterns.map((pattern) => (
              <div
                key={`${pattern.category}-${pattern.lastUpdated}`}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{pattern.category}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly Average:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(pattern.averageMonthly)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Trend:</span>
                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        pattern.trend === 'increasing'
                          ? 'text-orange-600'
                          : pattern.trend === 'decreasing'
                          ? 'text-success-600'
                          : 'text-blue-600'
                      }`}
                    >
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({insights.length})
        </button>
        <button
          onClick={() => setFilter('cost-savings')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            filter === 'cost-savings'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Cost Savings ({insights.filter((i) => i.type === 'cost-savings').length})
        </button>
        <button
          onClick={() => setFilter('anomaly')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            filter === 'anomaly'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Anomalies ({insights.filter((i) => i.type === 'anomaly').length})
        </button>
        <button
          onClick={() => setFilter('opportunity')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            filter === 'opportunity'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Opportunities ({insights.filter((i) => i.type === 'opportunity').length})
        </button>
        <button
          onClick={() => setFilter('warning')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            filter === 'warning'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Warnings ({insights.filter((i) => i.type === 'warning').length})
        </button>
      </div>

      {/* Insights List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Insights</h2>
        
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading insights...</p>
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Insights Yet</h3>
            <p className="text-gray-600 mb-6">
              Generate your first AI-powered insights to discover cost savings and optimization
              opportunities.
            </p>
            <button
              onClick={handleGenerateInsights}
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md"
            >
              <Sparkles className="w-5 h-5" />
              Generate Insights
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <InsightsCard
                key={insight.id}
                insight={insight}
                onAcknowledge={handleAcknowledge}
              />
            ))}
          </div>
        )}
      </div>

      {/* AI Info Banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
        <div className="flex items-start gap-3">
          <Brain className="w-6 h-6 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-indigo-900 mb-2">How AI Insights Work</h3>
            <ul className="text-sm text-indigo-800 space-y-1">
              <li>• <strong>Anomaly Detection:</strong> Identifies unusual spending spikes that may require review</li>
              <li>• <strong>Duplicate Detection:</strong> Finds potential duplicate charges or expenses</li>
              <li>• <strong>Benchmark Comparison:</strong> Compares your spending to industry standards</li>
              <li>• <strong>Cost Optimization:</strong> Suggests areas where you can reduce expenses</li>
              <li>• <strong>Trend Analysis:</strong> Tracks spending patterns over time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

