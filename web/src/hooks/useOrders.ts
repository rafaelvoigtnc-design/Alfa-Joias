import { useState, useEffect } from 'react'
// Supabase import removed during Firebase migration

// Placeholder Order type
interface Order {
  id: string
  [key: string]: any
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    console.log('⚠️ Supabase orders temporariamente desabilitado durante migração para Firebase')
    setLoading(false)
  }

  const updateOrderStatus = async (orderId: string, status: string, extraUpdates?: Record<string, any>) => {
    console.log('⚠️ Supabase orders temporariamente desabilitado durante migração para Firebase')
    throw new Error('Orders temporarily disabled during Firebase migration')
  }

  const addTrackingNumber = async (orderId: string, trackingNumber: string) => {
    console.log('⚠️ Supabase orders temporariamente desabilitado durante migração para Firebase')
    throw new Error('Orders temporarily disabled during Firebase migration')
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrderStatus,
    addTrackingNumber
  }
}
