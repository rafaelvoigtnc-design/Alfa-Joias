import { useState, useEffect } from 'react'

interface Service {
  id: string
  title: string
  description: string
  features: string[]
  whatsappMessage: string
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadServices = async () => {
      try {
        // SEMPRE carregar do banco - NUNCA usar localStorage ou fallback
        const timestamp = Date.now()
        const response = await fetch(`/api/services?_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.services) {
            setServices(data.services)
          } else {
            // Se não houver serviços no banco, retornar array vazio
            setServices([])
          }
        } else {
          // Se erro na API, retornar array vazio (não usar fallback)
          console.error('❌ Erro ao carregar serviços da API:', response.status)
          setServices([])
        }
      } catch (error) {
        console.error('❌ Erro ao carregar serviços:', error)
        // Em caso de erro, retornar array vazio (não usar fallback)
        setServices([])
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [])

  const addService = async (service: Omit<Service, 'id'>) => {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(service),
      })

      if (response.ok) {
        const data = await response.json()
        const newService = { ...service, id: data.service.id }
        setServices(prev => [...prev, newService])
        return newService
      } else {
        throw new Error(`Erro na API: ${response.status}`)
      }
    } catch (error) {
      console.error('Erro ao adicionar serviço:', error)
      throw error
    }
  }

  const updateService = (id: string, updatedService: Partial<Service>) => {
    const updated = services.map(service => 
      service.id === id ? { ...service, ...updatedService } : service
    )
    setServices(updated)
    // NÃO salvar no localStorage - sempre usar banco
  }

  const deleteService = (id: string) => {
    const updated = services.filter(service => service.id !== id)
    setServices(updated)
    // NÃO salvar no localStorage - sempre usar banco
  }

  return {
    services,
    loading,
    addService,
    updateService,
    deleteService
  }
}
