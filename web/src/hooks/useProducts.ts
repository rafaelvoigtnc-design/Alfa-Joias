import { useState, useEffect, useRef } from 'react'
import { supabase, Product } from '@/lib/supabase'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Refs para prevenir race conditions
  const isFetchingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)

  const fetchProducts = async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (isFetchingRef.current) {
      console.log('⏸️ Já está buscando produtos, ignorando chamada duplicada...')
      return
    }
    
    // Incrementar ID da requisição para rastrear a mais recente (fora do try para estar acessível no catch)
    const currentRequestId = ++requestIdRef.current
    
    try {
      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      // Criar novo AbortController para esta requisição
      const controller = new AbortController()
      abortControllerRef.current = controller
      
      isFetchingRef.current = true
      setLoading(true)
      setError(null)
      console.log('🔄 Buscando produtos do Supabase...', { requestId: currentRequestId })
      
      // Adicionar timestamp para forçar bypass do cache do Cloudflare/CDN
      const timestamp = Date.now()
      const response = await fetch(`/api/products?_t=${timestamp}`, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        signal: controller.signal
      })
      
      // Verificar se esta requisição foi cancelada
      if (controller.signal.aborted) {
        console.log('⏹️ Requisição cancelada (nova requisição iniciada)')
        return
      }
      
      // Verificar se ainda é a requisição mais recente
      if (currentRequestId !== requestIdRef.current) {
        console.log('⏹️ Requisição antiga ignorada (nova requisição já iniciada)')
        return
      }
      if (!response.ok) {
        const text = await response.text()
        console.error('❌ Erro na API de produtos:', response.status, text)
        if (currentRequestId === requestIdRef.current) {
          setProducts([])
          setLoading(false)
        }
        isFetchingRef.current = false
        return
      }
      
      const { success, products: data, error } = await response.json()
      
      // Verificar novamente se ainda é a requisição mais recente
      if (currentRequestId !== requestIdRef.current) {
        console.log('⏹️ Resposta de requisição antiga ignorada')
        return
      }
      
      if (!success) {
        console.error('❌ Erro ao buscar produtos:', error)
        if (currentRequestId === requestIdRef.current) {
          setProducts([])
          setLoading(false)
        }
        isFetchingRef.current = false
        return
      }
      
      if (!data || data.length === 0) {
        console.warn('⚠️ Banco de produtos vazio.')
        if (currentRequestId === requestIdRef.current) {
          setProducts([])
          setLoading(false)
        }
      } else {
        console.log('✅ Produtos carregados do Supabase:', data.length, { requestId: currentRequestId })
        if (currentRequestId === requestIdRef.current) {
          setProducts(data)
          setLoading(false)
        }
      }
      isFetchingRef.current = false
    } catch (err) {
      // Verificar se foi cancelamento (não é erro real)
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('⏹️ Requisição cancelada (nova requisição ou timeout)')
        return // Não atualizar estado se foi cancelada
      }
      
      console.error('❌ Erro ao carregar produtos:', err)
      const latestRequestId = requestIdRef.current
      if (currentRequestId === latestRequestId) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar produtos')
        setProducts([])
        setLoading(false)
      }
      isFetchingRef.current = false
    }
  }

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()

      if (error) throw error
      if (data) {
        setProducts(prev => [data[0], ...prev])
      }
      return data?.[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar produto')
      throw err
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()

      if (error) throw error
      if (data) {
        setProducts(prev => prev.map(p => p.id === id ? data[0] : p))
      }
      return data?.[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar produto')
      throw err
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar produto')
      throw err
    }
  }

  const getFeaturedProducts = () => {
    return products.filter(p => p.featured)
  }

  const getProductsOnSale = () => {
    return products.filter(p => p.on_sale)
  }

  const getProductsByCategory = (category: string) => {
    return products.filter(p => p.category === category)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    getFeaturedProducts,
    getProductsOnSale,
    getProductsByCategory,
    refetch: fetchProducts
  }
}









