'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Brand {
  id: string
  name: string
  image: string
  active?: boolean
  createdAt: any
  updatedAt: any
}

export function useFirebaseBrands() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true)
        const brandsRef = collection(db, 'brands')
        const q = query(brandsRef, where('active', '==', true))
        const snapshot = await getDocs(q)
        
        const brandsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Brand[]
        
        setBrands(brandsData)
        setError(null)
      } catch (err) {
        console.error('Erro ao carregar marcas:', err)
        setError('Erro ao carregar marcas')
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  const getBrandById = async (id: string): Promise<Brand | null> => {
    try {
      const brandRef = doc(db, 'brands', id)
      const snapshot = await getDoc(brandRef)
      
      if (snapshot.exists()) {
        return {
          id: snapshot.id,
          ...snapshot.data()
        } as Brand
      }
      return null
    } catch (error) {
      console.error('Erro ao buscar marca:', error)
      return null
    }
  }

  const createBrand = async (brandData: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>): Promise<Brand> => {
    try {
      const brandsRef = collection(db, 'brands')
      const newBrand = {
        ...brandData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const docRef = await addDoc(brandsRef, newBrand)
      return {
        id: docRef.id,
        ...newBrand
      } as Brand
    } catch (error) {
      console.error('Erro ao criar marca:', error)
      throw error
    }
  }

  const updateBrand = async (id: string, brandData: Partial<Brand>): Promise<void> => {
    try {
      const brandRef = doc(db, 'brands', id)
      await updateDoc(brandRef, {
        ...brandData,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Erro ao atualizar marca:', error)
      throw error
    }
  }

  const deleteBrand = async (id: string): Promise<void> => {
    try {
      const brandRef = doc(db, 'brands', id)
      await deleteDoc(brandRef)
    } catch (error) {
      console.error('Erro ao deletar marca:', error)
      throw error
    }
  }

  const refetch = async () => {
    const fetchBrands = async () => {
      try {
        setLoading(true)
        const brandsRef = collection(db, 'brands')
        const q = query(brandsRef, where('active', '==', true))
        const snapshot = await getDocs(q)
        
        const brandsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Brand[]
        
        setBrands(brandsData)
        setError(null)
      } catch (err) {
        console.error('Erro ao carregar marcas:', err)
        setError('Erro ao carregar marcas')
      } finally {
        setLoading(false)
      }
    }
    await fetchBrands()
  }

  return {
    brands,
    loading,
    error,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
    refetch
  }
}
