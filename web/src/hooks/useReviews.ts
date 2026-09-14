import { useState, useEffect } from 'react'
// Supabase import removed during Firebase migration

// Placeholder Review type
interface Review {
  id: string
  [key: string]: any
}

export function useReviews(productId?: string) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = async (id?: string) => {
    console.log('⚠️ Supabase reviews temporariamente desabilitado durante migração para Firebase')
    setLoading(false)
  }

  const addReview = async (reviewData: {
    order_id: string
    product_id: string
    rating: number
    comment?: string
    customer_name?: string
    customer_email?: string
  }) => {
    console.log('⚠️ Supabase reviews temporariamente desabilitado durante migração para Firebase')
    throw new Error('Reviews temporarily disabled during Firebase migration')
  }

  useEffect(() => {
    if (productId) {
      fetchReviews(productId)
    }
  }, [productId])

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    addReview
  }
}
