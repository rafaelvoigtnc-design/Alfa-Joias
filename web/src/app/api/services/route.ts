import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isConnectionError, withRetry } from '@/lib/errorHandler'

// Edge Runtime para Cloudflare Pages
export const runtime = 'edge'

// Cache otimizado para carregamento instantâneo
export const revalidate = 300 // 5 minutos

export async function GET() {
  try {

    // Usar retry automático com backoff exponencial para erros de conexão
    const result = await withRetry(
      async () => {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false })

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

    const response = NextResponse.json({
      success: true,
      services: result
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    })
    // Cache otimizado: 60 segundos no cliente, 60 segundos no CDN
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=300')
    return response

  } catch (error) {
    console.error('❌ Erro na API de serviços após retries:', error)
    const connError = isConnectionError(error)
    
    return NextResponse.json({
      success: false,
      error: connError.friendlyMessage || (error instanceof Error ? error.message : 'Erro desconhecido'),
      connectionError: connError.isConnectionError
    }, { 
      status: connError.isConnectionError ? 503 : 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('📥 API POST - Body recebido:', JSON.stringify(body, null, 2))
    
    const { title, description, features, whatsappMessage, whatsapp_message, icon } = body

    // Aceitar tanto whatsappMessage quanto whatsapp_message
    const whatsappMsg = whatsapp_message || whatsappMessage || ''

    console.log('➕ Criando novo serviço no banco:', { 
      title, 
      description, 
      features,
      whatsapp_message: whatsappMsg, 
      icon,
      'whatsapp_message presente?': !!whatsapp_message,
      'whatsappMessage presente?': !!whatsappMessage,
      'icon presente?': !!icon
    })

    // Validar dados obrigatórios
    if (!title || !description) {
      return NextResponse.json({
        success: false,
        error: 'Título e descrição são obrigatórios'
      }, { 
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      })
    }

    const insertData = {
      title,
      description,
      features: features || [],
      whatsapp_message: whatsappMsg,
      icon: icon || 'wrench'
    }
    
    console.log('💾 Dados que serão inseridos no banco:', JSON.stringify(insertData, null, 2))
    
    const { data, error } = await supabase
      .from('services')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar serviço:', error.message)
      console.error('❌ Detalhes do erro:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      })
    }

    console.log('✅ Serviço criado com sucesso no banco:', data.id)
    console.log('✅ Dados salvos no banco:', JSON.stringify(data, null, 2))
    
    return NextResponse.json({
      success: true,
      message: 'Serviço adicionado com sucesso',
      service: data
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    })

  } catch (error) {
    console.error('❌ Erro na criação do serviço:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    console.log('📥 API PUT - Body recebido:', JSON.stringify(body, null, 2))
    
    const { id, title, description, features, whatsappMessage, whatsapp_message, icon, active } = body

    // Aceitar tanto whatsappMessage quanto whatsapp_message
    const whatsappMsg = whatsapp_message || whatsappMessage || ''

    console.log('✏️ Editando serviço no banco:', { 
      id, 
      title, 
      description, 
      features,
      whatsapp_message: whatsappMsg, 
      icon,
      'whatsapp_message presente?': !!whatsapp_message,
      'whatsappMessage presente?': !!whatsappMessage,
      'icon presente?': !!icon
    })

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID do serviço é obrigatório'
      }, { 
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      })
    }

    const updateData = {
      title,
      description,
      features: features || [],
      whatsapp_message: whatsappMsg,
      icon: icon || 'wrench',
      updated_at: new Date().toISOString()
    }
    
    console.log('💾 Dados que serão salvos no banco:', JSON.stringify(updateData, null, 2))
    
    // Atualizar no banco
    const { error: updateError } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      console.error('❌ Erro ao editar serviço:', updateError.message)
      console.error('❌ Detalhes do erro:', updateError)
      return NextResponse.json({
        success: false,
        error: updateError.message
      }, { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      })
    }

    // Buscar dados atualizados do banco para garantir que retornamos os dados corretos
    const { data, error: selectError } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single()

    if (selectError) {
      console.error('❌ Erro ao buscar serviço atualizado:', selectError.message)
      return NextResponse.json({
        success: false,
        error: selectError.message
      }, { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      })
    }

    console.log('✅ Serviço editado com sucesso no banco:', data.id)
    console.log('✅ Dados salvos no banco:', JSON.stringify(data, null, 2))
    console.log('✅ WhatsApp message no banco:', data.whatsapp_message)
    console.log('✅ Icon no banco:', data.icon)
    
    return NextResponse.json({
      success: true,
      message: 'Serviço editado com sucesso',
      service: data
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    })

  } catch (error) {
    console.error('❌ Erro na edição do serviço:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    })
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    console.log('🗑️ Excluindo serviço do banco:', id)

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID do serviço é obrigatório'
      }, { 
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      })
    }

    const { data, error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao excluir serviço:', error.message)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      })
    }

    console.log('✅ Serviço excluído com sucesso do banco:', id)
    
    return NextResponse.json({
      success: true,
      message: 'Serviço excluído com sucesso',
      service: data
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    })

  } catch (error) {
    console.error('❌ Erro na exclusão do serviço:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    })
  }
}





