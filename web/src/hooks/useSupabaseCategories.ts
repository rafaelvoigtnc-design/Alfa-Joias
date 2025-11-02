'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useSupabaseCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (error) {
        console.error('Erro ao buscar categorias:', error)
        setError(error.message)
      } else {
        setCategories(data || [])
        console.log('✅ Categorias carregadas do Supabase:', data?.length || 0)
      }
    } catch (err) {
      console.error('Erro ao buscar categorias:', err)
      setError('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (categoryData: any) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single()
      
      if (error) {
        console.error('Erro ao adicionar categoria:', error)
        throw error
      }
      
      await fetchCategories() // Recarregar lista
      return data
    } catch (err) {
      console.error('Erro ao adicionar categoria:', err)
      throw err
    }
  }

  const updateCategory = async (id: string, categoryData: any) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Erro ao atualizar categoria:', error)
        throw error
      }
      
      await fetchCategories() // Recarregar lista
      return data
    } catch (err) {
      console.error('Erro ao atualizar categoria:', err)
      throw err
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Erro ao deletar categoria:', error)
        throw error
      }
      
      await fetchCategories() // Recarregar lista
    } catch (err) {
      console.error('Erro ao deletar categoria:', err)
      throw err
    }
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
    refetch: fetchCategories
  }
}