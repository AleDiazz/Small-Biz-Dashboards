'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useBusiness } from '@/hooks/useBusiness'
import { Expense, Revenue, InventoryItem } from '@/types'
import { 
  DollarSign, 
  TrendingDown, 
  Package, 
  AlertCircle, 
  TrendingUp, 
  Plus, 
  FileDown,
  Activity,
  Target,
  Calendar
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts'
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, startOfYear, endOfYear } from 'date-fns'
import { generateComprehensiveReport } from '@/lib/pdfGenerator'
import { formatCurrency, firestoreTimestampToDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'
import ComparisonBadge from '@/components/ComparisonBadge'
import CustomDateRangePicker from '@/components/CustomDateRangePicker'
import SkeletonLoader from '@/components/SkeletonLoader'

type TimePeriod = 'this-week' | 'this-month' | 'last-month' | 'year-to-date'

export default function DashboardPage() {
  const { selectedBusiness } = useBusiness()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('this-month')
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)

  useEffect(() => {
    if (!selectedBusiness) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch expenses
        const expensesQuery = query(
          collection(db, 'expenses'),
          where('businessId', '==', selectedBusiness.id)
        )
        const expensesSnapshot = await getDocs(expensesQuery)
        const expensesList: Expense[] = []
        expensesSnapshot.forEach((doc) => {
          expensesList.push({ id: doc.id, ...doc.data() } as Expense)
        })
        // Sort on client-side and limit to 100
        expensesList.sort((a, b) => {
          const dateA = firestoreTimestampToDate(a.date).getTime()
          const dateB = firestoreTimestampToDate(b.date).getTime()
          return dateB - dateA
        })
        setExpenses(expensesList.slice(0, 100))

        // Fetch revenues
        const revenuesQuery = query(
          collection(db, 'revenues'),
          where('businessId', '==', selectedBusiness.id)
        )
        const revenuesSnapshot = await getDocs(revenuesQuery)
        const revenuesList: Revenue[] = []
        revenuesSnapshot.forEach((doc) => {
          revenuesList.push({ id: doc.id, ...doc.data() } as Revenue)
        })
        // Sort on client-side and limit to 100
        revenuesList.sort((a, b) => {
          const dateA = firestoreTimestampToDate(a.date).getTime()
          const dateB = firestoreTimestampToDate(b.date).getTime()
          return dateB - dateA
        })
        setRevenues(revenuesList.slice(0, 100))

        // Fetch inventory
        const inventoryQuery = query(
          collection(db, 'inventory'),
          where('businessId', '==', selectedBusiness.id)
        )
        const inventorySnapshot = await getDocs(inventoryQuery)
        const inventoryList: InventoryItem[] = []
        inventorySnapshot.forEach((doc) => {
          inventoryList.push({ id: doc.id, ...doc.data() } as InventoryItem)
        })
        setInventory(inventoryList)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedBusiness])

  if (!selectedBusiness) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Business Selected</h2>
        <p className="text-gray-600 mb-6">Create your first business to get started</p>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Business
        </Link>
      </div>
    )
  }

  // Get date range for selected period
  const getDateRange = (period: TimePeriod) => {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (period) {
      case 'this-week':
        startDate = startOfWeek(now, { weekStartsOn: 0 })
        endDate = endOfWeek(now, { weekStartsOn: 0 })
        break
      case 'this-month':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case 'last-month':
        startDate = startOfMonth(subMonths(now, 1))
        endDate = endOfMonth(subMonths(now, 1))
        break
      case 'year-to-date':
        startDate = startOfYear(now)
        endDate = now
        break
    }

    return { startDate, endDate }
  }

  const { startDate, endDate } = getDateRange(selectedPeriod)

  // Filter data by selected period
  const filteredRevenues = revenues.filter(r => {
    const date = firestoreTimestampToDate(r.date)
    return date >= startDate && date <= endDate
  })

  const filteredExpenses = expenses.filter(e => {
    const date = firestoreTimestampToDate(e.date)
    return date >= startDate && date <= endDate
  })

  // Calculate totals from filtered data
  const totalRevenue = filteredRevenues.reduce((sum, rev) => sum + rev.amount, 0)
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0
  const lowStockItems = inventory.filter((item) => item.quantity <= item.minQuantity)
  
  // Additional metrics from filtered data
  const avgRevenue = filteredRevenues.length > 0 ? totalRevenue / filteredRevenues.length : 0
  const avgExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0
  const totalTransactions = filteredRevenues.length + filteredExpenses.length
  const inventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0)

  // Period over period comparison
  const getPreviousPeriodRange = (period: TimePeriod) => {
    const now = new Date()
    let prevStartDate: Date
    let prevEndDate: Date

    switch (period) {
      case 'this-week':
        prevStartDate = startOfWeek(subDays(now, 7), { weekStartsOn: 0 })
        prevEndDate = endOfWeek(subDays(now, 7), { weekStartsOn: 0 })
        break
      case 'this-month':
        prevStartDate = startOfMonth(subMonths(now, 1))
        prevEndDate = endOfMonth(subMonths(now, 1))
        break
      case 'last-month':
        prevStartDate = startOfMonth(subMonths(now, 2))
        prevEndDate = endOfMonth(subMonths(now, 2))
        break
      case 'year-to-date':
        prevStartDate = startOfYear(subMonths(now, 12))
        prevEndDate = endOfYear(subMonths(now, 12))
        break
    }

    return { prevStartDate, prevEndDate }
  }

  const { prevStartDate, prevEndDate } = getPreviousPeriodRange(selectedPeriod)

  const currentPeriodRevenue = totalRevenue

  const previousPeriodRevenue = revenues
    .filter(r => {
      const date = firestoreTimestampToDate(r.date)
      return date >= prevStartDate && date <= prevEndDate
    })
    .reduce((sum, r) => sum + r.amount, 0)

  const periodOverPeriodChange = previousPeriodRevenue > 0 
    ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
    : 0

  // Prepare daily chart data for selected period
  const getDaysInPeriod = () => {
    const days = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      days.push(format(current, 'MMM dd'))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const periodDays = getDaysInPeriod()

  const dailyData = periodDays.map((day) => {
    const dayRevenue = filteredRevenues
      .filter((rev) => format(firestoreTimestampToDate(rev.date), 'MMM dd') === day)
      .reduce((sum, rev) => sum + rev.amount, 0)
    
    const dayExpense = filteredExpenses
      .filter((exp) => format(firestoreTimestampToDate(exp.date), 'MMM dd') === day)
      .reduce((sum, exp) => sum + exp.amount, 0)
    
    return { 
      date: day, 
      revenue: dayRevenue,
      expense: dayExpense,
      profit: dayRevenue - dayExpense
    }
  })

  // Category breakdown (filtered)
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }))

  // Revenue by source (filtered)
  const revenuesBySource = filteredRevenues.reduce((acc, revenue) => {
    acc[revenue.source] = (acc[revenue.source] || 0) + revenue.amount
    return acc
  }, {} as Record<string, number>)

  const sourceData = Object.entries(revenuesBySource)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Top transactions (filtered)
  const topRevenues = [...filteredRevenues]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  const topExpenses = [...filteredExpenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  const COLORS = ['#f59e0b', '#fbbf24', '#fcd34d', '#22c55e', '#4ade80', '#ef4444', '#60a5fa', '#a78bfa']

  const handleExportReport = async (period: 'this-week' | 'this-month' | 'last-month' | 'year-to-date' | 'custom', customStartDate?: Date, customEndDate?: Date) => {
    if (!selectedBusiness) return
    
    setGeneratingPDF(period)
    try {
      let startDate: Date
      let endDate: Date
      
      if (period === 'custom' && customStartDate && customEndDate) {
        startDate = customStartDate
        endDate = customEndDate
      } else {
        switch (period) {
          case 'this-week':
            startDate = startOfWeek(new Date(), { weekStartsOn: 0 })
            endDate = endOfWeek(new Date(), { weekStartsOn: 0 })
            break
          case 'this-month':
            startDate = startOfMonth(new Date())
            endDate = endOfMonth(new Date())
            break
          case 'last-month':
            startDate = startOfMonth(subMonths(new Date(), 1))
            endDate = endOfMonth(subMonths(new Date(), 1))
            break
          case 'year-to-date':
            startDate = startOfYear(new Date())
            endDate = new Date()
            break
          default:
            throw new Error('Invalid period selected')
        }
      }
      
      await generateComprehensiveReport({
        business: selectedBusiness,
        revenues,
        expenses,
        inventory,
        startDate,
        endDate,
      })
      
      toast.success('Report generated successfully!')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    } finally {
      setGeneratingPDF(null)
    }
  }

  const handleCustomDateSelect = (startDate: Date, endDate: Date) => {
    handleExportReport('custom', startDate, endDate)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="stats" count={4} />
        <SkeletonLoader type="chart" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
        </div>
      </div>
    )
  }

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case 'this-week':
        return `This Week (${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')})`
      case 'this-month':
        return `This Month (${format(startDate, 'MMM yyyy')})`
      case 'last-month':
        return `Last Month (${format(startDate, 'MMM yyyy')})`
      case 'year-to-date':
        return `Year to Date (${format(startDate, 'MMM yyyy')} - Now)`
    }
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard & Analytics</h1>
          <p className="text-gray-600 mt-1">Complete business insights for {selectedBusiness.name}</p>
        </div>

        {/* Time Period Selector */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSelectedPeriod('this-week')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedPeriod === 'this-week'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setSelectedPeriod('this-month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedPeriod === 'this-month'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setSelectedPeriod('last-month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedPeriod === 'last-month'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setSelectedPeriod('year-to-date')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedPeriod === 'year-to-date'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Year to Date
          </button>
        </div>
      </div>

      {/* Period Info Banner */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-3">
        <p className="text-sm text-primary-900">
          <span className="font-semibold">Viewing:</span> {getPeriodLabel(selectedPeriod)}
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-success-600" />
            <ComparisonBadge change={periodOverPeriodChange} />
          </div>
          <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">{filteredRevenues.length} transactions</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-danger-600" />
          </div>
          <p className="text-sm text-gray-600 font-medium">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
          <p className="text-xs text-gray-500 mt-1">{filteredExpenses.length} transactions</p>
        </div>

        {/* Net Profit */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className={`w-8 h-8 ${netProfit >= 0 ? 'text-amber-600' : 'text-gray-600'}`} />
          </div>
          <p className="text-sm text-gray-600 font-medium">Net Profit</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-amber-600' : 'text-danger-600'}`}>
            {formatCurrency(Math.abs(netProfit))}
          </p>
          <p className="text-xs text-gray-500 mt-1">{profitMargin.toFixed(1)}% margin</p>
        </div>

        {/* Inventory Value */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-primary-600" />
            {lowStockItems.length > 0 && (
              <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
                {lowStockItems.length} low
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 font-medium">Inventory Value</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(inventoryValue)}</p>
          <p className="text-xs text-gray-500 mt-1">{inventory.length} items</p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-6 h-6 text-blue-600" />
            <p className="font-semibold text-blue-900">Average Revenue</p>
          </div>
          <p className="text-3xl font-bold text-blue-900">{formatCurrency(avgRevenue)}</p>
          <p className="text-sm text-blue-700 mt-1">per transaction</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-6 h-6 text-purple-600" />
            <p className="font-semibold text-purple-900">Average Expense</p>
          </div>
          <p className="text-3xl font-bold text-purple-900">{formatCurrency(avgExpense)}</p>
          <p className="text-sm text-purple-700 mt-1">per transaction</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-6 h-6 text-amber-600" />
            <p className="font-semibold text-amber-900">Daily Average</p>
          </div>
          <p className="text-3xl font-bold text-amber-900">
            {formatCurrency(totalRevenue / Math.max(1, periodDays.length))}
          </p>
          <p className="text-sm text-amber-700 mt-1">revenue ({periodDays.length} days)</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 mb-1">Low Stock Alert</h4>
              <p className="text-sm text-orange-800">
                {lowStockItems.length} item{lowStockItems.length > 1 ? 's are' : ' is'} running low on stock.{' '}
                <Link href="/dashboard/inventory" className="underline font-medium">
                  View inventory
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Revenue vs Expenses Over Time */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Expenses - {getPeriodLabel(selectedPeriod)}</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              formatter={(value: any) => formatCurrency(value)}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              fill="#22c55e" 
              stroke="#22c55e" 
              fillOpacity={0.3}
              name="Revenue"
            />
            <Area 
              type="monotone" 
              dataKey="expense" 
              fill="#ef4444" 
              stroke="#ef4444" 
              fillOpacity={0.3}
              name="Expenses"
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#f59e0b" 
              strokeWidth={3}
              dot={{ fill: '#f59e0b', r: 4 }}
              name="Profit"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {categoryData.slice(0, 5).map((cat, index) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(cat.value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 py-8">No expense data</p>
          )}
        </div>

        {/* Revenue by Source */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Source</h3>
          {sourceData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {sourceData.map((source) => (
                  <div key={source.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{source.name}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(source.value)} ({((source.value / totalRevenue) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 py-8">No revenue data</p>
          )}
        </div>
      </div>

      {/* Top Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Revenues */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Revenue Entries</h3>
          <div className="space-y-3">
            {topRevenues.map((revenue, index) => (
              <div key={revenue.id} className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-success-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{revenue.source}</p>
                    <p className="text-xs text-gray-600">{revenue.description}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-success-600">
                  {formatCurrency(revenue.amount)}
                </span>
              </div>
            ))}
            {topRevenues.length === 0 && (
              <p className="text-center text-gray-500 py-4">No revenue entries yet</p>
            )}
          </div>
        </div>

        {/* Top Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Expense Entries</h3>
          <div className="space-y-3">
            {topExpenses.map((expense, index) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-danger-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-danger-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{expense.category}</p>
                    <p className="text-xs text-gray-600">{expense.description}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-danger-600">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            ))}
            {topExpenses.length === 0 && (
              <p className="text-center text-gray-500 py-4">No expense entries yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Analytics */}
      {inventory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
              <p className="text-sm text-primary-700 font-medium mb-1">Total Items</p>
              <p className="text-2xl font-bold text-primary-900">{inventory.length}</p>
            </div>
            <div className="bg-success-50 rounded-lg p-4 border border-success-200">
              <p className="text-sm text-success-700 font-medium mb-1">Total Value</p>
              <p className="text-2xl font-bold text-success-900">{formatCurrency(inventoryValue)}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <p className="text-sm text-orange-700 font-medium mb-1">Low Stock Items</p>
              <p className="text-2xl font-bold text-orange-900">{lowStockItems.length}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 mb-3">Top 5 Most Valuable Items</h4>
            {[...inventory]
              .sort((a, b) => (b.quantity * b.cost) - (a.quantity * a.cost))
              .slice(0, 5)
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-600">
                      {item.quantity} {item.unit} × {formatCurrency(item.cost)}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-primary-600">
                    {formatCurrency(item.quantity * item.cost)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Export Reports */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <FileDown className="w-6 h-6" />
          <h3 className="text-xl font-semibold">Export Comprehensive Reports</h3>
        </div>
        <p className="text-primary-100 text-sm mb-6">
          Generate professional PDF reports with all your revenue, expenses, inventory data, and visual charts
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* This Week Report */}
          <button
            onClick={() => handleExportReport('this-week')}
            disabled={generatingPDF !== null}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-all text-center group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium block mb-1">This Week</span>
            <span className="text-xs text-primary-100">
              {generatingPDF === 'this-week' ? 'Generating...' : `${format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'MMM d')} - ${format(endOfWeek(new Date(), { weekStartsOn: 0 }), 'd')}`}
            </span>
          </button>

          {/* This Month Report */}
          <button
            onClick={() => handleExportReport('this-month')}
            disabled={generatingPDF !== null}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-all text-center group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium block mb-1">This Month</span>
            <span className="text-xs text-primary-100">
              {generatingPDF === 'this-month' ? 'Generating...' : format(startOfMonth(new Date()), 'MMM yyyy')}
            </span>
          </button>

          {/* Last Month Report */}
          <button
            onClick={() => handleExportReport('last-month')}
            disabled={generatingPDF !== null}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-all text-center group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium block mb-1">Last Month</span>
            <span className="text-xs text-primary-100">
              {generatingPDF === 'last-month' ? 'Generating...' : format(subMonths(new Date(), 1), 'MMM yyyy')}
            </span>
          </button>

          {/* Year to Date Report */}
          <button
            onClick={() => handleExportReport('year-to-date')}
            disabled={generatingPDF !== null}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-all text-center group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium block mb-1">Year to Date</span>
            <span className="text-xs text-primary-100">
              {generatingPDF === 'year-to-date' ? 'Generating...' : format(startOfYear(new Date()), 'MMM yyyy') + ' - Now'}
            </span>
          </button>

          {/* Custom Date Range */}
          <button
            onClick={() => setShowCustomDatePicker(true)}
            disabled={generatingPDF !== null}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-all text-center group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Calendar className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium block mb-1">Custom Range</span>
            <span className="text-xs text-primary-100">
              Choose dates
            </span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker Modal */}
      {showCustomDatePicker && (
        <CustomDateRangePicker
          onSelect={handleCustomDateSelect}
          onClose={() => setShowCustomDatePicker(false)}
        />
      )}
    </div>
  )
}
