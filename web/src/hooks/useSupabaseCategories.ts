'use client'

import { useState, useEffect } from 'react'
// Supabase import removed during Firebase migration

export function useSupabaseCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    console.log('⚠️ Supabase categories temporariamente desabilitado durante migração para Firebase')
    setLoading(false)
  }

  const addCategory = async (categoryData: any) => {
    console.log('⚠️ Supabase categories temporariamente desabilitado durante migração para Firebase')
    throw new Error('Categories temporarily disabled during Firebase migration')
  }

  const updateCategory = async (id: string, categoryData: any) => {
    console.log('⚠️ Supabase categories temporariamente desabilitado durante migração para Firebase')
    throw new Error('Categories temporarily disabled during Firebase migration')
  }

  const deleteCategory = async (id: string) => {
    console.log('⚠️ Supabase categories temporariamente desabilitado durante migração para Firebase')
    throw new Error('Categories temporarily disabled during Firebase migration')
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refresh: fetchCategories
  }
}
