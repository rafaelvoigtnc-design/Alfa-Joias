import { useState, useEffect, useRef } from 'react'
import { supabase, Product } from '@/lib/supabase'

// Cache local para fallback - aumentado para melhor performance
const CACHE_KEY = 'alfajoias-products-cache'
const CACHE_EXPIRY = 15 * 60 * 1000 // 15 minutos (cache mais longo para melhor performance)

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

// Importar sistema de retry melhorado
import { fetchWithAutoRetry } from '@/lib/autoRetry'

export function useSupabaseProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Refs para prevenir race conditions
  const isFetchingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)

  const fetchProducts = async (force: boolean = false) => {
    // Prevenir múltiplas chamadas simultâneas (a menos que seja forçado)
    if (isFetchingRef.current && !force) {
      console.log('⏸️ Já está buscando produtos, ignorando chamada duplicada...')
      return
    }
    
    // Se forçado, limpar cache e resetar flags
    if (force) {
      console.log('🔄 Refetch forçado - limpando cache e resetando estado...')
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CACHE_KEY)
      }
      isFetchingRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
    
    // Incrementar ID da requisição para rastrear a mais recente (fora do try para estar acessível no catch)
    const currentRequestId = ++requestIdRef.current
    
    const startTime = Date.now()
    if (typeof window !== 'undefined') {
      (window as any).__productsFetchStartTime = startTime
    }
    let timeoutId: NodeJS.Timeout | null = null
    
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
      
      // Timeout de 8 segundos - se demorar mais, forçar retry
      timeoutId = setTimeout(() => {
        const elapsed = Date.now() - startTime
        if (elapsed >= 8000 && isFetchingRef.current && currentRequestId === requestIdRef.current) {
          console.warn(`⏰ Timeout de 8s atingido para produtos! Forçando retry automático...`)
          // Forçar retry após 1 segundo
          setTimeout(() => {
            if (isFetchingRef.current && currentRequestId === requestIdRef.current) {
              console.log('🔄 Executando retry automático de produtos após timeout...')
              fetchProducts(true)
            }
          }, 1000)
        }
      }, 8000)
      
      // Carregar cache local primeiro para melhor UX
      const cachedProducts = getCachedProducts()
      if (cachedProducts && cachedProducts.length > 0) {
        console.log('📦 Usando produtos do cache local enquanto busca atualização...', cachedProducts.length)
        setProducts(cachedProducts)
        setLoading(false) // Mostrar dados do cache imediatamente
      }
      
      // Usar sistema de retry automático melhorado
      const response = await fetchWithAutoRetry(
        `/api/products`,
        { 
          cache: 'default', // Usar cache do navegador
          headers: {
            'Cache-Control': 'max-age=30' // Aceitar cache de até 30 segundos
          },
          signal: controller.signal
        },
        {
          maxRetries: 2, // Reduzido para 2 tentativas (mais rápido)
          initialDelay: 500, // Começar com 500ms (mais rápido)
          maxDelay: 2000, // Máximo de 2 segundos entre tentativas (mais rápido)
          onRetry: (attempt, error) => {
            console.log(`🔄 Tentando carregar produtos novamente (tentativa ${attempt}/2)...`)
          }
        }
      )
      
      if (timeoutId) clearTimeout(timeoutId)
      
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
        const elapsed = Date.now() - startTime
        const isTimeout = err instanceof Error && (err.message.includes('Timeout') || err.message.includes('aborted'))
        
        // Se foi timeout ou demorou mais de 8s, tentar retry automático
        if ((isTimeout || elapsed >= 8000) && !force) {
          console.log('⏰ Timeout detectado em produtos, tentando retry automático em 2 segundos...')
          setTimeout(() => {
            if (isFetchingRef.current && currentRequestId === requestIdRef.current) {
              fetchProducts(true)
            }
          }, 2000)
          return // Não definir erro ainda, aguardar retry
        }
        
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
  
  // Monitorar loading - se demorar mais de 8s, forçar retry
  useEffect(() => {
    if (!loading) return
    
    const startTime = Date.now()
    if (typeof window !== 'undefined') {
      (window as any).__productsFetchStartTime = startTime
    }
    
    const loadingMonitor = setInterval(() => {
      if (loading && isFetchingRef.current) {
        const elapsed = Date.now() - ((window as any).__productsFetchStartTime || startTime)
        if (elapsed >= 8000) {
          console.warn('⏰ Loading de produtos demorou mais de 8s, forçando retry automático...')
          isFetchingRef.current = false // Permitir novo fetch
          fetchProducts(true)
          clearInterval(loadingMonitor)
        }
      } else {
        clearInterval(loadingMonitor)
      }
    }, 1000)
    
    return () => clearInterval(loadingMonitor)
  }, [loading])

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




