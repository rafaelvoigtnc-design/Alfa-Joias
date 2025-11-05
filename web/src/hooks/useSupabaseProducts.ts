import { useState, useEffect } from 'react'
import { supabase, Product } from '@/lib/supabase'
import { initialProducts } from '@/data/initial-data'

export function useSupabaseProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Buscando produtos do banco de dados...')
      
      // Timeout de 5 segundos para evitar carregamento infinito
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      // Usar cache para melhor performance (5 minutos)
      const response = await fetch('/api/products', { 
        cache: 'default',
        next: { revalidate: 300 }, // Revalidar a cada 5 minutos
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
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
        setProducts(initialProducts as unknown as Product[])
        setLoading(false)
        return
      }
      const { success, products: data, error, connectionError } = await response.json()
      if (!success) {
        console.error('❌ Erro ao buscar do banco:', error)
        const errorMsg = connectionError 
          ? 'Erro de conexão. Verifique sua internet e tente novamente.'
          : `Erro ao conectar com o banco de dados: ${error}`
        setError(errorMsg)
        setProducts(initialProducts as unknown as Product[])
        setLoading(false)
        return
      }
      
      if (!data || data.length === 0) {
        console.warn('⚠️ Banco de dados está vazio! Usando dados iniciais como fallback.')
        setProducts(initialProducts as unknown as Product[])
        setLoading(false)
        return
      }
      
      console.log('✅ Produtos carregados do BANCO:', data.length, 'produtos')
      setProducts(data)
      setLoading(false)
      
    } catch (err) {
      console.error('❌ Erro ao carregar produtos do banco, usando fallback:', err)
      
      // Verificar se foi timeout
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Tempo de carregamento excedido. Verifique sua conexão.')
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao carregar produtos do banco de dados')
      }
      
      // Usar fallback mesmo em caso de erro
      setProducts(initialProducts as unknown as Product[])
      setLoading(false)
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




