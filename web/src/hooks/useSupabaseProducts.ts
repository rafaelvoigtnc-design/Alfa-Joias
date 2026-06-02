import { useState, useEffect, useRef } from 'react'
import { supabase, Product } from '@/lib/supabase'

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
    try {
      console.log('💾 [useSupabaseProducts] Adicionando produto ao banco...', { name: product.name, category: product.category })
      
      // Preparar dados para inserção - remover campos que podem causar problemas
      const productToInsert: any = {
        name: product.name,
        category: product.category,
        brand: product.brand || '',
        price: product.price,
        image: product.image,
        description: product.description || '',
        featured: product.featured || false,
        on_sale: product.on_sale || false,
        stock: product.stock || 1,
        gender: product.gender || '',
        model: product.model || ''
      }
      
      // Adicionar campos opcionais apenas se existirem e não forem vazios
      if (product.original_price) productToInsert.original_price = product.original_price
      if (product.discount_percentage) productToInsert.discount_percentage = product.discount_percentage
      if (product.sale_price) productToInsert.sale_price = product.sale_price
      if ((product as any).additional_images) productToInsert.additional_images = (product as any).additional_images
      
      console.log('📦 Dados que serão inseridos:', Object.keys(productToInsert))
      
      const { data, error } = await supabase
        .from('products')
        .insert([productToInsert])
        .select()

      if (error) {
        console.error('❌ [useSupabaseProducts] Erro do Supabase:', error)
        console.error('❌ Detalhes:', { message: error.message, code: error.code, details: error.details, hint: error.hint })
        throw error
      }
      
      if (data && data[0]) {
        console.log('✅ [useSupabaseProducts] Produto adicionado com sucesso:', data[0])
        const newProduct = data[0]
        
        // Limpar cache para forçar atualização
        if (typeof window !== 'undefined') {
          localStorage.removeItem(CACHE_KEY)
        }
        
        // Atualizar estado local imediatamente
        setProducts(prev => {
          const updated = [newProduct, ...prev]
          // Atualizar cache também
          setCachedProducts(updated)
          return updated
        })
        
        // Forçar refetch após um pequeno delay para garantir sincronização
        setTimeout(() => {
          fetchProducts(true).catch(err => {
            console.warn('⚠️ Erro ao refetch após adicionar produto:', err)
          })
        }, 500)
        
        return newProduct
      } else {
        console.error('❌ [useSupabaseProducts] Nenhum dado retornado do Supabase')
        throw new Error('Nenhum dado retornado ao adicionar produto')
      }
    } catch (err: any) {
      console.error('❌ [useSupabaseProducts] Erro ao adicionar produto:', err)
      const errorMessage = err?.message || err?.details || 'Erro ao adicionar produto'
      setError(errorMessage)
      throw new Error(`Erro ao adicionar produto: ${errorMessage}`)
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      console.log('💾 [useSupabaseProducts] Atualizando produto no banco...', { id, updates: { name: updates.name, category: updates.category } })
      
      // Preparar dados para atualização - garantir que campos essenciais existam
      const updatesToApply: any = {
        updated_at: new Date().toISOString()
      }
      
      // Adicionar apenas campos que foram fornecidos e não são vazios
      if (updates.name !== undefined) updatesToApply.name = updates.name
      if (updates.category !== undefined) updatesToApply.category = updates.category
      if (updates.brand !== undefined) updatesToApply.brand = updates.brand || ''
      if (updates.price !== undefined) updatesToApply.price = updates.price
      if (updates.image !== undefined) updatesToApply.image = updates.image
      if (updates.description !== undefined) updatesToApply.description = updates.description || ''
      if (updates.featured !== undefined) updatesToApply.featured = updates.featured
      if (updates.on_sale !== undefined) updatesToApply.on_sale = updates.on_sale
      if (updates.stock !== undefined) updatesToApply.stock = updates.stock
      if (updates.gender !== undefined) updatesToApply.gender = updates.gender || ''
      if (updates.model !== undefined) updatesToApply.model = updates.model || ''
      if (updates.original_price !== undefined) updatesToApply.original_price = updates.original_price || ''
      if (updates.discount_percentage !== undefined) updatesToApply.discount_percentage = updates.discount_percentage || 0
      if (updates.sale_price !== undefined) updatesToApply.sale_price = updates.sale_price || ''
      if ((updates as any).additional_images !== undefined) updatesToApply.additional_images = (updates as any).additional_images || []
      
      console.log('📦 Campos que serão atualizados:', Object.keys(updatesToApply))
      
      const { data, error } = await supabase
        .from('products')
        .update(updatesToApply)
        .eq('id', id)
        .select()

      if (error) {
        console.error('❌ [useSupabaseProducts] Erro do Supabase:', error)
        console.error('❌ Detalhes:', { message: error.message, code: error.code, details: error.details, hint: error.hint })
        throw error
      }
      
      if (data && data[0]) {
        console.log('✅ [useSupabaseProducts] Produto atualizado com sucesso:', data[0])
        const updatedProduct = data[0]
        
        // Limpar cache para forçar atualização
        if (typeof window !== 'undefined') {
          localStorage.removeItem(CACHE_KEY)
        }
        
        // Atualizar estado local imediatamente
        setProducts(prev => {
          const updated = prev.map(p => p.id === id ? updatedProduct : p)
          // Atualizar cache também
          setCachedProducts(updated)
          return updated
        })
        
        // Forçar refetch após um pequeno delay para garantir sincronização
        setTimeout(() => {
          fetchProducts(true).catch(err => {
            console.warn('⚠️ Erro ao refetch após atualizar produto:', err)
          })
        }, 500)
        
        return updatedProduct
      } else {
        console.error('❌ [useSupabaseProducts] Nenhum dado retornado do Supabase')
        throw new Error('Nenhum dado retornado ao atualizar produto')
      }
    } catch (err: any) {
      console.error('❌ [useSupabaseProducts] Erro ao atualizar produto:', err)
      const errorMessage = err?.message || err?.details || 'Erro ao atualizar produto'
      setError(errorMessage)
      throw new Error(`Erro ao atualizar produto: ${errorMessage}`)
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




