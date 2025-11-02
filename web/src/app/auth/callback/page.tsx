'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Obter o código de autorização da URL
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        // Se houver erro na URL (ex: usuário cancelou)
        if (error) {
          console.error('Erro no OAuth:', error, errorDescription)
          router.push(`/login?error=${encodeURIComponent(errorDescription || error)}`)
          return
        }

        // Se não houver código, pode ser que já tenha sessão ou precisa fazer login novamente
        if (!code) {
          // Tentar obter sessão existente
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionData?.session) {
            console.log('✅ Sessão encontrada, redirecionando...')
            router.push('/')
            return
          }

          // Sem código e sem sessão, redirecionar para login
          console.warn('⚠️ Sem código de autorização na URL')
          router.push('/login?error=Autorização não encontrada. Tente fazer login novamente.')
          return
        }

        // Trocar o código por uma sessão
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
        } else {
          console.error('❌ Nenhuma sessão recebida')
          router.push('/login?error=Erro ao criar sessão. Tente novamente.')
        }
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












