'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Business } from '@/types'
import { useAuth } from './useAuth'

export function useBusiness() {
  const { user } = useAuth()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

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
      setSelectedBusiness(prev => {
        if (businessList.length > 0 && !prev) {
          return businessList[0]
        }
        return prev
      })
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  return { businesses, selectedBusiness, setSelectedBusiness, loading }
}

