// Utilitários para limpar cache e resetar dados do localStorage

export function clearCacheAndReload() {
  if (typeof window === 'undefined') return
  
  // Limpar todo o cache do localStorage relacionado à loja
  const keys = [
    'alfajoias-products',
    'alfajoias-categories-images',
    'alfajoias-banners',
    'alfajoias-brands',
    'alfajoias-services',
    'alfajoias-cart'
  ]
  
  keys.forEach(key => {
    localStorage.removeItem(key)
  })
  
  // Recarregar a página
  window.location.reload()
}

export function resetToDefaults() {
  if (typeof window === 'undefined') return
  
  // Limpar todos os dados
  clearCacheAndReload()
}



















