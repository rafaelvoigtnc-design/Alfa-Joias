import { useState, useEffect } from 'react'
import { supabase, Category } from '@/lib/supabase'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      console.log('🔄 Buscando categorias do Supabase...')

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      
      console.log('✅ Categorias carregadas do Supabase:', data?.length || 0)
      // SEMPRE usar dados do banco - se vazio, retornar array vazio (não usar fallback)
      setCategories(data || [])
    } catch (err) {
      console.error('❌ Erro ao carregar categorias:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias')
      // Em caso de erro, retornar array vazio (não usar fallback)
      setCategories([])
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




