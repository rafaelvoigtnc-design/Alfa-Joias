'use client'

import { useState, useEffect } from 'react'
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Product {
  id: string
  name: string
  category: string
  brand: string
  price: number
  image: string
  description: string
  additional_images?: string[]
  featured?: boolean
  on_sale?: boolean
  original_price?: number
  discount_percentage?: number
  sale_price?: number
  gender?: string
  model?: string
  stock?: number
  createdAt: any
  updatedAt: any
}

export function useFirebaseProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const productsRef = collection(db, 'products')
        const snapshot = await getDocs(productsRef)
        
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[]
        
        setProducts(productsData)
        setError(null)
      } catch (err) {
        console.error('Erro ao carregar produtos:', err)
        setError('Erro ao carregar produtos')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const getProductById = async (id: string): Promise<Product | null> => {
    try {
      const productRef = doc(db, 'products', id)
      const snapshot = await getDoc(productRef)
      
      if (snapshot.exists()) {
        return {
          id: snapshot.id,
          ...snapshot.data()
        } as Product
      }
      return null
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
      return null
    }
  }

  const getProductsByCategory = async (category: string): Promise<Product[]> => {
    try {
      const productsRef = collection(db, 'products')
      const q = query(productsRef, where('category', '==', category))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[]
    } catch (error) {
      console.error('Erro ao buscar produtos por categoria:', error)
      return []
    }
  }

  const getFeaturedProducts = async (): Promise<Product[]> => {
    try {
      const productsRef = collection(db, 'products')
      const q = query(productsRef, where('featured', '==', true), limit(10))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[]
    } catch (error) {
      console.error('Erro ao buscar produtos em destaque:', error)
      return []
    }
  }

  const getPromotionalProducts = async (): Promise<Product[]> => {
    try {
      const productsRef = collection(db, 'products')
      const q = query(productsRef, where('on_sale', '==', true), limit(10))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[]
    } catch (error) {
      console.error('Erro ao buscar produtos promocionais:', error)
      return []
    }
  }

  const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    try {
      const productsRef = collection(db, 'products')
      const newProduct = {
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const docRef = await addDoc(productsRef, newProduct)
      return {
        id: docRef.id,
        ...newProduct
      } as Product
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      throw error
    }
  }

  const updateProduct = async (id: string, productData: Partial<Product>): Promise<void> => {
    try {
      const productRef = doc(db, 'products', id)
      await updateDoc(productRef, {
        ...productData,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      throw error
    }
  }

  const deleteProduct = async (id: string): Promise<void> => {
    try {
      const productRef = doc(db, 'products', id)
      await deleteDoc(productRef)
    } catch (error) {
      console.error('Erro ao deletar produto:', error)
      throw error
    }
  }

  return {
    products,
    loading,
    error,
    getProductById,
    getProductsByCategory,
    getFeaturedProducts,
    getPromotionalProducts,
    createProduct,
    updateProduct,
    deleteProduct
  }
}