import { useState, useEffect, useRef } from 'react'
import { supabase, Brand } from '@/lib/supabase'
import { withAutoRetry } from '@/lib/autoRetry'

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryAttempt, setRetryAttempt] = useState(0)
  const isFetchingRef = useRef(false)

  const fetchBrands = async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (isFetchingRef.current) {
      console.log('⏸️ Já está buscando marcas, ignorando chamada duplicada...')
      return
    }
    
    console.log('🔄 fetchBrands iniciado - usando SUPABASE')
    
    try {
      isFetchingRef.current = true
      setLoading(true)
      setError(null)
      setIsRetrying(false)
      setRetryAttempt(0)
      
      console.log('🔄 Buscando marcas do Supabase...')

      // Usar retry automático
      const result = await withAutoRetry(
        async () => {
          const result = await supabase
            .from('brands')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100)
          
          if (result.error) {
            throw result.error
          }
          
          return result
        },
        {
          maxRetries: 2, // Reduzido para 2 tentativas (mais rápido)
          initialDelay: 500, // Começar com 500ms (mais rápido)
          maxDelay: 2000, // Máximo de 2 segundos (mais rápido)
          onRetry: (attempt, err) => {
            setIsRetrying(true)
            setRetryAttempt(attempt)
            console.log(`🔄 Tentando carregar marcas novamente (tentativa ${attempt}/2)...`)
          }
        }
      )

      setIsRetrying(false)
      setRetryAttempt(0)

      // Como lançamos erro se result.error existir, aqui result.error sempre será null
      const { data, error } = result as { data: Brand[] | null; error: any }

      if (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : (error as any)?.message || 'Erro desconhecido'
        console.error('❌ Erro do Supabase:', errorMessage)
        setError(`Erro ao conectar com o banco de dados: ${errorMessage}`)
        setBrands([])
        setLoading(false)
        isFetchingRef.current = false
        return
      }

      console.log('✅ Marcas carregadas do Supabase:', data?.length || 0)
      if (data && data.length > 0) {
        data.forEach(brand => console.log(`   - ${brand.name} (${brand.id})`))
      }

      setBrands(data || [])
      setError(null)

    } catch (err) {
      setIsRetrying(false)
      setRetryAttempt(0)
      console.error('❌ Erro ao carregar marcas:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar marcas do banco de dados')
      setBrands([])
    } finally {
      setLoading(false)
      isFetchingRef.current = false
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
    isRetrying,
    retryAttempt,
    addBrand,
    updateBrand,
    deleteBrand,
    refetch: fetchBrands
  }
}









