import { useState, useEffect } from 'react'
import { supabase, Brand } from '@/lib/supabase'
import { initialBrands } from '@/data/initial-data'

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
      
      // Timeout de 5 segundos para evitar carregamento infinito
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao carregar marcas')), 5000)
      )
      
      const queryPromise = supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50) // Limitar para melhor performance

      const result = await Promise.race([queryPromise, timeoutPromise]) as Awaited<typeof queryPromise>
      const { data, error } = result

      if (error) {
        console.error('❌ Erro do Supabase:', error.message)
        setError(`Erro ao conectar com o banco de dados: ${error.message}`)
        setBrands(initialBrands as unknown as Brand[])
        setLoading(false)
        return
      }
      
      console.log('✅ Marcas carregadas do Supabase:', data?.length || 0)
      if (data && data.length > 0) {
        data.forEach(brand => console.log(`   - ${brand.name} (${brand.id})`))
      }
      
      if (!data || data.length === 0) {
        console.warn('⚠️ Nenhuma marca no banco. Usando fallback inicial.')
        setBrands(initialBrands as unknown as Brand[])
      } else {
        setBrands(data)
      }
      
    } catch (err) {
      console.error('❌ Erro ao carregar marcas:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar marcas do banco de dados')
      // Sempre usar fallback em caso de erro
      setBrands(initialBrands as unknown as Brand[])
    } finally {
      setLoading(false)
      console.log('✅ fetchBrands concluído')
    }
  }

  const addBrand = async (brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('🔄 addBrand chamado com:', brand)
    
    try {
      // Preparar dados para o Supabase (sem a coluna 'active' que não existe)
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

      console.log('✅ Marca inserida no Supabase:', data)
      
      // Atualizar estado local
      const newBrand = data[0]
      setBrands(prev => [...prev, newBrand])
      
      console.log('✅ Marca adicionada com sucesso!')
      return newBrand
      
    } catch (error) {
      console.error('❌ ERRO CRÍTICO:', error)
      setError(`Erro ao adicionar marca: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      throw error
    }
  }

  const updateBrand = async (id: string, updates: Partial<Brand>) => {
    try {
      // Remover 'active' se existir (coluna não existe no banco)
      const { active, ...updateData } = updates as any
      
      const { data, error } = await supabase
        .from('brands')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()

      if (error) throw error
      if (data) {
        setBrands(prev => prev.map(b => b.id === id ? data[0] : b))
      }
      return data?.[0]
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
        throw error
      }
      
      setBrands(prev => prev.filter(b => b.id !== id))
      console.log('✅ Marca deletada do Supabase')
      
    } catch (err) {
      console.error('❌ Erro ao deletar marca:', err)
      setError(err instanceof Error ? err.message : 'Erro ao deletar marca')
      throw err
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









