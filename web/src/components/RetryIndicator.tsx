'use client'

import { RefreshCw } from 'lucide-react'

interface RetryIndicatorProps {
  isRetrying: boolean
  retryAttempt: number
  maxRetries?: number
  message?: string
}

export default function RetryIndicator({ 
  isRetrying, 
  retryAttempt, 
  maxRetries = 5,
  message = 'Tentando carregar dados novamente...'
}: RetryIndicatorProps) {
  if (!isRetrying) return null

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 z-50 animate-pulse">
      <RefreshCw className="h-5 w-5 animate-spin" />
      <div>
        <p className="text-sm font-medium">{message}</p>
        <p className="text-xs opacity-90">Tentativa {retryAttempt} de {maxRetries}</p>
      </div>
    </div>
  )
}

