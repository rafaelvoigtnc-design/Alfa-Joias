import { useState, useEffect } from 'react'

// Placeholder Banner type during Firebase migration
interface Banner {
  id: string
  title: string
  subtitle: string
  image: string
  cta_link: string
  cta_text: string
  active: boolean
  created_at?: string
  updated_at?: string
}

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBanners = async () => {
    console.log('⚠️ Supabase banners temporariamente desabilitado durante migração para Firebase')
    setLoading(false)
  }

  const addBanner = async (banner: Omit<Banner, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('⚠️ Supabase banners temporariamente desabilitado durante migração para Firebase')
    throw new Error('Banners temporarily disabled during Firebase migration')
  }

  const updateBanner = async (id: string, updates: Partial<Banner>) => {
    console.log('⚠️ Supabase banners temporariamente desabilitado durante migração para Firebase')
    throw new Error('Banners temporarily disabled during Firebase migration')
  }

  const deleteBanner = async (id: string) => {
    console.log('⚠️ Supabase banners temporariamente desabilitado durante migração para Firebase')
    throw new Error('Banners temporarily disabled during Firebase migration')
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













