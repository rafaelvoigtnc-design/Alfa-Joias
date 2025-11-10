'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import { useSimpleAuth } from '@/contexts/SimpleAuthContext'

export default function Login() {
  const router = useRouter()
  const { user, loading: authLoading, signIn, signUp, signInWithGoogle, resetPassword } = useSimpleAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_zipcode: ''
  })
  
  const [forceShowPage, setForceShowPage] = useState(false)

  // Timeout para forçar mostrar a página após 3 segundos
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authLoading) {
        console.log('⏱️ Timeout: Mostrando página mesmo com loading...')
        setForceShowPage(true)
      }
    }, 3000)

    return () => clearTimeout(timeout)
  }, [authLoading])

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (!authLoading && user) {
      console.log('✅ Usuário já está logado, redirecionando...')
      router.push('/')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      if (isLogin) {
        // Login
        const { error } = await signIn(formData.email, formData.password)
        if (error) {
          console.error('Erro no login:', error)
          
          // Traduzir erros comuns
          let errorMessage = error.message
          if (errorMessage.includes('Email not confirmed')) {
            errorMessage = '⚠️ Email não confirmado. Para resolver:\n\n1. Verifique seu email (inclusive spam)\n2. OU desabilite confirmação no Supabase:\n   - Authentication > Providers > Email\n   - Desmarcar "Confirm email"\n   - Salvar e tentar novamente'
          } else if (errorMessage.includes('Invalid login credentials')) {
            errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.'
          }
          
          setError(errorMessage)
        } else {
          setSuccess('Login realizado com sucesso!')
        }
      } else {
        // Cadastro
        if (formData.password !== formData.confirmPassword) {
          setError('Senhas não coincidem!')
          setLoading(false)
          return
        }
        
        if (formData.password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres!')
          setLoading(false)
          return
        }
        
        const { data, error } = await signUp(formData.email, formData.password, {
          name: formData.name,
          full_name: formData.name,
          phone: formData.phone,
          address_street: formData.address_street,
          address_number: formData.address_number,
          address_complement: formData.address_complement,
          address_neighborhood: formData.address_neighborhood,
          address_city: formData.address_city,
          address_state: formData.address_state,
          address_zipcode: formData.address_zipcode
        })
        
        if (error) {
          console.error('Erro no cadastro:', error)
          
          // Traduzir erros comuns
          let errorMessage = error.message
          if (errorMessage.includes('User already registered')) {
            errorMessage = 'Este email já está cadastrado. Faça login ou use outro email.'
          } else if (errorMessage.includes('Password')) {
            errorMessage = 'Senha inválida. Use pelo menos 6 caracteres.'
          } else if (errorMessage.includes('Email')) {
            errorMessage = 'Email inválido. Verifique o formato do email.'
          }
          
          setError(errorMessage)
        } else {
          console.log('✅ Cadastro realizado:', data)
          
          setSuccess('✅ Conta criada com sucesso! Você já pode fazer login.')
          
          // Limpar formulário
          setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            address_street: '',
            address_number: '',
            address_complement: '',
            address_neighborhood: '',
            address_city: '',
            address_state: '',
            address_zipcode: ''
          })
          
          // Mudar para tela de login após 2 segundos
          setTimeout(() => {
            setIsLogin(true)
            setSuccess('')
          }, 2000)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const result = await signInWithGoogle()
      
      if (result.error) {
        console.error('❌ Erro no login Google:', result.error)
        
        // Mensagens de erro mais específicas
        let errorMessage = result.error.message || 'Erro ao fazer login com Google'
        if (errorMessage.includes('redirect_uri_mismatch')) {
          errorMessage = 'Configuração de redirecionamento incorreta. Verifique as configurações do Google OAuth no Supabase.'
        } else if (errorMessage.includes('access_denied')) {
          errorMessage = 'Acesso negado pelo Google. Verifique as permissões da aplicação.'
        } else if (errorMessage.includes('invalid_client')) {
          errorMessage = 'Credenciais do Google inválidas. Verifique Client ID e Secret no Supabase.'
        } else if (errorMessage.includes('OAuth') || errorMessage.includes('provider')) {
          errorMessage = 'Google OAuth não configurado no Supabase. Acesse Authentication > Providers > Google e configure.'
        }
        
        setError(errorMessage)
        setLoading(false)
      } else {
        // Login iniciado com sucesso - o usuário será redirecionado automaticamente
        setSuccess('Redirecionando para o Google...')
        // Não definir loading como false aqui, pois o redirecionamento vai acontecer
      }
    } catch (err: any) {
      console.error('❌ Erro inesperado no login Google:', err)
      setError(err.message || 'Erro inesperado ao fazer login com Google. Verifique se o Google OAuth está configurado no Supabase.')
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Limpar erros quando usuário começar a digitar
    if (error) setError('')
  }

  const handleResetPassword = async () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      setError('Por favor, insira um email válido.')
      return
    }
    
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const { error: resetError } = await resetPassword(resetEmail)
      
      if (resetError) {
        console.error('❌ Erro ao enviar email de recuperação:', resetError)
        let errorMessage = resetError.message || 'Erro ao enviar email de recuperação.'
        
        // Traduzir erros comuns
        if (errorMessage.includes('rate limit')) {
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
        } else if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
          errorMessage = 'Email não encontrado. Verifique se o email está correto.'
        }
        
        setError(errorMessage)
      } else {
        setSuccess('✅ Email de recuperação enviado! Verifique sua caixa de entrada e spam.')
        setResetEmail('')
        setTimeout(() => {
          setShowForgotPassword(false)
          setSuccess('')
        }, 3000)
      }
    } catch (err: any) {
      console.error('❌ Erro ao resetar senha:', err)
      setError(err.message || 'Erro ao enviar email de recuperação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Mostrar loading apenas se ainda estiver carregando E não forçou mostrar
  if (authLoading && !forceShowPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
          <p className="text-xs text-gray-400 mt-2">Aguarde até 3 segundos...</p>
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
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setSuccess('')
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  password: '',
                  confirmPassword: '',
                  address_street: '',
                  address_number: '',
                  address_complement: '',
                  address_neighborhood: '',
                  address_city: '',
                  address_state: '',
                  address_zipcode: ''
                })
              }}
              className="ml-1 font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              {isLogin ? 'Cadastre-se' : 'Faça login'}
            </button>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Nome (apenas no cadastro) */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome completo
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Telefone (apenas no cadastro) */}
            {!isLogin && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required={!isLogin}
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            )}

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={isLogin ? 'Sua senha' : 'Mínimo 6 caracteres'}
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
              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}
            </div>

            {/* Confirmar senha (apenas no cadastro) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar senha
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required={!isLogin}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirme sua senha"
                  />
                </div>
              </div>
            )}

            {/* Campos de Endereço (apenas no cadastro) */}
            {!isLogin && (
              <>
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Endereço para Entrega
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="address_street" className="block text-sm font-medium text-gray-700">
                      Rua/Avenida *
                    </label>
                    <input
                      id="address_street"
                      name="address_street"
                      type="text"
                      required={!isLogin}
                      value={formData.address_street}
                      onChange={handleInputChange}
                      className="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome da rua ou avenida"
                    />
                  </div>

                  <div>
                    <label htmlFor="address_number" className="block text-sm font-medium text-gray-700">
                      Número *
                    </label>
                    <input
                      id="address_number"
                      name="address_number"
                      type="text"
                      required={!isLogin}
                      value={formData.address_number}
                      onChange={handleInputChange}
                      className="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address_complement" className="block text-sm font-medium text-gray-700">
                    Complemento
                  </label>
                  <input
                    id="address_complement"
                    name="address_complement"
                    type="text"
                    value={formData.address_complement}
                    onChange={handleInputChange}
                    className="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Apartamento, bloco, etc. (opcional)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="address_neighborhood" className="block text-sm font-medium text-gray-700">
                      Bairro *
                    </label>
                    <input
                      id="address_neighborhood"
                      name="address_neighborhood"
                      type="text"
                      required={!isLogin}
                      value={formData.address_neighborhood}
                      onChange={handleInputChange}
                      className="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome do bairro"
                    />
                  </div>

                  <div>
                    <label htmlFor="address_city" className="block text-sm font-medium text-gray-700">
                      Cidade *
                    </label>
                    <input
                      id="address_city"
                      name="address_city"
                      type="text"
                      required={!isLogin}
                      value={formData.address_city}
                      onChange={handleInputChange}
                      className="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome da cidade"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="address_state" className="block text-sm font-medium text-gray-700">
                      Estado (UF) *
                    </label>
                    <select
                      id="address_state"
                      name="address_state"
                      required={!isLogin}
                      value={formData.address_state}
                      onChange={handleInputChange}
                      className="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione o estado</option>
                      <option value="AC">Acre</option>
                      <option value="AL">Alagoas</option>
                      <option value="AP">Amapá</option>
                      <option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option>
                      <option value="CE">Ceará</option>
                      <option value="DF">Distrito Federal</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="GO">Goiás</option>
                      <option value="MA">Maranhão</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PA">Pará</option>
                      <option value="PB">Paraíba</option>
                      <option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option>
                      <option value="PI">Piauí</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="RO">Rondônia</option>
                      <option value="RR">Roraima</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option>
                      <option value="SE">Sergipe</option>
                      <option value="TO">Tocantins</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="address_zipcode" className="block text-sm font-medium text-gray-700">
                      CEP *
                    </label>
                    <input
                      id="address_zipcode"
                      name="address_zipcode"
                      type="text"
                      required={!isLogin}
                      value={formData.address_zipcode}
                      onChange={handleInputChange}
                      maxLength={9}
                      className="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </>
            )}

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
                  <span>{isLogin ? 'Entrando...' : 'Criando conta...'}</span>
                </div>
              ) : (
                isLogin ? 'Entrar' : 'Criar conta'
              )}
            </button>

            {/* Divisor */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou continue com</span>
              </div>
            </div>

            {/* Login com Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? 'Carregando...' : 'Continuar com Google'}
            </button>
          </form>
        </div>

        {/* Links adicionais */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Voltar para o site
          </Link>
        </div>
      </div>

      {/* Modal de Recuperação de Senha */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recuperar Senha</h3>
            <p className="text-sm text-gray-600 mb-4">
              Digite seu email para receber um link de recuperação de senha.
            </p>
            
            <div className="mb-4">
              <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md mb-4">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md mb-4">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Link'}
              </button>
              <button
                onClick={() => {
                  setShowForgotPassword(false)
                  setResetEmail('')
                  setError('')
                  setSuccess('')
                }}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



