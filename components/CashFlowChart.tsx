'use client'

import { CashFlowDay } from '@/types'
import {
  LineChart,
  Line,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'

interface CashFlowChartProps {
  dailyProjections: CashFlowDay[]
}

export default function CashFlowChart({ dailyProjections }: CashFlowChartProps) {
  const chartData = dailyProjections.map((day) => ({
    date: format(day.date instanceof Date ? day.date : new Date(day.date), 'MMM dd'),
    revenue: day.projectedRevenue,
    expenses: day.projectedExpenses,
    balance: day.projectedBalance,
    netFlow: day.projectedRevenue - day.projectedExpenses,
  }))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Cash Flow Projection
      </h3>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            interval="preserveStartEnd"
          />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: any) => formatCurrency(value)}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="balance"
            fill="url(#colorBalance)"
            stroke="#6366f1"
            strokeWidth={3}
            name="Projected Balance"
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: '#22c55e', r: 3 }}
            name="Revenue"
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 3 }}
            name="Expenses"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Average Daily Revenue</p>
          <p className="text-lg font-bold text-success-600">
            {formatCurrency(
              chartData.reduce((sum, d) => sum + d.revenue, 0) / chartData.length
            )}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Average Daily Expenses</p>
          <p className="text-lg font-bold text-danger-600">
            {formatCurrency(
              chartData.reduce((sum, d) => sum + d.expenses, 0) / chartData.length
            )}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Net Cash Flow</p>
          <p className="text-lg font-bold text-primary-600">
            {formatCurrency(
              chartData.reduce((sum, d) => sum + d.netFlow, 0)
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

