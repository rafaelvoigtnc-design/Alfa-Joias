'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Banner {
  id: string
  title: string
  subtitle: string
  image: string
  cta_text: string
  cta_link: string
  active: boolean
  createdAt: any
  updatedAt: any
}

export function useFirebaseBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true)
        const bannersRef = collection(db, 'banners')
        const q = query(bannersRef, where('active', '==', true))
        const snapshot = await getDocs(q)
        
        const bannersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Banner[]
        
        setBanners(bannersData)
        setError(null)
      } catch (err) {
        console.error('Erro ao carregar banners:', err)
        setError('Erro ao carregar banners')
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  const getBannerById = async (id: string): Promise<Banner | null> => {
    try {
      const bannerRef = doc(db, 'banners', id)
      const snapshot = await getDoc(bannerRef)
      
      if (snapshot.exists()) {
        return {
          id: snapshot.id,
          ...snapshot.data()
        } as Banner
      }
      return null
    } catch (error) {
      console.error('Erro ao buscar banner:', error)
      return null
    }
  }

  const createBanner = async (bannerData: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>): Promise<Banner> => {
    try {
      const bannersRef = collection(db, 'banners')
      const newBanner = {
        ...bannerData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const docRef = await addDoc(bannersRef, newBanner)
      return {
        id: docRef.id,
        ...newBanner
      } as Banner
    } catch (error) {
      console.error('Erro ao criar banner:', error)
      throw error
    }
  }

  const updateBanner = async (id: string, bannerData: Partial<Banner>): Promise<void> => {
    try {
      const bannerRef = doc(db, 'banners', id)
      await updateDoc(bannerRef, {
        ...bannerData,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Erro ao atualizar banner:', error)
      throw error
    }
  }

  const deleteBanner = async (id: string): Promise<void> => {
    try {
      const bannerRef = doc(db, 'banners', id)
      await deleteDoc(bannerRef)
    } catch (error) {
      console.error('Erro ao deletar banner:', error)
      throw error
    }
  }

  return {
    banners,
    loading,
    error,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner
  }
}