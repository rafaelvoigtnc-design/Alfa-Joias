import { useState, useEffect, useRef } from 'react'
// Supabase import removed during Firebase migration

// Placeholder Brand type
interface Brand {
  id: string
  name: string
  [key: string]: any
}

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isFetchingRef = useRef(false)

  const fetchBrands = async (forceRetry: boolean = false) => {
    console.log('⚠️ Supabase brands temporariamente desabilitado durante migração para Firebase')
    setLoading(false)
  }

  const addBrand = async (brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('⚠️ Supabase brands temporariamente desabilitado durante migração para Firebase')
    throw new Error('Brands temporarily disabled during Firebase migration')
  }

  const updateBrand = async (id: string, updates: Partial<Brand>) => {
    console.log('⚠️ Supabase brands temporariamente desabilitado durante migração para Firebase')
    throw new Error('Brands temporarily disabled during Firebase migration')
  }

  const deleteBrand = async (id: string) => {
    console.log('⚠️ Supabase brands temporariamente desabilitado durante migração para Firebase')
    throw new Error('Brands temporarily disabled during Firebase migration')
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
