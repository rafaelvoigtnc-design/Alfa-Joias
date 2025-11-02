'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export default function ResetPassword() {
  const router = useRouter()
  const { updatePassword, signOut } = useUnifiedAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  // Verificar e processar o token da URL
  useEffect(() => {
    let isMounted = true
    
    const verifyToken = async () => {
      try {
        // Aguardar menos tempo - apenas para DOM carregar
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (!isMounted) return
        
        // Verificar se há um hash na URL (token de recuperação)
        const hash = window.location.hash
        logger.debug('Hash da URL', { hasHash: !!hash })
        
        if (hash && hash.includes('access_token')) {
          const hashParams = new URLSearchParams(hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')
          const type = hashParams.get('type')
          
          logger.debug('Tokens recebidos', {
            accessToken: !!accessToken,
            refreshToken: !!refreshToken,
            type
          })
          
          if (type === 'recovery' && accessToken) {
            try {
              // Estabelecer a sessão com o token com timeout de 15 segundos
              logger.info('Estabelecendo sessão com o token...')
              
              const sessionPromise = supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
              })
              
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('TIMEOUT')), 15000)
              )
              
              const result = await Promise.race([sessionPromise, timeoutPromise]) as any
              
              if (result.error) {
                logger.error('Erro ao estabelecer sessão', result.error)
                setError('Erro ao processar token. Solicite um novo link de recuperação.')
                setVerifying(false)
              } else {
                logger.success('Sessão estabelecida com sucesso!')
                setVerifying(false)
              }
            } catch (err: any) {
              logger.error('Erro ao processar token', err)
              if (err.message === 'TIMEOUT') {
                setError('⏱️ Servidor não respondeu a tempo. Verifique sua conexão e tente novamente.')
              } else {
                setError('Erro ao processar link. Solicite um novo link de recuperação.')
              }
              setVerifying(false)
            }
          } else {
            setError('Link inválido. Solicite um novo link de recuperação.')
            setVerifying(false)
          }
        } else {
          setError('Link inválido ou expirado. Solicite um novo link de recuperação.')
          setVerifying(false)
        }
      } catch (err) {
        logger.error('Erro ao verificar token', err)
        setError('Erro ao processar link de recuperação')
        setVerifying(false)
      }
    }

    // Timeout de segurança
    const timeout = setTimeout(() => {
      if (isMounted && verifying) {
        setError('⏱️ Verificação demorou muito. Verifique sua conexão e tente novamente.')
        setVerifying(false)
      }
    }, 20000)

    verifyToken()
    
    return () => {
      isMounted = false
      clearTimeout(timeout)
    }
  }, [verifying])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validações
    if (passwords.newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    // Verificar se Supabase está configurado
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes('exemplo')

    if (!isSupabaseConfigured) {
      setError('⚠️ Supabase não configurado! Configure o Supabase no arquivo .env.local para usar recuperação de senha.')
      setLoading(false)
      return
    }

    try {
      logger.info('Atualizando senha no Supabase...')
      
      // Criar promise com timeout de 15 segundos
      const updatePromise = supabase.auth.updateUser({ 
        password: passwords.newPassword 
      })
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), 15000)
      )
      
      const result = await Promise.race([updatePromise, timeoutPromise]) as any
      
      if (result.error) {
        logger.error('Erro retornado pelo Supabase', result.error)
        
        // Mensagens de erro mais amigáveis
        let errorMsg = result.error.message
        if (errorMsg.includes('Token') || errorMsg.includes('JWT')) {
          errorMsg = 'Link expirado ou inválido. Solicite um novo link de recuperação.'
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
          errorMsg = 'Erro de conexão. Verifique sua internet e tente novamente.'
        }
        
        setError(errorMsg)
        setLoading(false)
      } else {
        logger.success('Senha atualizada com sucesso!')
        setSuccess('✅ Senha redefinida com sucesso! Fazendo logout...')
        
        // Fazer logout para limpar a sessão e forçar novo login
        setTimeout(async () => {
          await signOut()
          logger.info('Logout realizado, redirecionando para login...')
          router.push('/login')
        }, 1500)
        
        setLoading(false)
      }
    } catch (err: any) {
      logger.error('Erro capturado', err)
      
      if (err.message === 'TIMEOUT') {
        setError('⏱️ Servidor não respondeu a tempo (15s).\n\n💡 Possíveis causas:\n• Internet lenta\n• Link expirado (válido por 1 hora)\n• Supabase não configurado corretamente\n\n📋 Solução: Verifique sua internet e tente novamente, ou solicite um novo link.')
      } else {
        setError(err.message || 'Erro ao redefinir senha. Tente novamente.')
      }
      
      setLoading(false)
    }
  }

  // Tela de verificação
  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando link de recuperação...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-semibold tracking-tight text-gray-800">Alfa Jóias</span>
          </Link>
          <h2 className="mt-6 text-3xl font-light text-gray-900">
            Redefinir Senha
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Digite sua nova senha abaixo
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Nova Senha */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Nova Senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Nova Senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirme sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Mensagens de erro/sucesso */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Botão de submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Redefinindo...</span>
                </div>
              ) : (
                'Redefinir Senha'
              )}
            </button>
          </form>
        </div>

        {/* Links adicionais */}
        <div className="text-center space-y-2">
          <Link
            href="/login"
            className="block text-sm text-blue-600 hover:text-blue-500 transition-colors"
          >
            Voltar para o login
          </Link>
          <Link
            href="/"
            className="block text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  )
}

