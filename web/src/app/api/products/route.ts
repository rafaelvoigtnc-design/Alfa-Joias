import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isConnectionError, withRetry } from '@/lib/errorHandler'

// Edge Runtime para Cloudflare Pages
export const runtime = 'edge'

// Forçar revalidação dinâmica
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {

    // Usar retry automático com backoff exponencial para erros de conexão
    const result = await withRetry(
      async () => {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, category, brand, price, image, description, additional_images, on_sale, original_price, sale_price, discount_percentage, featured, stock, gender, model, created_at, updated_at')
          .order('created_at', { ascending: false })
          .limit(500) // Limitar para melhor performance

        if (error) {
          const connError = isConnectionError(error)
          // Se for erro de conexão, lançar para que withRetry tente novamente
          if (connError.isConnectionError) {
            throw error
          }
          // Se não for erro de conexão, retornar erro direto
          throw new Error(error.message)
        }

        return data || []
      },
      3, // 3 tentativas
      1000 // delay inicial de 1 segundo
    )

    const response = NextResponse.json({ success: true, products: result })
    // Desabilitar cache para sempre retornar dados atualizados
    // Headers adicionais para forçar bypass do cache do Cloudflare/CDN
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('X-Cache-Status', 'BYPASS')
    response.headers.set('CDN-Cache-Control', 'no-cache')
    response.headers.set('Cloudflare-CDN-Cache-Control', 'no-cache')
    return response
  } catch (err) {
    console.error('❌ Erro na API de produtos após retries:', err)
    const connError = isConnectionError(err)
    
    return NextResponse.json({ 
      success: false, 
      error: connError.friendlyMessage || (err instanceof Error ? err.message : 'Erro desconhecido'),
      connectionError: connError.isConnectionError
    }, { status: connError.isConnectionError ? 503 : 500 })
  }
}


