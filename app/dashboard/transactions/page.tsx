'use client'

import { useState, useEffect } from 'react'
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useBusiness } from '@/hooks/useBusiness'
import { useAuth } from '@/hooks/useAuth'
import { Expense, Revenue, RecurringTransaction } from '@/types'
import { DollarSign, TrendingDown, Trash2, Calendar, Tag, FileText, Repeat, Clock } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { firestoreTimestampToDate, formatCurrency } from '@/lib/utils'
import RecurringTransactionForm from '@/components/RecurringTransactionForm'

export default function TransactionsPage() {
  const { selectedBusiness } = useBusiness()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])

  // Revenue form state
  const [revenueAmount, setRevenueAmount] = useState('')
  const [revenueSource, setRevenueSource] = useState('')
  const [revenueDescription, setRevenueDescription] = useState('')
  const [revenueDate, setRevenueDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  // Expense form state
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseCategory, setExpenseCategory] = useState('')
  const [expenseDescription, setExpenseDescription] = useState('')
  const [expenseDate, setExpenseDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const expenseCategories = [
    'Salaries',
    'Rent',
    'Utilities',
    'Marketing',
    'Supplies',
    'Equipment',
    'Transportation',
    'Insurance',
    'Taxes',
    'Other',
  ]

  const revenueSources = [
    'Product Sales',
    'Service Revenue',
    'Consulting',
    'Subscription',
    'Commission',
    'Interest',
    'Other',
  ]

  useEffect(() => {
    if (selectedBusiness && user) {
      fetchAllTransactions()
      fetchRecurringTransactions()
    }
  }, [selectedBusiness, user])

  const fetchAllTransactions = async () => {
    if (!selectedBusiness) return

    setLoading(true)
    try {
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
      // Sort on client-side to avoid needing Firestore index
      revenuesList.sort((a, b) => {
        const dateA = firestoreTimestampToDate(a.date).getTime()
        const dateB = firestoreTimestampToDate(b.date).getTime()
        return dateB - dateA // desc order
      })
      setRevenues(revenuesList)

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
      // Sort on client-side to avoid needing Firestore index
      expensesList.sort((a, b) => {
        const dateA = firestoreTimestampToDate(a.date).getTime()
        const dateB = firestoreTimestampToDate(b.date).getTime()
        return dateB - dateA // desc order
      })
      setExpenses(expensesList)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to load transactions')
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

  const handleAddRevenue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBusiness) return

    try {
      await addDoc(collection(db, 'revenues'), {
        businessId: selectedBusiness.id,
        amount: parseFloat(revenueAmount),
        source: revenueSource,
        description: revenueDescription,
        date: new Date(revenueDate),
      })

      toast.success('Revenue added successfully!')
      setRevenueAmount('')
      setRevenueSource('')
      setRevenueDescription('')
      setRevenueDate(format(new Date(), 'yyyy-MM-dd'))
      fetchAllTransactions()
    } catch (error) {
      console.error('Error adding revenue:', error)
      toast.error('Failed to add revenue')
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBusiness) return

    try {
      await addDoc(collection(db, 'expenses'), {
        businessId: selectedBusiness.id,
        amount: parseFloat(expenseAmount),
        category: expenseCategory,
        description: expenseDescription,
        date: new Date(expenseDate),
      })

      toast.success('Expense added successfully!')
      setExpenseAmount('')
      setExpenseCategory('')
      setExpenseDescription('')
      setExpenseDate(format(new Date(), 'yyyy-MM-dd'))
      fetchAllTransactions()
    } catch (error) {
      console.error('Error adding expense:', error)
      toast.error('Failed to add expense')
    }
  }

  const handleDeleteRevenue = async (id: string) => {
    if (!confirm('Are you sure you want to delete this revenue entry?')) return

    try {
      await deleteDoc(doc(db, 'revenues', id))
      toast.success('Revenue deleted successfully!')
      fetchAllTransactions()
    } catch (error) {
      console.error('Error deleting revenue:', error)
      toast.error('Failed to delete revenue')
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    try {
      await deleteDoc(doc(db, 'expenses', id))
      toast.success('Expense deleted successfully!')
      fetchAllTransactions()
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast.error('Failed to delete expense')
    }
  }

  if (!selectedBusiness) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please select a business to manage transactions</p>
      </div>
    )
  }

  const activeRecurring = recurringTransactions.filter((t) => t.active)
  const recurringRevenue = activeRecurring.filter((t) => t.type === 'revenue')
  const recurringExpenses = activeRecurring.filter((t) => t.type === 'expense')

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600 mt-1">Track all your revenue, expenses, and recurring transactions</p>
      </div>

      {/* Recurring Transactions Section */}
      {user && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500 rounded-lg">
              <Repeat className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">Recurring Transactions</h2>
              <p className="text-sm text-gray-600">
                Manage scheduled payments and income • {activeRecurring.length} active
              </p>
            </div>
          </div>

          <div className="mb-6">
            <RecurringTransactionForm
              businessId={selectedBusiness.id}
              userId={user.uid}
              onSuccess={() => {
                fetchRecurringTransactions()
                toast.success('Recurring transaction added!')
              }}
            />
          </div>

          {recurringTransactions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recurring Revenue */}
              <div className="bg-white rounded-lg p-4 border border-success-200">
                <h3 className="font-semibold text-success-700 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Recurring Revenue ({recurringRevenue.length})
                </h3>
                {recurringRevenue.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No recurring revenue</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {recurringRevenue.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="p-3 bg-success-50 rounded-lg border border-success-200 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{transaction.name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                            <span className="font-semibold text-success-600">
                              {formatCurrency(transaction.amount)}
                            </span>
                            <span>•</span>
                            <span>{transaction.frequency}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteRecurring(transaction.id)}
                          className="p-1.5 hover:bg-red-100 rounded transition-colors group"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recurring Expenses */}
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h3 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Recurring Expenses ({recurringExpenses.length})
                </h3>
                {recurringExpenses.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No recurring expenses</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {recurringExpenses.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="p-3 bg-orange-50 rounded-lg border border-orange-200 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{transaction.name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                            <span className="font-semibold text-orange-600">
                              {formatCurrency(transaction.amount)}
                            </span>
                            <span>•</span>
                            <span>{transaction.frequency}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteRecurring(transaction.id)}
                          className="p-1.5 hover:bg-red-100 rounded transition-colors group"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No recurring transactions yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Add scheduled revenue or expenses to track them automatically
              </p>
            </div>
          )}
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* REVENUE COLUMN */}
        <div className="space-y-6">
          {/* Revenue Form */}
          <div className="bg-gradient-to-br from-success-50 to-success-100 border border-success-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-success-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-success-900">Add Revenue</h2>
                <p className="text-sm text-success-700">Record income for your business</p>
              </div>
            </div>

            <form onSubmit={handleAddRevenue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-success-900 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={revenueAmount}
                  onChange={(e) => setRevenueAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-success-300 rounded-lg focus:ring-2 focus:ring-success-500 focus:border-transparent bg-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-success-900 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Source *
                </label>
                <select
                  required
                  value={revenueSource}
                  onChange={(e) => setRevenueSource(e.target.value)}
                  className="w-full px-4 py-2 border border-success-300 rounded-lg focus:ring-2 focus:ring-success-500 focus:border-transparent bg-white"
                >
                  <option value="">Select source</option>
                  {revenueSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-success-900 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={revenueDate}
                  onChange={(e) => setRevenueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-success-300 rounded-lg focus:ring-2 focus:ring-success-500 focus:border-transparent bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-success-900 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Description
                </label>
                <textarea
                  value={revenueDescription}
                  onChange={(e) => setRevenueDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-success-300 rounded-lg focus:ring-2 focus:ring-success-500 focus:border-transparent bg-white resize-none"
                  placeholder="Additional details (optional)"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-success-600 text-white py-3 rounded-lg hover:bg-success-700 transition-colors font-medium shadow-lg"
              >
                Add Revenue
              </button>
            </form>
          </div>

          {/* Revenue List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Revenue</h3>
              <span className="text-sm font-semibold text-success-600">{revenues.length} entries</span>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-success-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading...</p>
              </div>
            ) : revenues.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-success-600" />
                </div>
                <p className="text-gray-600">No revenue entries yet</p>
                <p className="text-sm text-gray-500 mt-1">Add your first entry above</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {revenues.map((revenue) => (
                  <div
                    key={revenue.id}
                    className="p-4 rounded-lg bg-success-50 border-2 border-success-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-success-600" />
                          <span className="font-semibold text-success-900">{revenue.source}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{revenue.description || 'No description'}</p>
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(firestoreTimestampToDate(revenue.date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-success-600">
                          {formatCurrency(revenue.amount)}
                        </span>
                        <button
                          onClick={() => handleDeleteRevenue(revenue.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* EXPENSES COLUMN */}
        <div className="space-y-6">
          {/* Expense Form */}
          <div className="bg-gradient-to-br from-danger-50 to-danger-100 border border-danger-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-danger-500 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-danger-900">Add Expense</h2>
                <p className="text-sm text-danger-700">Track your business costs</p>
              </div>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-danger-900 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-danger-300 rounded-lg focus:ring-2 focus:ring-danger-500 focus:border-transparent bg-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-danger-900 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Category *
                </label>
                <select
                  required
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-danger-300 rounded-lg focus:ring-2 focus:ring-danger-500 focus:border-transparent bg-white"
                >
                  <option value="">Select category</option>
                  {expenseCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-danger-900 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-4 py-2 border border-danger-300 rounded-lg focus:ring-2 focus:ring-danger-500 focus:border-transparent bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-danger-900 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Description
                </label>
                <textarea
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-danger-300 rounded-lg focus:ring-2 focus:ring-danger-500 focus:border-transparent bg-white resize-none"
                  placeholder="Additional details (optional)"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-danger-600 text-white py-3 rounded-lg hover:bg-danger-700 transition-colors font-medium shadow-lg"
              >
                Add Expense
              </button>
            </form>
          </div>

          {/* Expenses List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Expenses</h3>
              <span className="text-sm font-semibold text-danger-600">{expenses.length} entries</span>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-danger-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingDown className="w-6 h-6 text-danger-600" />
                </div>
                <p className="text-gray-600">No expense entries yet</p>
                <p className="text-sm text-gray-500 mt-1">Add your first entry above</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="p-4 rounded-lg bg-danger-50 border-2 border-danger-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingDown className="w-4 h-4 text-danger-600" />
                          <span className="font-semibold text-danger-900">{expense.category}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{expense.description || 'No description'}</p>
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(firestoreTimestampToDate(expense.date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-danger-600">
                          {formatCurrency(expense.amount)}
                        </span>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
