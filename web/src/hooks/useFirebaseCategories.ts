'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Category {
  id: string
  name: string
  description: string
  image: string
  icon: string
  createdAt: any
  updatedAt: any
}

export function useFirebaseCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const categoriesRef = collection(db, 'categories')
        const snapshot = await getDocs(categoriesRef)
        
        const categoriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[]
        
        setCategories(categoriesData)
        setError(null)
      } catch (err) {
        console.error('Erro ao carregar categorias:', err)
        setError('Erro ao carregar categorias')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const getCategoryById = async (id: string): Promise<Category | null> => {
    try {
      const categoryRef = doc(db, 'categories', id)
      const snapshot = await getDoc(categoryRef)
      
      if (snapshot.exists()) {
        return {
          id: snapshot.id,
          ...snapshot.data()
        } as Category
      }
      return null
    } catch (error) {
      console.error('Erro ao buscar categoria:', error)
      return null
    }
  }

  const createCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
    try {
      const categoriesRef = collection(db, 'categories')
      const newCategory = {
        ...categoryData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const docRef = await addDoc(categoriesRef, newCategory)
      return {
        id: docRef.id,
        ...newCategory
      } as Category
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      throw error
    }
  }

  const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<void> => {
    try {
      const categoryRef = doc(db, 'categories', id)
      await updateDoc(categoryRef, {
        ...categoryData,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
      throw error
    }
  }

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      const categoryRef = doc(db, 'categories', id)
      await deleteDoc(categoryRef)
    } catch (error) {
      console.error('Erro ao deletar categoria:', error)
      throw error
    }
  }

  const refetch = async () => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const categoriesRef = collection(db, 'categories')
        const snapshot = await getDocs(categoriesRef)
        
        const categoriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[]
        
        setCategories(categoriesData)
        setError(null)
      } catch (err) {
        console.error('Erro ao carregar categorias:', err)
        setError('Erro ao carregar categorias')
      } finally {
        setLoading(false)
      }
    }
    await fetchCategories()
  }

  return {
    categories,
    loading,
    error,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch
  }
}