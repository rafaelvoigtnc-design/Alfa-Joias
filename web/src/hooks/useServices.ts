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
        // Primeiro, verificar se há dados no localStorage (prioridade para mudanças do admin)
        const savedServices = localStorage.getItem('alfajoias-services')
        if (savedServices) {
          setServices(JSON.parse(savedServices))
          setLoading(false)
          return
        }

        // Se não há dados locais, tentar carregar do banco
        const response = await fetch('/api/services')
        if (response.ok) {
          const data = await response.json()
          setServices(data.services || [])
        } else {
          // Se não conseguir do banco, usar serviços padrão apenas se não há dados
          const defaultServices: Service[] = [
            {
              id: '1',
              title: 'Manutenção de Relógios',
              description: 'Reparos e ajustes em relógios de todas as marcas',
              features: ['Troca de bateria', 'Ajuste de pulseira', 'Limpeza interna'],
              whatsappMessage: 'Olá! Gostaria de solicitar informações sobre manutenção de relógios. Podem me ajudar?'
            },
            {
              id: '2',
              title: 'Ajustes de Óculos',
              description: 'Ajustes precisos para melhor conforto e visual',
              features: ['Ajuste de hastes', 'Correção de posição', 'Troca de lentes'],
              whatsappMessage: 'Olá! Gostaria de solicitar informações sobre ajustes de óculos. Podem me ajudar?'
            },
            {
              id: '3',
              title: 'Garantia Estendida',
              description: 'Garantia adicional em produtos e serviços',
              features: ['Garantia de 1 ano', 'Suporte técnico', 'Troca sem burocracia'],
              whatsappMessage: 'Olá! Gostaria de solicitar informações sobre garantia estendida. Podem me ajudar?'
            },
            {
              id: '4',
              title: 'Serviço Rápido',
              description: 'Atendimento ágil para suas necessidades urgentes',
              features: ['Entrega no mesmo dia', 'Orçamento imediato', 'Atendimento prioritário'],
              whatsappMessage: 'Olá! Gostaria de solicitar informações sobre serviço rápido. Podem me ajudar?'
            },
            {
              id: '5',
              title: 'Qualidade Garantida',
              description: 'Produtos e serviços com certificação de qualidade',
              features: ['Produtos originais', 'Técnicos especializados', 'Materiais premium'],
              whatsappMessage: 'Olá! Gostaria de solicitar informações sobre qualidade garantida. Podem me ajudar?'
            },
            {
              id: '6',
              title: 'Troca de Bateria',
              description: 'Troca de bateria para relógios e acessórios',
              features: ['Baterias originais', 'Instalação gratuita', 'Garantia de 6 meses'],
              whatsappMessage: 'Olá! Gostaria de solicitar informações sobre troca de bateria. Podem me ajudar?'
            }
          ]
          setServices(defaultServices)
          localStorage.setItem('alfajoias-services', JSON.stringify(defaultServices))
        }
      } catch (error) {
        console.error('Erro ao carregar serviços:', error)
        // Fallback para localStorage
        const savedServices = localStorage.getItem('alfajoias-services')
        if (savedServices) {
          setServices(JSON.parse(savedServices))
        }
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
        // Fallback para localStorage
        const newService = { ...service, id: Date.now().toString() }
        setServices(prev => [...prev, newService])
        localStorage.setItem('alfajoias-services', JSON.stringify([...services, newService]))
        return newService
      }
    } catch (error) {
      console.error('Erro ao adicionar serviço:', error)
      // Fallback para localStorage
      const newService = { ...service, id: Date.now().toString() }
      setServices(prev => [...prev, newService])
      localStorage.setItem('alfajoias-services', JSON.stringify([...services, newService]))
      return newService
    }
  }

  const updateService = (id: string, updatedService: Partial<Service>) => {
    const updated = services.map(service => 
      service.id === id ? { ...service, ...updatedService } : service
    )
    setServices(updated)
    localStorage.setItem('alfajoias-services', JSON.stringify(updated))
  }

  const deleteService = (id: string) => {
    const updated = services.filter(service => service.id !== id)
    setServices(updated)
    localStorage.setItem('alfajoias-services', JSON.stringify(updated))
  }

  return {
    services,
    loading,
    addService,
    updateService,
    deleteService
  }
}
