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

  const fetchBrands = async (forceRetry: boolean = false) => {
    // Prevenir múltiplas chamadas simultâneas (a menos que seja retry forçado)
    if (isFetchingRef.current && !forceRetry) {
      console.log('⏸️ Já está buscando marcas, ignorando chamada duplicada...')
      return
    }
    
      console.log('🔄 fetchBrands iniciado - usando SUPABASE', forceRetry ? '(retry forçado)' : '')
    
    const startTime = Date.now()
    if (typeof window !== 'undefined') {
      (window as any).__brandsFetchStartTime = startTime
    }
    let timeoutId: NodeJS.Timeout | null = null
    
    try {
      isFetchingRef.current = true
      setLoading(true)
      setError(null)
      setIsRetrying(false)
      setRetryAttempt(0)
      
      console.log('🔄 Buscando marcas do Supabase...')

      // Timeout de 8 segundos - se demorar mais, forçar retry
      timeoutId = setTimeout(() => {
        const elapsed = Date.now() - startTime
        if (elapsed >= 8000 && isFetchingRef.current) {
          console.warn(`⏰ Timeout de 8s atingido! Forçando retry automático...`)
          setIsRetrying(true)
          setRetryAttempt(1)
          // Forçar retry após 1 segundo
          setTimeout(() => {
            if (isFetchingRef.current) {
              console.log('🔄 Executando retry automático após timeout...')
              fetchBrands(true)
            }
          }, 1000)
        }
      }, 8000)

      // Usar retry automático com timeout mais agressivo
      const result = await Promise.race([
        withAutoRetry(
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
            maxRetries: 3, // Aumentado para 3 tentativas
            initialDelay: 1000, // Começar com 1 segundo
            maxDelay: 3000, // Máximo de 3 segundos
            onRetry: (attempt, err) => {
              setIsRetrying(true)
              setRetryAttempt(attempt)
              console.log(`🔄 Tentando carregar marcas novamente (tentativa ${attempt}/3)...`)
            }
          }
        ),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout após 8 segundos')), 8000)
        })
      ]) as Awaited<ReturnType<typeof withAutoRetry>>

      if (timeoutId) clearTimeout(timeoutId)

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
      
      // Remover duplicatas baseadas no ID E no nome antes de definir no estado
      let uniqueBrands: Brand[] = []
      if (data && data.length > 0) {
        // Criar Maps para garantir unicidade por ID e por nome
        const brandsByIdMap = new Map<string, Brand>()
        const brandsByNameMap = new Map<string, Brand>()
        
        data.forEach(brand => {
          // Primeiro verificar por ID
          if (!brandsByIdMap.has(brand.id)) {
            // Depois verificar por nome (case-insensitive)
            const nameKey = brand.name.toLowerCase().trim()
            if (!brandsByNameMap.has(nameKey)) {
              brandsByIdMap.set(brand.id, brand)
              brandsByNameMap.set(nameKey, brand)
            } else {
              // Se já existe uma marca com o mesmo nome, manter a mais recente (created_at mais recente)
              const existingBrand = brandsByNameMap.get(nameKey)!
              const existingDate = new Date(existingBrand.created_at || 0).getTime()
              const newDate = new Date(brand.created_at || 0).getTime()
              
              if (newDate > existingDate) {
                // Remover a antiga e adicionar a nova
                brandsByIdMap.delete(existingBrand.id)
                brandsByIdMap.set(brand.id, brand)
                brandsByNameMap.set(nameKey, brand)
                console.warn(`⚠️ Marca duplicada por nome removida (mantida a mais recente): ${brand.name} (ID antigo: ${existingBrand.id}, ID novo: ${brand.id})`)
              } else {
                console.warn(`⚠️ Marca duplicada por nome ignorada (mantida a mais recente): ${brand.name} (ID: ${brand.id})`)
              }
            }
          } else {
            console.warn(`⚠️ Marca duplicada por ID encontrada no banco: ${brand.name} (ID: ${brand.id})`)
          }
        })
        
        uniqueBrands = Array.from(brandsByIdMap.values())
        
        if (uniqueBrands.length !== data.length) {
          console.warn(`⚠️ ${data.length - uniqueBrands.length} marca(s) duplicada(s) removida(s) (total: ${data.length} -> ${uniqueBrands.length})`)
        }
        
        uniqueBrands.forEach(brand => console.log(`   - ${brand.name} (${brand.id})`))
      }

      setBrands(uniqueBrands)
      setError(null)

    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId)
      setIsRetrying(false)
      setRetryAttempt(0)
      console.error('❌ Erro ao carregar marcas:', err)
      
      const elapsed = Date.now() - startTime
      const isTimeout = err instanceof Error && err.message.includes('Timeout')
      
      // Se foi timeout ou demorou mais de 8s, tentar retry automático
      if ((isTimeout || elapsed >= 8000) && !forceRetry) {
        console.log('⏰ Timeout detectado, tentando retry automático em 2 segundos...')
        setTimeout(() => {
          if (isFetchingRef.current) {
            fetchBrands(true)
          }
        }, 2000)
        return // Não definir erro ainda, aguardar retry
      }
      
      setError(err instanceof Error ? err.message : 'Erro ao carregar marcas do banco de dados')
      setBrands([])
    } finally {
      setLoading(false)
      isFetchingRef.current = false
      const elapsed = Date.now() - startTime
      console.log(`✅ fetchBrands concluído (tempo: ${elapsed}ms)`)
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
  
  // Monitorar loading separadamente - se demorar mais de 8s, forçar retry
  useEffect(() => {
    if (!loading) return
    
    const startTime = Date.now()
    if (typeof window !== 'undefined') {
      (window as any).__brandsFetchStartTime = startTime
    }
    
    const loadingMonitor = setInterval(() => {
      if (loading && isFetchingRef.current) {
        const elapsed = Date.now() - ((window as any).__brandsFetchStartTime || startTime)
        if (elapsed >= 8000) {
          console.warn('⏰ Loading demorou mais de 8s, forçando retry automático...')
          isFetchingRef.current = false // Permitir novo fetch
          fetchBrands(true)
          clearInterval(loadingMonitor)
        }
      } else {
        clearInterval(loadingMonitor)
      }
    }, 1000)
    
    return () => clearInterval(loadingMonitor)
  }, [loading])

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









