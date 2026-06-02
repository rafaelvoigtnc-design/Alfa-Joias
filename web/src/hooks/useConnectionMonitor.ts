import { useState, useEffect, useRef } from 'react'
import { checkInternetConnection } from '@/lib/errorHandler'

/**
 * Hook para monitorar a conexão com a internet
 * Retorna o status da conexão e uma função para verificar manualmente
 */
export function useConnectionMonitor() {
  const [isOnline, setIsOnline] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      const online = await checkInternetConnection()
      setIsOnline(online)
      
      if (!online) {
        console.warn('⚠️ Sem conexão com a internet')
      } else {
        console.log('✅ Conexão com a internet restaurada')
      }
    } catch (error) {
      console.error('❌ Erro ao verificar conexão:', error)
      setIsOnline(false)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Verificar conexão inicial
    checkConnection()

    // Escutar eventos de online/offline do navegador
    const handleOnline = () => {
      console.log('🌐 Evento online detectado')
      setIsOnline(true)
      checkConnection()
    }

    const handleOffline = () => {
      console.warn('📴 Evento offline detectado')
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Verificar conexão periodicamente (a cada 30 segundos)
    checkIntervalRef.current = setInterval(() => {
      checkConnection()
    }, 30000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [])

  return {
    isOnline,
    isChecking,
    checkConnection
  }
}







