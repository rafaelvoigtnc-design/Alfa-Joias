import { useState, useEffect } from 'react'
import { supabase, Product } from '@/lib/supabase'
import { initialProducts } from '@/data/initial-data'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      console.log('🔄 Buscando produtos do Supabase...')
      
      const response = await fetch('/api/products', { cache: 'no-store' })
      if (!response.ok) {
        const text = await response.text()
        console.error('❌ Erro na API de produtos:', response.status, text)
        setProducts(initialProducts as unknown as Product[])
        return
      }
      const { success, products: data, error } = await response.json()
      if (!success) {
        console.error('❌ Erro ao buscar produtos:', error)
        setProducts(initialProducts as unknown as Product[])
        return
      }
      
      if (!data || data.length === 0) {
        console.warn('⚠️ Banco de produtos vazio. Usando fallback inicial.')
        setProducts(initialProducts as unknown as Product[])
      } else {
        console.log('✅ Produtos carregados do Supabase:', data.length)
        setProducts(data)
      }
    } catch (err) {
      console.error('❌ Erro ao carregar produtos, usando fallback:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos')
      setProducts(initialProducts as unknown as Product[])
    } finally {
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









