/**
 * Utilitários para recomendação e ordenação inteligente de produtos
 */

// Interface flexível para produtos (compatível com diferentes definições)
interface Product {
  id: string
  category?: string
  brand?: string
  price?: string
  on_sale?: boolean
  featured?: boolean
  stock?: number
  name?: string
  description?: string
  image?: string
  [key: string]: any
}

/**
 * Gera uma seed determinística baseada na data atual (muda diariamente)
 * Isso garante que a ordem seja consistente durante o dia, mas mude no dia seguinte
 */
function getDailySeed(): number {
  const today = new Date()
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
  let hash = 0
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Gera uma seed baseada no ID do usuário (se disponível) ou sessão
 * Usa localStorage para persistir preferências do usuário
 */
function getUserSeed(): number {
  if (typeof window === 'undefined') return 0
  
  // Tentar obter seed do usuário do localStorage
  const storedSeed = localStorage.getItem('user_product_seed')
  if (storedSeed) {
    return parseInt(storedSeed, 10)
  }
  
  // Gerar nova seed baseada em timestamp e armazenar
  const newSeed = Date.now() % 1000000
  localStorage.setItem('user_product_seed', newSeed.toString())
  return newSeed
}

/**
 * Algoritmo de Fisher-Yates para embaralhar array de forma determinística
 */
function deterministicShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array]
  let currentSeed = seed
  
  // Gerador de números pseudo-aleatórios simples baseado em seed
  const random = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280
    return currentSeed / 233280
  }
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

/**
 * Calcula um score de relevância para um produto baseado em múltiplos fatores
 */
function calculateProductScore(product: Product, userPreferences?: {
  preferredCategories?: string[]
  preferredBrands?: string[]
  priceRange?: { min: number; max: number }
}): number {
  let score = 0
  
  // Produtos em destaque têm maior prioridade
  if (product.featured) {
    score += 50
  }
  
  // Produtos em promoção têm boa prioridade
  if (product.on_sale) {
    score += 30
  }
  
  // Produtos com estoque têm prioridade sobre esgotados
  const stock = product.stock
  if (typeof stock === 'number') {
    if (stock > 0) {
      score += 20
    } else {
      score -= 50 // Penalizar produtos esgotados
    }
  } else {
    // Se não tem informação de estoque, assumir que está disponível
    score += 10
  }
  
  // Preferências do usuário (se disponíveis)
  if (userPreferences) {
    if (product.category && userPreferences.preferredCategories?.includes(product.category)) {
      score += 40
    }
    
    if (product.brand && userPreferences.preferredBrands?.includes(product.brand)) {
      score += 30
    }
    
    // Preferência por faixa de preço
    if (userPreferences.priceRange && product.price) {
      const price = parseFloat(product.price.replace(/[^\d,]/g, '').replace(',', '.'))
      if (price >= userPreferences.priceRange.min && price <= userPreferences.priceRange.max) {
        score += 25
      }
    }
  }
  
  return score
}

/**
 * Obtém preferências do usuário baseadas em histórico de visualizações
 */
function getUserPreferences(): {
  preferredCategories?: string[]
  preferredBrands?: string[]
  priceRange?: { min: number; max: number }
} {
  if (typeof window === 'undefined') return {}
  
  const viewedProducts = localStorage.getItem('viewed_products')
  if (!viewedProducts) return {}
  
  try {
    const products: Product[] = JSON.parse(viewedProducts)
    
    // Contar categorias mais visualizadas
    const categoryCount: { [key: string]: number } = {}
    const brandCount: { [key: string]: number } = {}
    const prices: number[] = []
    
    products.forEach(product => {
      if (product.category) {
        categoryCount[product.category] = (categoryCount[product.category] || 0) + 1
      }
      if (product.brand) {
        brandCount[product.brand] = (brandCount[product.brand] || 0) + 1
      }
      if (product.price) {
        const price = parseFloat(product.price.replace(/[^\d,]/g, '').replace(',', '.'))
        if (!isNaN(price)) prices.push(price)
      }
    })
    
    // Top 3 categorias mais visualizadas
    const preferredCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category)
    
    // Top 3 marcas mais visualizadas
    const preferredBrands = Object.entries(brandCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([brand]) => brand)
    
    // Faixa de preço médio (média ± 30%)
    let priceRange: { min: number; max: number } | undefined
    if (prices.length > 0) {
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
      priceRange = {
        min: avgPrice * 0.7,
        max: avgPrice * 1.3
      }
    }
    
    return {
      preferredCategories: preferredCategories.length > 0 ? preferredCategories : undefined,
      preferredBrands: preferredBrands.length > 0 ? preferredBrands : undefined,
      priceRange
    }
  } catch (e) {
    console.error('Erro ao processar preferências do usuário:', e)
    return {}
  }
}

