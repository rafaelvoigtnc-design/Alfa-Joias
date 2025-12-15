import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isConnectionError, withRetry } from '@/lib/errorHandler'

// Edge Runtime para Cloudflare Pages
export const runtime = 'edge'

// Cache otimizado: revalidar a cada 60 segundos para melhor performance
export const dynamic = 'force-dynamic'
export const revalidate = 60

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
      2, // Reduzido para 2 tentativas (mais rápido)
      500 // delay inicial reduzido para 500ms (mais rápido)
    )

    const response = NextResponse.json({ success: true, products: result })
    // Cache otimizado: 60 segundos no cliente, 60 segundos no CDN, stale-while-revalidate de 120s
    // Isso melhora muito a performance - dados podem ser servidos do cache enquanto atualiza em background
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=60')
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


