// Utilitário para limpar preços armazenados no localStorage

export function cleanStoredPrices() {
  if (typeof window === 'undefined') return
  
  try {
    const productsKey = 'alfajoias-products'
    const savedProducts = localStorage.getItem(productsKey)
    
    if (savedProducts) {
      const products = JSON.parse(savedProducts)
      
      // Verificar se os produtos têm estrutura válida
      const cleanedProducts = products.map((product: any) => {
        // Garantir que o preço tem formato correto
        const cleanPrice = (price: string) => {
          if (!price) return 'R$ 0,00'
          // Remove espaços duplicados e formata
          return price.replace(/\s+/g, ' ').trim()
        }
        
        return {
          ...product,
          price: cleanPrice(product.price),
          originalPrice: product.originalPrice ? cleanPrice(product.originalPrice) : undefined,
          salePrice: product.salePrice ? cleanPrice(product.salePrice) : undefined
        }
      })
      
      localStorage.setItem(productsKey, JSON.stringify(cleanedProducts))
    }
  } catch (error) {
    console.error('Erro ao limpar preços:', error)
  }
}
















