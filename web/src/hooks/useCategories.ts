import { useState, useEffect } from 'react'
import { supabase, Category } from '@/lib/supabase'
import { withRetry } from '@/lib/errorHandler'

// Cache local para fallback
const CACHE_KEY = 'alfajoias-categories-cache'
const CACHE_EXPIRY = 5 * 60 * 1000 // 5 minutos

interface CacheData {
  categories: Category[]
  timestamp: number
}

function getCachedCategories(): Category[] | null {
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
    
    return data.categories
  } catch {
    return null
  }
}

function setCachedCategories(categories: Category[]) {
  if (typeof window === 'undefined') return
  
  try {
    const data: CacheData = {
      categories,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // Ignorar erros de localStorage
  }
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      console.log('🔄 Buscando categorias do Supabase...')

      // Carregar cache local primeiro para melhor UX
      const cachedCategories = getCachedCategories()
      if (cachedCategories && cachedCategories.length > 0) {
        console.log('📦 Usando categorias do cache local enquanto busca atualização...', cachedCategories.length)
        setCategories(cachedCategories)
        setLoading(false) // Mostrar dados do cache imediatamente
      }

      // Usar retry automático com backoff exponencial
      const data = await withRetry(
        async () => {
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true })

          if (error) throw error
          return data || []
        },
        3, // 3 tentativas
        1000 // delay inicial de 1 segundo
      )
      
      console.log('✅ Categorias carregadas do Supabase:', data?.length || 0)
      
      // Salvar no cache local
      if (data && data.length > 0) {
        setCachedCategories(data)
      }
      
      setCategories(data || [])
      setError(null)
    } catch (err) {
      console.error('❌ Erro ao carregar categorias:', err)
      
      // Tentar usar cache local como fallback
      const cachedCategories = getCachedCategories()
      if (cachedCategories && cachedCategories.length > 0) {
        console.log('📦 Usando categorias do cache local devido a erro:', cachedCategories.length)
        setCategories(cachedCategories)
        setError('Usando dados em cache. Algumas categorias podem estar desatualizadas.')
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao carregar categorias')
        setCategories([])
      }
    } finally {
      setLoading(false)
    }
  }

  const updateCategoryImage = async (id: string, image: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ image, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()

      if (error) throw error
      if (data) {
        setCategories(prev => prev.map(c => c.id === id ? data[0] : c))
      }
      return data?.[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar categoria')
      throw err
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    updateCategoryImage,
    refetch: fetchCategories
  }
}




