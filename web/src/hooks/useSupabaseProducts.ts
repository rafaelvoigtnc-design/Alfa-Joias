import { useState, useEffect, useRef } from 'react'
// Supabase import removed during Firebase migration
// import { supabase, Product } from '@/lib/supabase'

// Placeholder Product type
interface Product {
  id: string
  name: string
  [key: string]: any
}

// Cache local para fallback - aumentado para carregamento instantâneo
const CACHE_KEY = 'alfajoias-products-cache'
const CACHE_EXPIRY = 30 * 60 * 1000 // 30 minutos (carregamento instantâneo)

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

// Função de retry simples igual ao de serviços
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 2,
  delayMs: number = 500
): Promise<Response> {
  let lastError: any
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)
      
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

  const fetchProducts = async (force: boolean = false) => {
    // Prevenir múltiplas chamadas simultâneas
    if (isFetchingRef.current && !force) {
      console.log('⏸️ Já está buscando produtos, ignorando chamada duplicada...')
      return
    }
    
    // Se forçado, limpar cache
    if (force) {
      console.log('🔄 Refetch forçado - limpando cache...')
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CACHE_KEY)
      }
      isFetchingRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
    
    const currentRequestId = ++requestIdRef.current
    
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      const controller = new AbortController()
      abortControllerRef.current = controller
      
      isFetchingRef.current = true
      setError(null)
      console.log('🔄 Buscando produtos via API...', { requestId: currentRequestId })
      
      // Carregar cache local primeiro para carregamento instantâneo
      const cachedProducts = getCachedProducts()
      if (cachedProducts && cachedProducts.length > 0) {
        console.log('⚡ Carregamento instantâneo do cache local:', cachedProducts.length, 'produtos')
        setProducts(cachedProducts)
        setLoading(false) // Mostrar dados do cache imediatamente
      } else {
        setLoading(true) // Só setar loading true se não tiver cache
      }
      
      // Usar cache do navegador com tempo maior para carregamento instantâneo
      const response = await fetchWithRetry(
        `/api/products`,
        {
          cache: 'default',
          method: 'GET',
          headers: {
            'Cache-Control': 'max-age=300' // 5 minutos de cache do navegador
          },
          signal: controller.signal
        },
        2, // 2 tentativas
        500 // delay inicial 500ms
      )
      
      if (controller.signal.aborted) {
        console.log('⏹️ Requisição cancelada (nova requisição iniciada)')
        return
      }
      
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
        
        if (errorData.connectionError || response.status === 503) {
          console.warn('⚠️ Erro de conexão detectado. Produtos não podem ser carregados.')
        }
        
        setProducts([])
        setLoading(false)
        isFetchingRef.current = false
        return
      }
      
      const data = await response.json()
      
      if (currentRequestId !== requestIdRef.current) {
        console.log('⏹️ Resposta de requisição antiga ignorada')
        return
      }
      
      if (!data.success) {
        console.error('❌ Erro na resposta da API:', data.error)
        
        if (data.connectionError) {
          console.warn('⚠️ Erro de conexão detectado. Produtos não podem ser carregados.')
        }
        
        setProducts([])
        setLoading(false)
        isFetchingRef.current = false
        return
      }
      
      if (!data.products || data.products.length === 0) {
        console.warn('⚠️ Nenhum produto encontrado!')
        setProducts([])
        setLoading(false)
        isFetchingRef.current = false
        return
      }
      
      console.log('✅ Produtos carregados via API:', data.products.length, { requestId: currentRequestId })
      
      setCachedProducts(data.products)
      
      setProducts(data.products)
      setLoading(false)
      isFetchingRef.current = false
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('⏹️ Requisição cancelada (nova requisição ou timeout)')
        return
      }
      
      console.error('❌ Erro ao carregar produtos:', error)
      
      const latestRequestId = requestIdRef.current
      if (currentRequestId === latestRequestId) {
        const cachedProducts = getCachedProducts()
        if (cachedProducts && cachedProducts.length > 0) {
          console.log('📦 Usando produtos do cache local devido a erro:', cachedProducts.length)
          setProducts(cachedProducts)
        } else {
          setProducts([])
        }
        setLoading(false)
      }
      isFetchingRef.current = false
    }
  }
  
  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('⚠️ Supabase products temporariamente desabilitado durante migração para Firebase')
    throw new Error('Supabase está sendo migrado para Firebase. Função temporariamente desabilitada.')
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    console.log('⚠️ Supabase products temporariamente desabilitado durante migração para Firebase')
    throw new Error('Supabase está sendo migrado para Firebase. Função temporariamente desabilitada.')
  }

  const deleteProduct = async (id: string) => {
    console.log('⚠️ Supabase products temporariamente desabilitado durante migração para Firebase')
    throw new Error('Supabase está sendo migrado para Firebase. Função temporariamente desabilitada.')
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

  const refetch = async () => {
    // Forçar refetch ignorando proteções
    return fetchProducts(true)
  }

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
    refetch
  }
}
