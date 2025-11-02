import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isConnectionError } from '@/lib/errorHandler'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar serviços:', error.message)
      const connError = isConnectionError(error)
      
      return NextResponse.json({
        success: false,
        error: connError.friendlyMessage || error.message,
        connectionError: connError.isConnectionError
      }, { 
        status: connError.isConnectionError ? 503 : 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      })
    }

    const response = NextResponse.json({
      success: true,
      services: data || []
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    })
    // Cache por 60 segundos para melhorar performance
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    return response

  } catch (error) {
    console.error('❌ Erro na API de serviços:', error)
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
    const { title, description, features, whatsappMessage, icon } = body

    console.log('➕ Criando novo serviço no banco:', { title, description })

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

    const { data, error } = await supabase
      .from('services')
      .insert([
        {
          title,
          description,
          features: features || [],
          whatsapp_message: whatsappMessage || ''
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar serviço:', error.message)
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
    const { id, title, description, features, whatsappMessage, icon, active } = body

    console.log('✏️ Editando serviço no banco:', { id, title, description })

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
      .update({
        title,
        description,
        features: features || [],
        whatsapp_message: whatsappMessage || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao editar serviço:', error.message)
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

    console.log('✅ Serviço editado com sucesso no banco:', data.id)
    
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





