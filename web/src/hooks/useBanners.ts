import { useState, useEffect } from 'react'
import { supabase, Banner } from '@/lib/supabase'

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!data || data.length === 0) {
        console.warn('⚠️ Nenhum banner cadastrado no banco.')
        setBanners([])
      } else {
        setBanners(data)
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar banners')
      setBanners([])
    } finally {
      setLoading(false)
    }
  }

  const addBanner = async (banner: Omit<Banner, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('💾 [useBanners] Adicionando banner:', banner)
      
      const { data, error } = await supabase
        .from('banners')
        .insert([banner])
        .select()

      if (error) {
        console.error('❌ [useBanners] Erro do Supabase:', error)
        throw error
      }
      
      if (!data || data.length === 0) {
        console.warn('⚠️ [useBanners] Nenhum dado retornado, recarregando...')
        await fetchBanners()
        return null
      }
      
      const created = data[0]
      console.log('✅ [useBanners] Banner criado:', created)
      setBanners(prev => [created, ...prev])
      return created
    } catch (err: any) {
      console.error('❌ [useBanners] Erro ao adicionar:', err)
      setError(err instanceof Error ? err.message : 'Erro ao adicionar banner')
      throw err
    }
  }

  const updateBanner = async (id: string, updates: Partial<Banner>) => {
    try {
      console.log('💾 [useBanners] Atualizando banner:', { id, updates })
      
      const { data, error } = await supabase
        .from('banners')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()

      if (error) {
        console.error('❌ [useBanners] Erro do Supabase:', error)
        throw error
      }
      
      if (!data || data.length === 0) {
        console.warn('⚠️ [useBanners] Nenhum dado retornado, recarregando...')
        await fetchBanners()
        return null
      }
      
      const updated = data[0]
      console.log('✅ [useBanners] Banner atualizado:', updated)
      setBanners(prev => prev.map(b => (b.id === id ? updated : b)))
      return updated
    } catch (err: any) {
      console.error('❌ [useBanners] Erro ao atualizar:', err)
      setError(err instanceof Error ? err.message : 'Erro ao atualizar banner')
      throw err
    }
  }

  const deleteBanner = async (id: string) => {
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id)

      if (error) throw error
      setBanners(prev => prev.filter(b => b.id !== id))
      if (banners.length <= 1) {
        await fetchBanners()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar banner')
      throw err
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  return {
    banners,
    loading,
    error,
    addBanner,
    updateBanner,
    deleteBanner,
    refetch: fetchBanners
  }
}













