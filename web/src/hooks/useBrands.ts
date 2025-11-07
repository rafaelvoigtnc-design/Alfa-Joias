import { useState, useEffect } from 'react'
import { supabase, Brand } from '@/lib/supabase'

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBrands = async () => {
    console.log('🔄 fetchBrands iniciado - usando SUPABASE')
    
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Buscando marcas do Supabase...')

      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('❌ Erro do Supabase:', error.message)
        setError(`Erro ao conectar com o banco de dados: ${error.message}`)
        setBrands([])
        setLoading(false)
        return
      }

      console.log('✅ Marcas carregadas do Supabase:', data?.length || 0)
      if (data && data.length > 0) {
        data.forEach(brand => console.log(`   - ${brand.name} (${brand.id})`))
      }

      setBrands(data || [])
      setError(null)

    } catch (err) {
      console.error('❌ Erro ao carregar marcas:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar marcas do banco de dados')
      setBrands([])
    } finally {
      setLoading(false)
      console.log('✅ fetchBrands concluído')
    }
  }

  const addBrand = async (brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('🔄 addBrand chamado com:', brand)
    
    try {
      const brandData = {
        name: brand.name || 'Marca sem nome',
        image: brand.image || 'https://via.placeholder.com/200x100?text=Logo'
      }
      
      console.log('🔄 Inserindo no Supabase:', brandData)
      
      const { data, error } = await supabase
        .from('brands')
        .insert([brandData])
        .select()

      if (error) {
        console.error('❌ Erro do Supabase:', error)
        throw error
      }

      const created = data && data.length > 0 ? data[0] : null
      await fetchBrands()
      console.log('✅ Marca adicionada com sucesso!')
      return created
      
    } catch (error) {
      console.error('❌ ERRO CRÍTICO:', error)
      setError(`Erro ao adicionar marca: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      throw error
    }
  }

  const updateBrand = async (id: string, updates: Partial<Brand>) => {
    try {
      const { active, ...updateData } = updates as any
      
      const { data, error } = await supabase
        .from('brands')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()

      if (error) throw error

      const updated = data && data.length > 0 ? data[0] : null
      await fetchBrands()
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar marca')
      throw err
    }
  }

  const deleteBrand = async (id: string) => {
    console.log('🔄 deleteBrand chamado para ID:', id)
    
    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Erro do Supabase:', error)
        if (error.message && error.message.toLowerCase().includes('foreign key')) {
          throw new Error('Não é possível excluir esta marca porque existem produtos vinculados a ela. Atualize ou remova esses produtos antes de excluir a marca.')
        }
        throw error
      }
      
      await fetchBrands()
      console.log('✅ Marca deletada do Supabase')
      
    } catch (err) {
      console.error('❌ Erro ao deletar marca:', err)
      const friendlyMessage = err instanceof Error ? err.message : 'Erro ao deletar marca'
      setError(friendlyMessage)
      throw new Error(friendlyMessage)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  return {
    brands,
    loading,
    error,
    addBrand,
    updateBrand,
    deleteBrand,
    refetch: fetchBrands
  }
}









