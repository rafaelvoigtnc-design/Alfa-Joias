import { useState, useEffect, useRef } from 'react'
import { supabase, Product } from '@/lib/supabase'

// Cache local para fallback
const CACHE_KEY = 'alfajoias-products-cache'
const CACHE_EXPIRY = 5 * 60 * 1000 // 5 minutos

interface CacheData {
  products: Product[]
  timestamp: number
}

function getCachedProducts(): Product[] | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    
    const data: CacheData = JSON.parse(cached)
    const now = Date.now()
    
    // Se cache expirou, retornar null
    if (now - data.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    
    return data.products
  } catch {
    return null
  }
}

function setCachedProducts(products: Product[]) {
  if (typeof window === 'undefined') return
  
  try {
    const data: CacheData = {
      products,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // Ignorar erros de localStorage
  }
}

// Função de retry com backoff exponencial
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<Response> {
  let lastError: any
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)
      
      // Se for erro de servidor (503, 500), tentar novamente
      if (response.status === 503 || response.status === 500) {
        if (attempt < maxRetries) {
          const waitTime = delayMs * Math.pow(2, attempt)
          console.log(`⏳ Tentativa ${attempt + 1}/${maxRetries + 1} falhou (${response.status}). Aguardando ${waitTime}ms...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }
      }
      
      return response
    } catch (error) {
      lastError = error
      if (attempt < maxRetries) {
        const waitTime = delayMs * Math.pow(2, attempt)
        console.log(`⏳ Tentativa ${attempt + 1}/${maxRetries + 1} falhou. Aguardando ${waitTime}ms...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }
  
  throw lastError
}

export function useSupabaseProducts() {
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
      console.log('🔄 Buscando produtos do banco de dados...', { requestId: currentRequestId })
      
      // Carregar cache local primeiro para melhor UX
      const cachedProducts = getCachedProducts()
      if (cachedProducts && cachedProducts.length > 0) {
        console.log('📦 Usando produtos do cache local enquanto busca atualização...', cachedProducts.length)
        setProducts(cachedProducts)
        setLoading(false) // Mostrar dados do cache imediatamente
      }
      
      // Timeout aumentado para 15 segundos (mais tempo para retries)
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      
      // Desabilitar cache para sempre buscar dados atualizados
      // Adicionar timestamp para forçar bypass do cache do Cloudflare/CDN
      const timestamp = Date.now()
      const response = await fetchWithRetry(
        `/api/products?_t=${timestamp}`,
        { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          signal: controller.signal
        },
        3, // 3 tentativas
        1000 // delay inicial de 1 segundo
      )
      
      clearTimeout(timeoutId)
      
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
        let errorData: any = {}
        try {
          errorData = JSON.parse(text)
        } catch {
          errorData = { error: text }
        }
        
        console.error('❌ Erro na API de produtos:', response.status, errorData)
        
        // Mensagem amigável para erros de conexão
        if (errorData.connectionError || response.status === 503) {
          setError('Erro de conexão. Verifique sua internet e tente novamente.')
        } else {
          setError(`Erro na API de produtos: ${errorData.error || response.status}`)
        }
        setProducts([])
        setLoading(false)
        isFetchingRef.current = false
        return
      }
      
      const { success, products: data, error, connectionError } = await response.json()
      
      // Verificar novamente se ainda é a requisição mais recente
      if (currentRequestId !== requestIdRef.current) {
        console.log('⏹️ Resposta de requisição antiga ignorada')
        return
      }
      
      if (!success) {
        console.error('❌ Erro ao buscar do banco:', error)
        const errorMsg = connectionError 
          ? 'Erro de conexão. Verifique sua internet e tente novamente.'
          : `Erro ao conectar com o banco de dados: ${error}`
        setError(errorMsg)
        setProducts([])
        setLoading(false)
        isFetchingRef.current = false
        return
      }
      
      if (!data || data.length === 0) {
        console.warn('⚠️ Banco de dados está vazio!')
        setProducts([])
        setLoading(false)
        isFetchingRef.current = false
        return
      }
      
      console.log('✅ Produtos carregados do BANCO:', data.length, 'produtos', { requestId: currentRequestId })
      
      // Salvar no cache local
      setCachedProducts(data)
      
      setProducts(data)
      setLoading(false)
      isFetchingRef.current = false
      
    } catch (err) {
      // Verificar se foi cancelamento (não é erro real)
      if (err instanceof Error && err.name === 'AbortError') {
        // Verificar se foi cancelado por nova requisição ou timeout
        if (abortControllerRef.current?.signal.aborted) {
          console.log('⏹️ Requisição cancelada (nova requisição ou timeout)')
          return // Não atualizar estado se foi cancelada
        }
        setError('Tempo de carregamento excedido. Verifique sua conexão.')
      } else {
        console.error('❌ Erro ao carregar produtos do banco:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar produtos do banco de dados')
      }
      
      // Só atualizar estado se ainda for a requisição mais recente
      const latestRequestId = requestIdRef.current
      if (currentRequestId === latestRequestId) {
        // Tentar usar cache local como fallback
        const cachedProducts = getCachedProducts()
        if (cachedProducts && cachedProducts.length > 0) {
          console.log('📦 Usando produtos do cache local devido a erro:', cachedProducts.length)
          setProducts(cachedProducts)
          setError('Usando dados em cache. Alguns produtos podem estar desatualizados.')
        } else {
          setProducts([])
        }
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




