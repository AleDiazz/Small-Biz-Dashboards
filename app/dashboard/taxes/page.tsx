'use client'

import { useState, useEffect } from 'react'
import { useBusiness } from '@/hooks/useBusiness'
import { useAuth } from '@/hooks/useAuth'
import { TaxReport } from '@/types'
import TaxSettingsForm from '@/components/TaxSettingsForm'
import TaxReportCard from '@/components/TaxReportCard'
import {
  Calculator,
  FileText,
  AlertCircle,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  Shield,
  ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'

export default function TaxesPage() {
  const { selectedBusiness } = useBusiness()
  const { user } = useAuth()
  const [reports, setReports] = useState<TaxReport[]>([])
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedPeriod, setSelectedPeriod] = useState<'quarterly' | 'annual'>('quarterly')
  const [selectedQuarter, setSelectedQuarter] = useState(1)
  const [showSettings, setShowSettings] = useState(true)

  useEffect(() => {
    if (selectedBusiness && user) {
      fetchReports()
    }
  }, [selectedBusiness, user])

  const fetchReports = async () => {
    // In a real implementation, you'd fetch existing reports from the API
    // For now, we'll keep it simple
    setReports([])
  }

  const handleCalculateTax = async () => {
    if (!selectedBusiness || !user) {
      toast.error('Please select a business first')
      return
    }

    try {
      setCalculating(true)
      const response = await fetch('/api/tax/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBusiness.id,
          userId: user.uid,
          period: selectedPeriod,
          year: selectedYear,
          quarter: selectedPeriod === 'quarterly' ? selectedQuarter : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to calculate tax')
      }

      const data = await response.json()
      setReports([data.report, ...reports])
      toast.success('Tax calculation completed!')
    } catch (error) {
      console.error('Error calculating tax:', error)
      toast.error('Failed to calculate tax')
    } finally {
      setCalculating(false)
    }
  }

  if (!selectedBusiness || !user) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Business Selected</h2>
        <p className="text-gray-600">Please select a business to manage taxes</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Calculator className="w-8 h-8 text-primary-600" />
            </div>
            Tax Management
          </h1>
          <p className="text-gray-600 mt-2">
            Track deductions, calculate tax obligations, and generate reports
          </p>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">Important Tax Information</h3>
            <p className="text-sm text-amber-800">
              This tool provides estimates based on your revenue and expense data. Always consult
              with a qualified tax professional for accurate tax advice, filing requirements, and
              compliance. Tax laws vary by jurisdiction and business structure.
            </p>
          </div>
        </div>
      </div>

      {/* Tax Settings Section */}
      <div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center justify-between w-full mb-4 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span className="font-semibold text-gray-900">Tax Settings Configuration</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-600 transition-transform ${
              showSettings ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        {showSettings && (
          <TaxSettingsForm
            businessId={selectedBusiness.id}
            userId={user.uid}
            onSave={() => {
              toast.success('Settings saved! You can now calculate taxes.')
            }}
          />
        )}
      </div>

      {/* Calculate Tax Section */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl shadow-sm border border-primary-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary-500 rounded-lg">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Calculate Tax Obligations</h2>
            <p className="text-sm text-gray-600">
              Generate tax reports based on your transactions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Period Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period Type</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'quarterly' | 'annual')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              {[0, 1, 2].map((offset) => {
                const year = new Date().getFullYear() - offset
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Quarter (if quarterly) */}
          {selectedPeriod === 'quarterly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quarter</label>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value={1}>Q1 (Jan - Mar)</option>
                <option value={2}>Q2 (Apr - Jun)</option>
                <option value={3}>Q3 (Jul - Sep)</option>
                <option value={4}>Q4 (Oct - Dec)</option>
              </select>
            </div>
          )}

          {/* Calculate Button */}
          <div className={selectedPeriod === 'quarterly' ? '' : 'md:col-span-2'}>
            <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
            <button
              onClick={handleCalculateTax}
              disabled={calculating}
              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {calculating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  Calculate Tax
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-primary-200">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Reports Generated</p>
            <p className="text-2xl font-bold text-primary-600">{reports.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Current Year</p>
            <p className="text-2xl font-bold text-primary-600">{new Date().getFullYear()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Current Quarter</p>
            <p className="text-2xl font-bold text-primary-600">
              Q{Math.floor(new Date().getMonth() / 3) + 1}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Business Type</p>
            <p className="text-sm font-semibold text-primary-600 mt-2">
              {selectedBusiness.type}
            </p>
          </div>
        </div>
      </div>

      {/* Tax Reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-600" />
            Tax Reports
          </h2>
          {reports.length > 0 && (
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All
            </button>
          )}
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tax Reports Yet</h3>
              <p className="text-gray-600 mb-6">
                Calculate your first tax report using the calculator above. Reports will help you
                track deductions and estimate tax obligations.
              </p>
              <button
                onClick={handleCalculateTax}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Calculator className="w-5 h-5" />
                Calculate First Report
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reports.map((report) => (
              <TaxReportCard
                key={report.id}
                report={report}
                onDownload={() => {
                  toast.success('Download feature coming soon!')
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tax Resources */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Tax Planning Resources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Quarterly Deadlines</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Q1: April 15</li>
              <li>• Q2: June 15</li>
              <li>• Q3: September 15</li>
              <li>• Q4: January 15 (next year)</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Common Deductions</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Office supplies & equipment</li>
              <li>• Business travel & meals (50%)</li>
              <li>• Professional services</li>
              <li>• Insurance premiums</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

