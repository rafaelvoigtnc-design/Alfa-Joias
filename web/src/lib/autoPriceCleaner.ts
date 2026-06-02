// Auto Price Cleaner - Limpa dados de preços duplicados/incorretos do localStorage
// Este arquivo é executado automaticamente quando a aplicação é carregada

if (typeof window !== 'undefined') {
  // Limpar dados antigos/corrompidos do localStorage
  const keysToCheck = [
    'alfajoias-products',
    'alfajoias-categories',
    'alfajoias-services',
    'alfajoias-cart'
  ]

  keysToCheck.forEach(key => {
    try {
      const data = localStorage.getItem(key)
      if (data) {
        const parsed = JSON.parse(data)
        
        // Verificar se os dados estão corrompidos
        if (Array.isArray(parsed)) {
          // Limpar produtos com preços duplicados
          if (key === 'alfajoias-products') {
            const cleaned = parsed.filter((item: any) => {
              // Verificar se o item tem estrutura válida
              return item.id && item.name && item.price
            })
            
            if (cleaned.length !== parsed.length) {
              console.log(`🧹 Limpeza automática: ${parsed.length - cleaned.length} produtos inválidos removidos`)
              localStorage.setItem(key, JSON.stringify(cleaned))
            }
          }
        }
      }
    } catch (error) {
      // Se os dados estiverem corrompidos, remover
      console.warn(`⚠️ Dados corrompidos removidos: ${key}`)
      localStorage.removeItem(key)
    }
  })

  console.log('✅ Verificação de dados concluída')
}

export {}





















