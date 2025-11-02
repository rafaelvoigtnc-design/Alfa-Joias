'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erro na autenticação:', error)
          router.push('/login?error=' + encodeURIComponent(error.message))
          return
        }

        if (data.session) {
          // Login bem-sucedido
          router.push('/')
        } else {
          // Sem sessão
          router.push('/login')
        }
      } catch (err) {
        console.error('Erro inesperado:', err)
        router.push('/login?error=Erro inesperado')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Finalizando login...</p>
      </div>
    </div>
  )
}












