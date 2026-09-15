'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Service {
  id: string
  title: string
  description: string
  features: string[]
  whatsapp_message: string
  icon?: string
  createdAt: any
  updatedAt: any
}

export function useFirebaseServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        const servicesRef = collection(db, 'services')
        const snapshot = await getDocs(servicesRef)
        
        const servicesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Service[]
        
        setServices(servicesData)
        setError(null)
      } catch (err) {
        console.error('Erro ao carregar serviços:', err)
        setError('Erro ao carregar serviços')
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const getServiceById = async (id: string): Promise<Service | null> => {
    try {
      const serviceRef = doc(db, 'services', id)
      const snapshot = await getDoc(serviceRef)
      
      if (snapshot.exists()) {
        return {
          id: snapshot.id,
          ...snapshot.data()
        } as Service
      }
      return null
    } catch (error) {
      console.error('Erro ao buscar serviço:', error)
      return null
    }
  }

  const createService = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> => {
    try {
      const servicesRef = collection(db, 'services')
      const newService = {
        ...serviceData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const docRef = await addDoc(servicesRef, newService)
      return {
        id: docRef.id,
        ...newService
      } as Service
    } catch (error) {
      console.error('Erro ao criar serviço:', error)
      throw error
    }
  }

  const updateService = async (id: string, serviceData: Partial<Service>): Promise<void> => {
    try {
      const serviceRef = doc(db, 'services', id)
      await updateDoc(serviceRef, {
        ...serviceData,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error)
      throw error
    }
  }

  const deleteService = async (id: string): Promise<void> => {
    try {
      const serviceRef = doc(db, 'services', id)
      await deleteDoc(serviceRef)
    } catch (error) {
      console.error('Erro ao deletar serviço:', error)
      throw error
    }
  }

  const refresh = async () => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        const servicesRef = collection(db, 'services')
        const snapshot = await getDocs(servicesRef)
        
        const servicesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Service[]
        
        setServices(servicesData)
        setError(null)
      } catch (err) {
        console.error('Erro ao carregar serviços:', err)
        setError('Erro ao carregar serviços')
      } finally {
        setLoading(false)
      }
    }
    await fetchServices()
  }

  return {
    services,
    loading,
    error,
    getServiceById,
    createService,
    updateService,
    deleteService,
    refresh
  }
}
