/**
 * Algoritmo de ordenação inteligente de produtos
 * 
 * Este algoritmo embaralha produtos de forma inteligente para:
 * - Mostrar variedade de categorias
 * - Priorizar produtos que o cliente pode gostar
 * - Manter diversidade visual
 */

export interface Product {
  id: string
  name: string
  category: string
  brand: string
  price: string
  image: string
  description?: string
  featured?: boolean
  on_sale?: boolean
  stock?: number
  gender?: string
  model?: string
  created_at?: string
  [key: string]: any // Permitir campos adicionais
}

/**
 * Embaralha array usando Fisher-Yates (algoritmo justo)
 */
function shuffleArray<T>(array: T[], seed?: number): T[] {
  const shuffled = [...array]
  
  // Se houver seed, usar para gerar ordem determinística mas variada
  let random = seed !== undefined 
    ? (() => {
        let value = seed
        return () => {
          value = (value * 9301 + 49297) % 233280
          return value / 233280
        }
      })()
    : Math.random
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

/**
 * Calcula score de relevância do produto para o cliente
 * Baseado em múltiplos fatores
 */
function calculateProductScore(product: Product, userPreferences?: {
  preferredCategories?: string[]
  preferredBrands?: string[]
  priceRange?: { min: number; max: number }
}): number {
  let score = 0
  
  // Produtos em destaque têm prioridade
  if (product.featured) score += 10
  
  // Produtos em promoção têm prioridade
  if (product.on_sale) score += 8
  
  // Produtos em estoque têm prioridade
  const stock = product.stock || 0
  if (stock > 0) score += 5
  if (stock === 0) score -= 5 // Penalizar produtos sem estoque
  
  // Preferências do usuário (se disponíveis)
  if (userPreferences) {
    if (userPreferences.preferredCategories?.includes(product.category)) {
      score += 15
    }
    if (userPreferences.preferredBrands?.includes(product.brand)) {
      score += 12
    }
    if (userPreferences.priceRange) {
      const price = parseFloat(product.price.replace(/[^\d,]/g, '').replace(',', '.')) || 0
      if (price >= userPreferences.priceRange.min && price <= userPreferences.priceRange.max) {
        score += 10
      }
    }
  }
  
  // Produtos mais recentes têm pequena vantagem (mas não dominante)
  if (product.created_at) {
    const daysSinceCreation = (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24)
    score += Math.max(0, 5 - daysSinceCreation / 30) // Decai ao longo de 30 dias
  }
  
  return score
}

/**
 * Ordena produtos de forma inteligente
 * Garante diversidade de categorias e relevância
 */
export function smartSortProducts(
  products: Product[],
  userPreferences?: {
    preferredCategories?: string[]
    preferredBrands?: string[]
    priceRange?: { min: number; max: number }
  }
): Product[] {
  if (products.length === 0) return []
  
  // 1. Separar produtos por categoria
  const productsByCategory: { [key: string]: Product[] } = {}
  products.forEach(product => {
    const category = product.category || 'Outros'
    if (!productsByCategory[category]) {
      productsByCategory[category] = []
    }
    productsByCategory[category].push(product)
  })
  
  // 2. Ordenar produtos dentro de cada categoria por score
  Object.keys(productsByCategory).forEach(category => {
    productsByCategory[category] = productsByCategory[category].sort((a, b) => {
      const scoreA = calculateProductScore(a, userPreferences)
      const scoreB = calculateProductScore(b, userPreferences)
      return scoreB - scoreA // Maior score primeiro
    })
  })
  
  // 3. Intercalar produtos de diferentes categorias
  // Garantir que sempre mostre um pouco de cada categoria
  const sortedProducts: Product[] = []
  const categories = Object.keys(productsByCategory)
  const maxPerCategory = Math.ceil(products.length / categories.length) + 2 // Um pouco mais para garantir variedade
  
  // Embaralhar ordem das categorias para variar
  const shuffledCategories = shuffleArray(categories, Date.now() % 1000)
  
  // Intercalar produtos de cada categoria
  let currentIndex = 0
  while (sortedProducts.length < products.length) {
    let addedInRound = false
    
    for (const category of shuffledCategories) {
      const categoryProducts = productsByCategory[category]
      if (categoryProducts.length > currentIndex) {
        sortedProducts.push(categoryProducts[currentIndex])
        addedInRound = true
      }
    }
    
    if (!addedInRound) break // Não há mais produtos para adicionar
    currentIndex++
    
    // Limite por categoria para evitar dominância
    if (currentIndex >= maxPerCategory) {
      // Adicionar produtos restantes embaralhados
      const remaining: Product[] = []
      shuffledCategories.forEach(category => {
        const categoryProducts = productsByCategory[category]
        if (categoryProducts.length > currentIndex) {
          remaining.push(...categoryProducts.slice(currentIndex))
        }
      })
      sortedProducts.push(...shuffleArray(remaining))
      break
    }
  }
  
  // 4. Aplicar pequeno embaralhamento final para variar ainda mais
  // Mas mantendo a estrutura de diversidade de categorias
  const finalShuffled: Product[] = []
  const chunkSize = Math.max(4, Math.floor(sortedProducts.length / categories.length))
  
  for (let i = 0; i < sortedProducts.length; i += chunkSize) {
    const chunk = sortedProducts.slice(i, i + chunkSize)
    finalShuffled.push(...shuffleArray(chunk, i))
  }
  
  return finalShuffled
}

/**
 * Embaralha marcas de forma aleatória mas determinística por sessão
 */
export function shuffleBrands<T extends { id: string; name: string }>(brands: T[]): T[] {
  if (brands.length === 0) return []
  
  // Usar timestamp do dia atual como seed para variar diariamente
  const today = new Date()
  const daySeed = Math.floor(today.getTime() / (1000 * 60 * 60 * 24))
  
  return shuffleArray(brands, daySeed)
}

