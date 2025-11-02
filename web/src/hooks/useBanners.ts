import { useState, useEffect } from 'react'
import { supabase, Banner } from '@/lib/supabase'
import { initialBanners } from '@/data/initial-data'

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
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (!data || data.length === 0) {
        console.warn('⚠️ Nenhum banner no banco. Usando fallback inicial.')
        setBanners(initialBanners as unknown as Banner[])
      } else {
        setBanners(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar banners')
      setBanners(initialBanners as unknown as Banner[])
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
      if (data) {
        setBanners(prev => [data[0], ...prev])
      }
      return data?.[0]
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
      if (data) {
        setBanners(prev => prev.map(b => b.id === id ? data[0] : b))
      }
      return data?.[0]
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













