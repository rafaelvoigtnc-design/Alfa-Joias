import { useState, useEffect } from 'react'
import { supabase, Review } from '@/lib/supabase'

export function useReviews(productId?: string) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = async (id?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('reviews')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false })

      if (id || productId) {
        query = query.eq('product_id', id || productId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      
      setReviews(data || [])
    } catch (err) {
      console.error('Erro ao carregar avaliações:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar avaliações')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const addReview = async (reviewData: {
    order_id: string
    product_id: string
    rating: number
    comment?: string
    customer_name?: string
    customer_email?: string
  }) => {
    try {
      console.log('📝 Salvando avaliação:', {
        order_id: reviewData.order_id,
        product_id: reviewData.product_id,
        rating: reviewData.rating,
        hasComment: !!reviewData.comment,
        customer_name: reviewData.customer_name
      })

      const { data, error: insertError } = await supabase
        .from('reviews')
        .insert([{
          ...reviewData,
          approved: true // Aprovar automaticamente
        }])
        .select()
        .single()

      if (insertError) {
        console.error('❌ Erro ao salvar avaliação no banco:', insertError)
        throw insertError
      }

      console.log('✅ Avaliação salva com sucesso:', data)

      // Atualizar lista local
      setReviews(prev => [data, ...prev])
      
      // Recarregar avaliações para garantir sincronização
      if (productId || reviewData.product_id) {
        await fetchReviews(reviewData.product_id || productId)
      }

      return { data, error: null }
    } catch (err: any) {
      console.error('❌ Erro ao adicionar avaliação:', err)
      return { 
        data: null, 
        error: err instanceof Error ? err : new Error(err?.message || 'Erro ao salvar avaliação')
      }
    }
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

