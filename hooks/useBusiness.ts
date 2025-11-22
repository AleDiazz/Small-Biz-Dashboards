'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Business } from '@/types'
import { useAuth } from './useAuth'

const SELECTED_BUSINESS_KEY = 'selectedBusinessId'

export function useBusiness() {
  const { user } = useAuth()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setBusinesses([])
      setSelectedBusiness(null)
      localStorage.removeItem(SELECTED_BUSINESS_KEY)
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
      
      // Try to restore previously selected business from localStorage
      const savedBusinessId = localStorage.getItem(SELECTED_BUSINESS_KEY)
      const savedBusiness = businessList.find(b => b.id === savedBusinessId)
      
      setSelectedBusiness(prev => {
        // If there's a previously selected business and it still exists, keep it
        if (prev && businessList.find(b => b.id === prev.id)) {
          return prev
        }
        // If there's a saved business in localStorage, use it
        if (savedBusiness) {
          return savedBusiness
        }
        // Otherwise, auto-select first business if none selected
        if (businessList.length > 0) {
          return businessList[0]
        }
        return null
      })
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  // Save selected business to localStorage whenever it changes
  const handleSetSelectedBusiness = (business: Business | null) => {
    setSelectedBusiness(business)
    if (business) {
      localStorage.setItem(SELECTED_BUSINESS_KEY, business.id)
    } else {
      localStorage.removeItem(SELECTED_BUSINESS_KEY)
    }
  }

  return { 
    businesses, 
    selectedBusiness, 
    setSelectedBusiness: handleSetSelectedBusiness, 
    loading 
  }
}

