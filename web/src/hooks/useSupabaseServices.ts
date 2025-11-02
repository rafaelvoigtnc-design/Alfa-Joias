import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Service {
  id: string
  title: string
  description: string
  features: string[]
  whatsapp_message: string
  created_at: string
  updated_at: string
}

export function useSupabaseServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      console.log('🔄 Buscando serviços via API...')
      
      const response = await fetch('/api/services')
      
      if (!response.ok) {
        const text = await response.text()
        let errorData: any = {}
        try {
          errorData = JSON.parse(text)
        } catch {
          errorData = { error: text }
        }
        
        console.error('❌ Erro na API de serviços:', response.status, errorData)
        
        // Se for erro de conexão (503), mostrar mensagem amigável
        if (errorData.connectionError || response.status === 503) {
          console.warn('⚠️ Erro de conexão detectado. Serviços não podem ser carregados.')
        }
        
        setServices([])
        setLoading(false)
        return
      }
      
      const data = await response.json()
      
      if (!data.success) {
        console.error('❌ Erro na resposta da API:', data.error)
        
        // Tratar erros de conexão
        if (data.connectionError) {
          console.warn('⚠️ Erro de conexão detectado. Serviços não podem ser carregados.')
        }
        
        setServices([])
        setLoading(false)
        return
      }
      
      if (!data.services || data.services.length === 0) {
        console.warn('⚠️ Nenhum serviço encontrado!')
        setServices([])
        setLoading(false)
        return
      }
      
      console.log('✅ Serviços carregados via API:', data.services.length)
      setServices(data.services)
      setLoading(false)
    } catch (error) {
      console.error('❌ Erro ao carregar serviços:', error)
      setServices([])
      setLoading(false)
    }
  }

  const addService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('➕ Adicionando serviço via API...')
      
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(service),
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido')
      }

      console.log('✅ Serviço adicionado via API')
      setServices(prev => [...prev, data.service])
      return data.service
    } catch (error) {
      console.error('❌ Erro ao adicionar serviço:', error)
      throw error
    }
  }

  const updateService = async (id: string, updates: Partial<Service>) => {
    try {
      console.log('✏️ Atualizando serviço via API...')
      
      const response = await fetch('/api/services', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido')
      }

      console.log('✅ Serviço atualizado via API')
      setServices(prev => prev.map(service => 
        service.id === id ? data.service : service
      ))
      return data.service
    } catch (error) {
      console.error('❌ Erro ao atualizar serviço:', error)
      throw error
    }
  }

  const deleteService = async (id: string) => {
    try {
      console.log('🗑️ Deletando serviço via API...')
      
      const response = await fetch(`/api/services?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido')
      }

      console.log('✅ Serviço deletado via API')
      setServices(prev => prev.filter(service => service.id !== id))
    } catch (error) {
      console.error('❌ Erro ao deletar serviço:', error)
      throw error
    }
  }

  return {
    services,
    loading,
    addService,
    updateService,
    deleteService,
    refresh: loadServices
  }
}
