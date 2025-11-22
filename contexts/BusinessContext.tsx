'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Business, Expense, Revenue, InventoryItem } from '@/types'

interface BusinessContextType {
  businesses: Business[]
  selectedBusiness: Business | null
  setSelectedBusiness: (business: Business | null) => void
  expenses: Expense[]
  revenues: Revenue[]
  inventory: InventoryItem[]
  loading: boolean
  refreshData: () => void
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  // Load businesses
  useEffect(() => {
    if (!user) {
      setBusinesses([])
      setSelectedBusiness(null)
      setLoading(false)
      return
    }

    const q = query(collection(db, 'businesses'), where('userId', '==', user.uid))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const businessList: Business[] = []
      snapshot.forEach((doc) => {
        businessList.push({ id: doc.id, ...doc.data() } as Business)
      })
      setBusinesses(businessList)
      
      // Auto-select first business if none selected
      if (businessList.length > 0 && !selectedBusiness) {
        setSelectedBusiness(businessList[0])
      } else if (businessList.length === 0) {
        setSelectedBusiness(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  // Load expenses, revenues, and inventory for selected business
  useEffect(() => {
    if (!selectedBusiness) {
      setExpenses([])
      setRevenues([])
      setInventory([])
      return
    }

    // Expenses listener
    const expensesQuery = query(
      collection(db, 'expenses'),
      where('businessId', '==', selectedBusiness.id)
    )
    const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const expensesList: Expense[] = []
      snapshot.forEach((doc) => {
        expensesList.push({ id: doc.id, ...doc.data() } as Expense)
      })
      setExpenses(expensesList)
    })

    // Revenues listener
    const revenuesQuery = query(
      collection(db, 'revenues'),
      where('businessId', '==', selectedBusiness.id)
    )
    const unsubRevenues = onSnapshot(revenuesQuery, (snapshot) => {
      const revenuesList: Revenue[] = []
      snapshot.forEach((doc) => {
        revenuesList.push({ id: doc.id, ...doc.data() } as Revenue)
      })
      setRevenues(revenuesList)
    })

    // Inventory listener
    const inventoryQuery = query(
      collection(db, 'inventory'),
      where('businessId', '==', selectedBusiness.id)
    )
    const unsubInventory = onSnapshot(inventoryQuery, (snapshot) => {
      const inventoryList: InventoryItem[] = []
      snapshot.forEach((doc) => {
        inventoryList.push({ id: doc.id, ...doc.data() } as InventoryItem)
      })
      setInventory(inventoryList)
    })

    return () => {
      unsubExpenses()
      unsubRevenues()
      unsubInventory()
    }
  }, [selectedBusiness])

  const refreshData = () => {
    // Data refreshes automatically via listeners
    // This function is here for manual refresh if needed
  }

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        selectedBusiness,
        setSelectedBusiness,
        expenses,
        revenues,
        inventory,
        loading,
        refreshData,
      }}
    >
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusinessContext() {
  const context = useContext(BusinessContext)
  if (context === undefined) {
    throw new Error('useBusinessContext must be used within a BusinessProvider')
  }
  return context
}

