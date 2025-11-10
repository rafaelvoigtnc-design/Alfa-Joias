/**
 * Obtém a URL do site corretamente em qualquer ambiente
 * Prioriza variável de ambiente, depois window.location.origin
 */
export function getSiteUrl(): string {
  // Verificar se há variável de ambiente (tem prioridade)
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  
  if (envUrl && envUrl.trim()) {
    return envUrl.trim()
  }
  
  // No cliente (browser), usar window.location.origin
  if (typeof window !== 'undefined') {
    const origin = window.location.origin
    
    // Se estiver em localhost, ainda assim usar (para desenvolvimento)
    // Mas logar um aviso se a variável de ambiente não estiver configurada
    if (origin.includes('localhost') && !envUrl) {
      console.warn('⚠️ NEXT_PUBLIC_SITE_URL não configurada. Usando localhost. Configure a variável no Cloudflare Pages para produção.')
    }
    
    return origin
  }
  
  // No servidor, usar fallback para produção
  // Isso só acontece durante SSR, então não é crítico
  return 'https://alfa-joias-nc.pages.dev'
}

