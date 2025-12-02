/**
 * Função auxiliar para tratar erros de conexão do Supabase
 */

export interface ConnectionError {
  isConnectionError: boolean
  message: string
  friendlyMessage: string
}

export function isConnectionError(error: any): ConnectionError {
  const errorMessage = error?.message || String(error || '').toLowerCase()
  const errorCode = error?.code
  
  // Verificar padrões comuns de erros de conexão
  const connectionPatterns = [
    'connection failed',
    'fetch failed',
    'network error',
    'networkerror',
    'failed to fetch',
    'network request failed',
    'timeout',
    'econnrefused',
    'enotfound',
    'econnreset',
    'check your internet connection',
    'check your vpn',
    'internet connection',
    'no internet',
    'offline'
  ]

  const isConnError = connectionPatterns.some(pattern => 
    errorMessage.includes(pattern)
  ) || errorCode === 'ECONNREFUSED' || errorCode === 'ENOTFOUND' || errorCode === 'ETIMEDOUT'

  if (isConnError) {
    return {
      isConnectionError: true,
      message: errorMessage,
      friendlyMessage: 'Erro de conexão com o servidor. Verifique sua conexão com a internet e tente novamente.'
    }
  }

  // Verificar erros específicos do Supabase
  if (errorMessage.includes('schema cache') || errorMessage.includes('column')) {
    return {
      isConnectionError: false,
      message: errorMessage,
      friendlyMessage: 'Erro no banco de dados. Verifique se todas as colunas necessárias existem na tabela.'
    }
  }

  return {
    isConnectionError: false,
    message: errorMessage,
    friendlyMessage: errorMessage
  }
}

/**
 * Função para fazer retry de chamadas com backoff exponencial
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      const connError = isConnectionError(error)
      
      // Se não for erro de conexão e não for erro de servidor (500, 503), não fazer retry
      if (!connError.isConnectionError && attempt === 0) {
        // Verificar se é erro de servidor que vale a pena tentar novamente
        const isServerError = error instanceof Error && (
          error.message.includes('503') || 
          error.message.includes('500') ||
          error.message.includes('502') ||
          error.message.includes('504')
        )
        
        if (!isServerError) {
          throw error
        }
      }
      
      // Se for a última tentativa, lançar o erro
      if (attempt === maxRetries) {
        break
      }
      
      // Aguardar antes de tentar novamente (backoff exponencial)
      const waitTime = delayMs * Math.pow(2, attempt)
      console.log(`⏳ Tentativa ${attempt + 1}/${maxRetries + 1} falhou. Aguardando ${waitTime}ms antes de tentar novamente...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  throw lastError
}

/**
 * Verifica se há conexão com a internet
 * Usa navigator.onLine como fallback para evitar problemas de CORS
 */
export async function checkInternetConnection(): Promise<boolean> {
  if (typeof window === 'undefined') return true
  
  // Primeiro verificar o status do navegador
  if (!navigator.onLine) {
    return false
  }
  
  try {
    // Tentar fazer uma requisição simples para verificar conexão
    // Usar um endpoint que não bloqueia CORS
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    
    // Tentar verificar conexão fazendo uma requisição para o próprio site
    const response = await fetch(window.location.origin + '/api/products?_health=true', {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store'
    }).catch(() => null)
    
    clearTimeout(timeoutId)
    
    // Se a requisição funcionou ou se foi bloqueada por CORS mas o navegador está online, considerar online
    return response !== null || navigator.onLine
  } catch {
    // Se falhar, usar o status do navegador como fallback
    return navigator.onLine
  }
}









