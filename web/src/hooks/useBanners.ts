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
      const { data, error } = await supabase
        .from('banners')
        .insert([banner])
        .select()

      if (error) throw error
      if (!data || data.length === 0) {
        await fetchBanners()
        return null
      }
      const created = data[0]
      setBanners(prev => [created, ...prev])
      return created
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar banner')
      throw err
    }
  }

  const updateBanner = async (id: string, updates: Partial<Banner>) => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()

      if (error) throw error
      if (!data || data.length === 0) {
        await fetchBanners()
        return null
      }
      const updated = data[0]
      setBanners(prev => prev.map(b => (b.id === id ? updated : b)))
      return updated
    } catch (err) {
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













