/**
 * Sistema de logging condicional
 * Logs de debug apenas em desenvolvimento
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  // Debug: apenas em desenvolvimento
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`🔍 ${message}`, data !== undefined ? data : '')
    }
  },

  // Info: sempre mostrar
  info: (message: string, data?: any) => {
    console.log(`ℹ️ ${message}`, data !== undefined ? data : '')
  },

  // Warning: sempre mostrar
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ ${message}`, data !== undefined ? data : '')
  },

  // Error: sempre mostrar
  error: (message: string, error?: any) => {
    console.error(`❌ ${message}`, error !== undefined ? error : '')
  },

  // Success: apenas em desenvolvimento
  success: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`✅ ${message}`, data !== undefined ? data : '')
    }
  }
}

export default logger








