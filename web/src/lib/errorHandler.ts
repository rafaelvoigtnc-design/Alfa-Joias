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
      
      // Se não for erro de conexão, não fazer retry
      if (!connError.isConnectionError && attempt === 0) {
        throw error
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





