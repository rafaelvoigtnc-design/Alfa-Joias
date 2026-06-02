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

// Cache local para fallback - aumentado para carregamento instantâneo
const CACHE_KEY = 'alfajoias-services-cache'
const CACHE_EXPIRY = 30 * 60 * 1000 // 30 minutos (carregamento instantâneo)

interface CacheData {
  services: Service[]
  timestamp: number
}

function getCachedServices(): Service[] | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    
    const data: CacheData = JSON.parse(cached)
    const now = Date.now()
    
    if (now - data.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    
    return data.services
  } catch {
    return null
  }
}

function setCachedServices(services: Service[]) {
  if (typeof window === 'undefined') return
  
  try {
    const data: CacheData = {
      services,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // Ignorar erros de localStorage
  }
}

// Função de retry com backoff exponencial
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<Response> {
  let lastError: any
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)
      
      if (response.status === 503 || response.status === 500) {
        if (attempt < maxRetries) {
          const waitTime = delayMs * Math.pow(2, attempt)
          console.log(`⏳ Tentativa ${attempt + 1}/${maxRetries + 1} falhou (${response.status}). Aguardando ${waitTime}ms...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }
      }
      
      return response
    } catch (error) {
      lastError = error
      if (attempt < maxRetries) {
        const waitTime = delayMs * Math.pow(2, attempt)
        console.log(`⏳ Tentativa ${attempt + 1}/${maxRetries + 1} falhou. Aguardando ${waitTime}ms...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }
  
  throw lastError
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
    
    // Incrementar ID da requisição para rastrear a mais recente (fora do try para estar no escopo do catch)
    const currentRequestId = ++requestIdRef.current
    
    try {
      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      // Criar novo AbortController para esta requisição
      const controller = new AbortController()
      abortControllerRef.current = controller
      
      isFetchingRef.current = true
      setLoading(true)
      console.log('🔄 Buscando serviços via API...', { requestId: currentRequestId })
      
      // Carregar cache local primeiro para carregamento instantâneo
      const cachedServices = getCachedServices()
      if (cachedServices && cachedServices.length > 0) {
        console.log('⚡ Carregamento instantâneo do cache local:', cachedServices.length, 'serviços')
        setServices(cachedServices)
        setLoading(false) // Mostrar dados do cache imediatamente
      }
      
      // Usar cache do navegador com tempo maior para carregamento instantâneo
      const response = await fetchWithRetry(
        `/api/services`,
        {
          cache: 'default', // Usar cache do navegador
          method: 'GET',
          headers: {
            'Cache-Control': 'max-age=300' // 5 minutos de cache
          },
          signal: controller.signal
        },
        2, // 2 tentativas
        500 // delay inicial 500ms
      )
      
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
      
      // Salvar no cache local
      setCachedServices(data.services)
      
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
        // Tentar usar cache local como fallback
        const cachedServices = getCachedServices()
        if (cachedServices && cachedServices.length > 0) {
          console.log('📦 Usando serviços do cache local devido a erro:', cachedServices.length)
          setServices(cachedServices)
        } else {
          setServices([])
        }
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
      console.log('✅ Dados retornados da API:', JSON.stringify(data.service, null, 2))
      console.log('✅ WhatsApp message retornado:', data.service?.whatsapp_message)
      console.log('✅ Icon retornado:', data.service?.icon)
      
      // Atualizar estado local com os dados retornados
      setServices(prev => prev.map(service => 
        service.id === id ? { ...service, ...data.service } : service
      ))
      
      // Forçar reload para garantir que está sincronizado
      setTimeout(() => {
        loadServices()
      }, 500)
      
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
