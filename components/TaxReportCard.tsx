'use client'

import { TaxReport } from '@/types'
import { FileText, Download, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'

interface TaxReportCardProps {
  report: TaxReport
  onDownload?: () => void
}

export default function TaxReportCard({ report, onDownload }: TaxReportCardProps) {
  const getReportTitle = () => {
    if (report.reportType === 'quarterly' && report.quarter) {
      return `Q${report.quarter} ${report.year} Tax Report`
    }
    return `${report.year} Annual Tax Report`
  }

  const effectiveTaxRate = report.totalRevenue > 0 
    ? (report.estimatedTaxOwed / report.totalRevenue) * 100 
    : 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{getReportTitle()}</h3>
              <p className="text-sm text-primary-100">
                Generated {format(report.createdAt instanceof Date ? report.createdAt : new Date(report.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          {onDownload && (
            <button
              onClick={onDownload}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Total Revenue */}
          <div className="bg-success-50 rounded-lg p-4 border border-success-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success-600" />
              <p className="text-xs font-medium text-success-700">Total Revenue</p>
            </div>
            <p className="text-2xl font-bold text-success-900">
              {formatCurrency(report.totalRevenue)}
            </p>
          </div>

          {/* Total Expenses */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-orange-600" />
              <p className="text-xs font-medium text-orange-700">Total Expenses</p>
            </div>
            <p className="text-2xl font-bold text-orange-900">
              {formatCurrency(report.totalExpenses)}
            </p>
          </div>

          {/* Deductible Expenses */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-medium text-blue-700">Deductible Expenses</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(report.deductibleExpenses)}
            </p>
          </div>

          {/* Estimated Tax Owed */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <p className="text-xs font-medium text-purple-700">Estimated Tax Owed</p>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {formatCurrency(report.estimatedTaxOwed)}
            </p>
          </div>
        </div>

        {/* Tax Summary */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Taxable Income</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(report.taxableIncome)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Effective Tax Rate</span>
            <span className="text-sm font-semibold text-gray-900">
              {effectiveTaxRate.toFixed(2)}%
            </span>
          </div>

          {report.salesTaxCollected > 0 && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sales Tax Collected</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(report.salesTaxCollected)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sales Tax Owed</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(report.salesTaxOwed)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Net Summary */}
        <div className="mt-4 pt-4 border-t-2 border-gray-300">
          <div className="flex justify-between items-center">
            <span className="text-base font-medium text-gray-900">Net After Tax</span>
            <span className="text-2xl font-bold text-primary-600">
              {formatCurrency(report.taxableIncome - report.estimatedTaxOwed)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

