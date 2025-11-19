import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface Service {
  id: string
  title: string
  description: string
  features: string[]
  whatsapp_message: string
  icon?: string
  created_at: string
  updated_at: string
}

export function useSupabaseServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  
  // Refs para prevenir race conditions
  const isFetchingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (isFetchingRef.current) {
      console.log('⏸️ Já está buscando serviços, ignorando chamada duplicada...')
      return
    }
    
    try {
      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      // Criar novo AbortController para esta requisição
      const controller = new AbortController()
      abortControllerRef.current = controller
      
      // Incrementar ID da requisição para rastrear a mais recente
      const currentRequestId = ++requestIdRef.current
      
      isFetchingRef.current = true
      setLoading(true)
      console.log('🔄 Buscando serviços via API...', { requestId: currentRequestId })
      
      // Adicionar timestamp único para forçar bypass do cache do Cloudflare/CDN e navegador
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(7)
      const response = await fetch(`/api/services?_t=${timestamp}&_r=${random}`, {
        cache: 'no-store',
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Request-ID': `${timestamp}-${random}`
        },
        signal: controller.signal
      })
      
      // Verificar se esta requisição foi cancelada
      if (controller.signal.aborted) {
        console.log('⏹️ Requisição cancelada (nova requisição iniciada)')
        return
      }
      
      // Verificar se ainda é a requisição mais recente
      if (currentRequestId !== requestIdRef.current) {
        console.log('⏹️ Requisição antiga ignorada (nova requisição já iniciada)')
        return
      }
      
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
        isFetchingRef.current = false
        return
      }
      
      const data = await response.json()
      
      // Verificar novamente se ainda é a requisição mais recente
      if (currentRequestId !== requestIdRef.current) {
        console.log('⏹️ Resposta de requisição antiga ignorada')
        return
      }
      
      if (!data.success) {
        console.error('❌ Erro na resposta da API:', data.error)
        
        // Tratar erros de conexão
        if (data.connectionError) {
          console.warn('⚠️ Erro de conexão detectado. Serviços não podem ser carregados.')
        }
        
        setServices([])
        setLoading(false)
        isFetchingRef.current = false
        return
      }
      
      if (!data.services || data.services.length === 0) {
        console.warn('⚠️ Nenhum serviço encontrado!')
        setServices([])
        setLoading(false)
        isFetchingRef.current = false
        return
      }
      
      console.log('✅ Serviços carregados via API:', data.services.length, { requestId: currentRequestId })
      setServices(data.services)
      setLoading(false)
      isFetchingRef.current = false
    } catch (error) {
      // Verificar se foi cancelamento (não é erro real)
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('⏹️ Requisição cancelada (nova requisição ou timeout)')
        return // Não atualizar estado se foi cancelada
      }
      
      console.error('❌ Erro ao carregar serviços:', error)
      
      // Só atualizar estado se ainda for a requisição mais recente
      const latestRequestId = requestIdRef.current
      if (currentRequestId === latestRequestId) {
        setServices([])
        setLoading(false)
      }
      isFetchingRef.current = false
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
