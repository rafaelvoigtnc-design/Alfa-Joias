import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isConnectionError } from '@/lib/errorHandler'

// Edge Runtime para Cloudflare Pages
export const runtime = 'edge'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar produtos:', error.message)
      const connError = isConnectionError(error)
      
      // Se for erro de conexão, retornar mensagem mais amigável
      if (connError.isConnectionError) {
        return NextResponse.json({ 
          success: false, 
          error: connError.friendlyMessage,
          connectionError: true
        }, { status: 503 }) // 503 Service Unavailable para erros de conexão
      }
      
      return NextResponse.json({ 
        success: false, 
        error: connError.friendlyMessage || error.message 
      }, { status: 500 })
    }

    const response = NextResponse.json({ success: true, products: data || [] })
    // Cache por 60 segundos para melhorar performance
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    return response
  } catch (err) {
    console.error('❌ Erro na API de produtos:', err)
    const connError = isConnectionError(err)
    
    return NextResponse.json({ 
      success: false, 
      error: connError.friendlyMessage || (err instanceof Error ? err.message : 'Erro desconhecido'),
      connectionError: connError.isConnectionError
    }, { status: connError.isConnectionError ? 503 : 500 })
  }
}