/**
 * Ordena produtos de forma inteligente, garantindo diversidade de categorias
 * e priorizando produtos relevantes para o usuário
 */
export function smartProductSort(products: Product[]): Product[] {
  if (products.length === 0) return []
  
  // Obter preferências do usuário
  const userPreferences = getUserPreferences()
  
  // Calcular scores para todos os produtos
  const productsWithScores = products.map(product => ({
    product,
    score: calculateProductScore(product, userPreferences)
  }))
  
  // Agrupar por categoria
  const categoryGroups: { [key: string]: typeof productsWithScores } = {}
  productsWithScores.forEach(({ product, score }) => {
    const category = product.category || 'Outros'
    if (!categoryGroups[category]) {
      categoryGroups[category] = []
    }
    categoryGroups[category].push({ product, score })
  })
  
  // Ordenar produtos dentro de cada categoria por score
  Object.keys(categoryGroups).forEach(category => {
    categoryGroups[category].sort((a, b) => b.score - a.score)
  })
  
  // Intercalar produtos de diferentes categorias para garantir diversidade
  const sortedProducts: Product[] = []
  const categories = Object.keys(categoryGroups)
  
  // Calcular quantos produtos de cada categoria devem aparecer por "rodada"
  const maxPerCategory = Math.ceil(products.length / categories.length)
  
  // Intercalar categorias
  let categoryIndex = 0
  const categoryIndices: { [key: string]: number } = {}
  categories.forEach(cat => { categoryIndices[cat] = 0 })
  
  while (sortedProducts.length < products.length) {
    const category = categories[categoryIndex % categories.length]
    const group = categoryGroups[category]
    const startIndex = categoryIndices[category]
    const endIndex = Math.min(startIndex + maxPerCategory, group.length)
    
    for (let i = startIndex; i < endIndex && sortedProducts.length < products.length; i++) {
      if (group[i]) {
        sortedProducts.push(group[i].product)
        categoryIndices[category] = i + 1
      }
    }
    
    categoryIndex++
    
    // Se todas as categorias foram processadas, resetar
    if (Object.values(categoryIndices).every(idx => idx >= categoryGroups[categories[0]].length)) {
      break
    }
  }
  
  // Adicionar produtos restantes que não foram incluídos na intercalação
  categories.forEach(category => {
    const group = categoryGroups[category]
    const startIndex = categoryIndices[category]
    for (let i = startIndex; i < group.length && sortedProducts.length < products.length; i++) {
      if (!sortedProducts.find(p => p.id === group[i].product.id)) {
        sortedProducts.push(group[i].product)
      }
    }
  })
  
  // Aplicar embaralhamento sutil baseado em seed diária + seed do usuário
  const dailySeed = getDailySeed()
  const userSeed = getUserSeed()
  const combinedSeed = (dailySeed + userSeed) % 1000000
  
  // Embaralhar levemente para adicionar variedade, mas mantendo a ordem geral
  return deterministicShuffle(sortedProducts, combinedSeed)
}

/**
 * Embaralha um array de forma determinística baseado em seed diária
 */
export function shuffleArray<T>(array: T[]): T[] {
  const seed = getDailySeed()
  return deterministicShuffle(array, seed)
}

/**
 * Registra visualização de produto para melhorar recomendações futuras
 */
export function trackProductView(product: Product): void {
  if (typeof window === 'undefined') return
  
  try {
    const viewedProducts = localStorage.getItem('viewed_products')
    const products: Product[] = viewedProducts ? JSON.parse(viewedProducts) : []
    
    // Remover produto se já existe (para evitar duplicatas)
    const filtered = products.filter(p => p.id !== product.id)
    
    // Adicionar no início
    filtered.unshift(product)
    
    // Manter apenas os últimos 50 produtos visualizados
    const limited = filtered.slice(0, 50)
    
    localStorage.setItem('viewed_products', JSON.stringify(limited))
  } catch (e) {
    console.error('Erro ao registrar visualização de produto:', e)
  }
}

