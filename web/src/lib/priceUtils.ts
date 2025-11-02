// Utilitários para formatação de preços

export function formatPrice(price: string | number): string {
  // Remove qualquer zero extra e formata corretamente
  if (price === null || price === undefined) return 'R$ 0,00'
  
  // Converter número para string se necessário
  const priceString = typeof price === 'number' ? price.toString() : String(price)
  if (!priceString || priceString.trim() === '') return 'R$ 0,00'
  
  // Remove caracteres não numéricos exceto vírgula e ponto
  let cleanPrice = priceString.replace(/[^\d,.]/g, '')
  
  // Se tem vírgula, processa as casas decimais
  if (cleanPrice.includes(',')) {
    const parts = cleanPrice.split(',')
    const integerPart = parts[0]
    let decimalPart = parts[1] || ''
    
    // Se tem mais de 2 casas decimais, corta para 2
    if (decimalPart.length > 2) {
      decimalPart = decimalPart.substring(0, 2)
    }
    // Se tem menos de 2 casas decimais, completa com zeros
    else if (decimalPart.length === 1) {
      decimalPart = decimalPart + '0'
    }
    // Se não tem casas decimais, adiciona 00
    else if (decimalPart.length === 0) {
      decimalPart = '00'
    }
    
    cleanPrice = integerPart + ',' + decimalPart
  }
  // Se não tem vírgula, adiciona ,00
  else {
    cleanPrice = cleanPrice + ',00'
  }
  
  // Adiciona R$ no início
  return `R$ ${cleanPrice}`
}

export function parsePrice(price: string | number): number {
  // Se já é número, retorna direto
  if (typeof price === 'number') return price || 0
  
  // Converte preço string para número
  if (!price) return 0
  const cleanPrice = String(price).replace(/[^\d,]/g, '').replace(',', '.')
  return parseFloat(cleanPrice) || 0
}

export function calculateDiscount(originalPrice: string, salePrice: string): number {
  const original = parsePrice(originalPrice)
  const sale = parsePrice(salePrice)
  
  if (original === 0) return 0
  
  return Math.round(((original - sale) / original) * 100)
}
