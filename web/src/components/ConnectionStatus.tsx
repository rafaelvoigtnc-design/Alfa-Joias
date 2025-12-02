'use client'

import { Wifi, WifiOff, X } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * Componente que mostra o status da conexão com a internet
 * Aparece no topo da página quando há problemas de conexão
 */
export default function ConnectionStatus() {
  const [showOffline, setShowOffline] = useState(false)
  const [showOnline, setShowOnline] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Usar apenas eventos do navegador para evitar problemas
    const handleOnline = () => {
      setIsOnline(true)
      setShowOffline(false)
      setShowOnline(true)
      setTimeout(() => {
        setShowOnline(false)
      }, 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOffline(true)
      setShowOnline(false)
    }

    // Verificar status inicial
    setIsOnline(navigator.onLine)
    if (!navigator.onLine) {
      setShowOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showOffline && !showOnline) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      {showOffline && (
        <div className="bg-red-600 text-white px-4 py-3 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="w-5 h-5" />
              <span className="font-medium">
                Sem conexão com a internet. Verificando automaticamente...
              </span>
            </div>
            <button
              onClick={() => setShowOffline(false)}
              className="ml-4 text-white hover:text-gray-200 transition-colors"
              aria-label="Fechar notificação"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {showOnline && (
        <div className="bg-green-600 text-white px-4 py-3 shadow-lg">
          <div className="container mx-auto flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            <span className="font-medium">
              Conexão restaurada! Os dados serão atualizados automaticamente.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Adicionar estilo de animação se não existir
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slide-down {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    .animate-slide-down {
      animation: slide-down 0.3s ease-out;
    }
  `
  if (!document.head.querySelector('style[data-connection-status]')) {
    style.setAttribute('data-connection-status', 'true')
    document.head.appendChild(style)
  }
}

