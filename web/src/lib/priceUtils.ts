export function parsePrice(price: string | number): number {
  if (typeof price === 'number') {
    return Number.isFinite(price) ? price : 0
  }

  if (price === null || price === undefined) {
    return 0
  }

  const raw = String(price).trim()
  if (raw === '') {
    return 0
  }

  // Manter apenas dígitos, vírgulas, pontos e sinal de negativo
  let cleaned = raw.replace(/[^0-9,.-]/g, '')

  if (cleaned === '' || cleaned === '-' || cleaned === ',' || cleaned === '.') {
    return 0
  }

  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')
  const separatorIndex = Math.max(lastComma, lastDot)

  let integerPart = ''
  let decimalPart = ''

  if (separatorIndex !== -1) {
    integerPart = cleaned.slice(0, separatorIndex).replace(/[^0-9-]/g, '')
    decimalPart = cleaned.slice(separatorIndex + 1).replace(/[^0-9]/g, '')
  } else {
    integerPart = cleaned.replace(/[^0-9-]/g, '')
  }

  if (decimalPart.length > 2) {
    decimalPart = decimalPart.slice(0, 2)
  }

  if (integerPart === '' && decimalPart === '') {
    return 0
  }

  if (integerPart === '' || integerPart === '-') {
    integerPart = integerPart.includes('-') ? '-0' : '0'
  }

  if (separatorIndex !== -1 && decimalPart === '') {
    decimalPart = '0'
  }

  const normalized = decimalPart
    ? `${integerPart}.${decimalPart.padEnd(2, '0')}`
    : integerPart

  const value = parseFloat(normalized)
  return Number.isFinite(value) ? value : 0
}

export function formatPriceValue(price: string | number): string {
  const numericValue = parsePrice(price)
  return numericValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatPrice(price: string | number): string {
  const numericValue = parsePrice(price)
  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function calculateDiscount(originalPrice: string, salePrice: string): number {
  const original = parsePrice(originalPrice)
  const sale = parsePrice(salePrice)

  if (original === 0) {
    return 0
  }

  return Math.round(((original - sale) / original) * 100)
}
