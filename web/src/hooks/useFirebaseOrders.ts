'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  items: any[]
  total: number
  status: 'pending' | 'pending_whatsapp' | 'confirmed' | 'preparing' | 'ready' | 'ready_for_pickup' | 'delivered' | 'picked_up' | 'cancelled'
  delivery_method?: 'delivery' | 'pickup'
  address?: any
  notes?: string
  created_at: any
  updated_at: any
  delivered_at?: any
  picked_up_at?: any
}

export function useFirebaseOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const ordersRef = collection(db, 'orders')
        const q = query(ordersRef, orderBy('created_at', 'desc'))
        const snapshot = await getDocs(q)
        
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[]
        
        setOrders(ordersData)
        setError(null)
      } catch (err) {
        console.error('Erro ao carregar pedidos:', err)
        setError('Erro ao carregar pedidos')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const refetch = async () => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const ordersRef = collection(db, 'orders')
        const q = query(ordersRef, orderBy('created_at', 'desc'))
        const snapshot = await getDocs(q)
        
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[]
        
        setOrders(ordersData)
        setError(null)
      } catch (err) {
        console.error('Erro ao carregar pedidos:', err)
        setError('Erro ao carregar pedidos')
      } finally {
        setLoading(false)
      }
    }
    await fetchOrders()
  }

  const updateOrderStatus = async (orderId: string, status: string, extraUpdates?: Record<string, any>) => {
    try {
      const orderRef = doc(db, 'orders', orderId)
      await updateDoc(orderRef, {
        status,
        updated_at: new Date(),
        ...extraUpdates
      })
      
      // Refetch orders after update
      await refetch()
      
      return { data: null, error: null }
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error)
      return { data: null, error }
    }
  }

  const addTrackingNumber = async (orderId: string, trackingNumber: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId)
      await updateDoc(orderRef, {
        tracking_number: trackingNumber,
        updated_at: new Date()
      })
      
      // Refetch orders after update
      await refetch()
      
      return { data: null, error: null }
    } catch (error) {
      console.error('Erro ao adicionar número de rastreio:', error)
      return { data: null, error }
    }
  }

  return {
    orders,
    loading,
    error,
    fetchOrders: refetch,
    refetch,
    updateOrderStatus,
    addTrackingNumber
  }
}
