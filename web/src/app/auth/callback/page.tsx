'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getSiteUrl } from '@/lib/getSiteUrl'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processando callback de autenticação...')
        console.log('📍 URL atual:', window.location.href)
        
        // Verificar se há token na hash (fluxo implícito) ou código na query (fluxo PKCE)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const queryParams = new URLSearchParams(window.location.search)
        
        const accessToken = hashParams.get('access_token')
        const code = queryParams.get('code') || hashParams.get('code')
        const error = queryParams.get('error') || hashParams.get('error')
        const errorDescription = queryParams.get('error_description') || hashParams.get('error_description')

        // Se houver erro na URL (ex: usuário cancelou)
        if (error) {
          console.error('❌ Erro no OAuth:', error, errorDescription)
          router.push(`/login?error=${encodeURIComponent(errorDescription || error)}`)
          return
        }

        // Se houver access_token na hash, o Supabase precisa processar
        if (accessToken) {
          console.log('🔑 Token encontrado na hash, processando...')
          
          // O Supabase processa automaticamente tokens na hash quando a página carrega
          // Mas podemos forçar o processamento esperando um pouco e verificando a sessão
          // Aguardar para o Supabase processar o token da hash
          let sessionCreated = false
          
          // Tentar múltiplas vezes (o Supabase pode demorar para processar)
          for (let attempt = 0; attempt < 5; attempt++) {
            await new Promise(resolve => setTimeout(resolve, attempt === 0 ? 1000 : 500))
            
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
            
            if (sessionData?.session) {
              console.log(`✅ Sessão criada com sucesso via token! (tentativa ${attempt + 1})`)
              
              // Limpar a hash da URL imediatamente
              const cleanUrl = window.location.pathname + (window.location.search || '')
              window.history.replaceState({}, document.title, cleanUrl)
              
              // Garantir que o usuário existe na tabela users
              try {
                const { data: userData, error: userError } = await supabase
                  .from('users')
                  .select('id')
                  .eq('id', sessionData.session.user.id)
                  .single()

                if (userError && userError.code === 'PGRST116') {
                  // Usuário não existe, criar
                  const { error: insertError } = await supabase
                    .from('users')
                    .insert({
                      id: sessionData.session.user.id,
                      email: sessionData.session.user.email,
                      name: sessionData.session.user.user_metadata?.full_name || sessionData.session.user.email?.split('@')[0] || 'Usuário',
                      phone: null,
                    })

                  if (insertError) {
                    console.error('❌ Erro ao criar usuário:', insertError)
                  } else {
                    console.log('✅ Usuário criado na tabela users')
                  }
                }
              } catch (userErr) {
                console.error('❌ Erro ao verificar/criar usuário:', userErr)
              }

              // Redirecionar para a home
              router.push('/')
              sessionCreated = true
              return
            } else if (sessionError) {
              console.warn(`⚠️ Tentativa ${attempt + 1}: Ainda não há sessão. Erro:`, sessionError.message)
            }
          }
          
          if (!sessionCreated) {
            console.error('❌ Não foi possível criar sessão após múltiplas tentativas')
            // Tentar recarregar a página para forçar o processamento do token
            console.log('🔄 Tentando recarregar página para processar token...')
            window.location.reload()
            return
          }
        }

        // Se houver código, trocar por sessão (fluxo PKCE)
        if (code) {
          console.log('🔄 Trocando código OAuth por sessão...')
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error('❌ Erro ao trocar código por sessão:', exchangeError)
            router.push(`/login?error=${encodeURIComponent(exchangeError.message)}`)
            return
          }

          if (data.session) {
            console.log('✅ Login Google realizado com sucesso!')
            
            // Garantir que o usuário existe na tabela users
            try {
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('id', data.session.user.id)
                .single()

              if (userError && userError.code === 'PGRST116') {
                // Usuário não existe, criar
                const { error: insertError } = await supabase
                  .from('users')
                  .insert({
                    id: data.session.user.id,
                    email: data.session.user.email,
                    name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'Usuário',
                    phone: null,
                  })

                if (insertError) {
                  console.error('❌ Erro ao criar usuário:', insertError)
                } else {
                  console.log('✅ Usuário criado na tabela users')
                }
              }
            } catch (userErr) {
              console.error('❌ Erro ao verificar/criar usuário:', userErr)
            }

            // Redirecionar para a home
            router.push('/')
            return
          }
        }

        // Se não há código nem token, tentar obter sessão existente
        console.log('⚠️ Nenhum código ou token encontrado, verificando sessão existente...')
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionData?.session) {
          console.log('✅ Sessão existente encontrada, redirecionando...')
          router.push('/')
          return
        }

        // Sem código, token ou sessão, redirecionar para login
        console.warn('⚠️ Nenhuma autorização encontrada')
        router.push('/login?error=Autorização não encontrada. Tente fazer login novamente.')
        
      } catch (err: any) {
        console.error('❌ Erro inesperado no callback:', err)
        router.push(`/login?error=${encodeURIComponent(err.message || 'Erro inesperado')}`)
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {errorMessage ? `Erro: ${errorMessage}` : 'Finalizando login...'}
        </p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}












