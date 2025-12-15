/**
 * Sistema de retry automático com backoff exponencial e fallback para cache
 */

import { useState, useCallback } from 'react'

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  retryableErrors?: number[]
  onRetry?: (attempt: number, error: any) => void
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 5,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: [500, 502, 503, 504, 408, 429],
  onRetry: () => {}
}

/**
 * Calcula o delay para a próxima tentativa usando backoff exponencial
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt)
  return Math.min(delay, options.maxDelay)
}

/**
 * Verifica se um erro é recuperável e deve ser tentado novamente
 */
function isRetryableError(error: any, options: Required<RetryOptions>): boolean {
  // Erros de rede sempre são recuperáveis
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }
  
  // Erros de timeout
  if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
    return true
  }
  
  // Erros HTTP específicos
  if (error?.status && options.retryableErrors.includes(error.status)) {
    return true
  }
  
  // Erros de conexão
  if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
    return true
  }
  
  return false
}

/**
 * Executa uma função com retry automático
 */
export async function withAutoRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: any
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const result = await fn()
      // Se chegou aqui, sucesso!
      if (attempt > 0) {
        console.log(`✅ Sucesso após ${attempt + 1} tentativa(s)`)
      }
      return result
    } catch (error: any) {
      lastError = error
      
      // Se não é um erro recuperável, não tentar novamente
      if (!isRetryableError(error, opts)) {
        console.error('❌ Erro não recuperável:', error)
        throw error
      }
      
      // Se ainda há tentativas disponíveis
      if (attempt < opts.maxRetries) {
        const delay = calculateDelay(attempt, opts)
        console.log(`⏳ Tentativa ${attempt + 1}/${opts.maxRetries + 1} falhou. Tentando novamente em ${delay}ms...`, error?.message || error)
        
        // Chamar callback de retry
        opts.onRetry(attempt + 1, error)
        
        // Aguardar antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        console.error(`❌ Todas as ${opts.maxRetries + 1} tentativas falharam`)
      }
    }
  }
  
  throw lastError
}

/**
 * Executa fetch com retry automático
 */
export async function fetchWithAutoRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return withAutoRetry(
    async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 segundos de timeout
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        // Se for erro HTTP recuperável, lançar erro para tentar novamente
        if (!response.ok && retryOptions.retryableErrors?.includes(response.status)) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        return response
      } catch (error: any) {
        clearTimeout(timeoutId)
        throw error
      }
    },
    retryOptions
  )
}

/**
 * Hook para gerenciar retry automático com estado visual
 */
export function useAutoRetry<T>(
  fetchFn: () => Promise<T>,
  options: RetryOptions & { 
    onSuccess?: (data: T) => void
    onError?: (error: any) => void
    enabled?: boolean
  } = {}
) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryAttempt, setRetryAttempt] = useState(0)
  const [lastError, setLastError] = useState<any>(null)
  
  const execute = useCallback(async (): Promise<T | null> => {
    if (options.enabled === false) return null
    
    setIsRetrying(false)
    setRetryAttempt(0)
    setLastError(null)
    
    try {
      const result = await withAutoRetry(fetchFn, {
        ...options,
        onRetry: (attempt, error) => {
          setIsRetrying(true)
          setRetryAttempt(attempt)
          setLastError(error)
          options.onRetry?.(attempt, error)
        }
      })
      
      setIsRetrying(false)
      options.onSuccess?.(result)
      return result
    } catch (error) {
      setIsRetrying(false)
      setLastError(error)
      options.onError?.(error)
      throw error
    }
  }, [fetchFn, options])
  
  return {
    execute,
    isRetrying,
    retryAttempt,
    lastError
  }
}

// Import necessário para o hook
import { useState, useCallback } from 'react'

