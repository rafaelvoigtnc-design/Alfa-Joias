/**
 * Funções de validação e sanitização
 */

// Validação de produto
export interface ProductValidation {
  name: string
  description: string
  price: string
  category: string
  brand: string
  image: string
}

export const validateProductData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Nome
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Nome é obrigatório')
  } else if (data.name.length > 200) {
    errors.push('Nome muito longo (máximo 200 caracteres)')
  }

  // Descrição
  if (data.description && data.description.length > 2000) {
    errors.push('Descrição muito longa (máximo 2000 caracteres)')
  }

  // Preço
  const price = parseFloat(data.price)
  if (isNaN(price)) {
    errors.push('Preço inválido')
  } else if (price < 0) {
    errors.push('Preço não pode ser negativo')
  } else if (price > 999999) {
    errors.push('Preço muito alto')
  }

  // Categoria
  if (!data.category || data.category.trim().length === 0) {
    errors.push('Categoria é obrigatória')
  }

  // Marca - agora opcional (não obrigatória)
  // Validação removida para permitir produtos sem marca

  // URL da imagem - permitir URLs longas (podem ser base64 ou links de serviços de armazenamento)
  // Removida limitação de tamanho, pois imagens podem estar no banco como base64 ou URLs longas

  return {
    valid: errors.length === 0,
    errors
  }
}

// Sanitização de texto (remove HTML/JavaScript)
export const sanitizeText = (text: string): string => {
  if (!text) return ''
  
  return text
    .replace(/[<>]/g, '')  // Remove < >
    .replace(/javascript:/gi, '')  // Remove javascript:
    .replace(/on\w+=/gi, '')  // Remove event handlers (onclick=, onload=, etc)
    .trim()
}

// Sanitização para WhatsApp
export const sanitizeForWhatsApp = (text: string): string => {
  if (!text) return ''
  
  return text
    .replace(/[<>]/g, '')  // Remove < >
    .replace(/javascript:/gi, '')  // Remove javascript:
    .replace(/\*/g, '＊')  // Substitui * por similar unicode (evita formatação indesejada)
    .replace(/_/g, '＿')  // Substitui _ por similar unicode
    .trim()
}

// Validação de email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validação de telefone brasileiro
export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length >= 10 && cleaned.length <= 11
}

// Validação de URL
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Limitar tamanho de string
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength - 3) + '...'
}





