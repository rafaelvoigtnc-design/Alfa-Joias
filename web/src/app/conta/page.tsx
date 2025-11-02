'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext'
import { supabase } from '@/lib/supabase'
import { User, Mail, Phone, MapPin, Edit, Save, X, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Settings, Shield } from 'lucide-react'

export default function Account() {
  const router = useRouter()
  const { user, loading: authLoading, updatePassword, updateProfile, isAdmin } = useUnifiedAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || user?.email || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_zipcode: ''
  })
  const [userDataLoading, setUserDataLoading] = useState(true)
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

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('❌ Usuário não está logado, redirecionando para login...')
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Carregar dados do usuário incluindo endereço
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.email) {
        try {
          setUserDataLoading(true)
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single()

          if (!error && data) {
            setFormData({
              name: data.name || user?.user_metadata?.full_name || user?.email || '',
              email: user.email || '',
              phone: data.phone || user?.user_metadata?.phone || '',
              address_street: data.address_street || '',
              address_number: data.address_number || '',
              address_complement: data.address_complement || '',
              address_neighborhood: data.address_neighborhood || '',
              address_city: data.address_city || '',
              address_state: data.address_state || '',
              address_zipcode: data.address_zipcode || ''
            })
          }
        } catch (err) {
          console.error('Erro ao carregar dados do usuário:', err)
        } finally {
          setUserDataLoading(false)
        }
      }
    }

    loadUserData()
  }, [user?.email])

  const handleSave = async () => {
    if (!user?.id) return
    
    try {
      const updates = {
        name: formData.name,
        phone: formData.phone,
        address_street: formData.address_street,
        address_number: formData.address_number,
        address_complement: formData.address_complement,
        address_neighborhood: formData.address_neighborhood,
        address_city: formData.address_city,
        address_state: formData.address_state,
        address_zipcode: formData.address_zipcode,
        updated_at: new Date().toISOString()
      }

      const { error } = await updateProfile(updates)
      if (error) {
        alert('Erro ao salvar dados: ' + error.message)
      } else {
        setIsEditing(false)
        // Atualizar também no user_metadata do auth
        await supabase.auth.updateUser({
          data: {
            full_name: formData.name,
            phone: formData.phone
          }
        })
      }
    } catch (err: any) {
      alert('Erro ao salvar dados: ' + (err.message || 'Erro desconhecido'))
    }
  }

  const handleCancel = () => {
    // Recarregar dados do banco ao cancelar
    if (user?.email) {
      supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setFormData({
              name: data.name || user?.user_metadata?.full_name || user?.email || '',
              email: user.email || '',
              phone: data.phone || user?.user_metadata?.phone || '',
              address_street: data.address_street || '',
              address_number: data.address_number || '',
              address_complement: data.address_complement || '',
              address_neighborhood: data.address_neighborhood || '',
              address_city: data.address_city || '',
              address_state: data.address_state || '',
              address_zipcode: data.address_zipcode || ''
            })
          }
        })
    }
    setIsEditing(false)
  }

  const handlePasswordUpdate = async () => {
    setPasswordError('')
    setPasswordSuccess('')
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres')
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('As senhas não coincidem')
      return
    }
    
    setPasswordLoading(true)
    
    try {
      const { error } = await updatePassword(passwordData.newPassword)
      if (error) {
        setPasswordError(error.message)
      } else {
        setPasswordSuccess('Senha atualizada com sucesso!')
        setPasswordData({ newPassword: '', confirmPassword: '' })
        setTimeout(() => {
          setShowPasswordSection(false)
          setPasswordSuccess('')
        }, 2000)
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Erro ao atualizar senha')
    } finally {
      setPasswordLoading(false)
    }
  }

  // Mostrar loading apenas se ainda estiver carregando E não forçou mostrar
  if (authLoading && !forceShowPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sua conta...</p>
          <p className="text-xs text-gray-400 mt-2">Aguarde até 3 segundos...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Faça login para acessar sua conta</h1>
          <p className="text-gray-600 mb-6">Você precisa estar logado para acessar esta página.</p>
          <a
            href="/login"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Fazer Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Minha Conta</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Informações Pessoais</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Editar</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome completo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{user.user_metadata?.full_name || user.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.phone || user.user_metadata?.phone || 'Não informado'}</p>
                  )}
                </div>

                {/* Campos de Endereço */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-gray-600" />
                    Endereço para Entrega
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rua/Avenida
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.address_street}
                          onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Nome da rua ou avenida"
                        />
                      ) : (
                        <p className="text-gray-900">{formData.address_street || 'Não informado'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.address_number}
                          onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="123"
                        />
                      ) : (
                        <p className="text-gray-900">{formData.address_number || 'Não informado'}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Complemento
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.address_complement}
                        onChange={(e) => setFormData({ ...formData, address_complement: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Apartamento, bloco, etc."
                      />
                    ) : (
                      <p className="text-gray-900">{formData.address_complement || 'Não informado'}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bairro
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.address_neighborhood}
                          onChange={(e) => setFormData({ ...formData, address_neighborhood: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Nome do bairro"
                        />
                      ) : (
                        <p className="text-gray-900">{formData.address_neighborhood || 'Não informado'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.address_city}
                          onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Nome da cidade"
                        />
                      ) : (
                        <p className="text-gray-900">{formData.address_city || 'Não informado'}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado (UF)
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.address_state}
                          onChange={(e) => setFormData({ ...formData, address_state: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                      ) : (
                        <p className="text-gray-900">{formData.address_state || 'Não informado'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CEP
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          maxLength={9}
                          value={formData.address_zipcode}
                          onChange={(e) => setFormData({ ...formData, address_zipcode: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="00000-000"
                        />
                      ) : (
                        <p className="text-gray-900">{formData.address_zipcode || 'Não informado'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>Salvar</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Seção de Senha */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Segurança</h2>
              </div>

              {!showPasswordSection ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    {user.app_metadata?.provider === 'google' 
                      ? 'Você entrou com o Google. Defina uma senha para poder fazer login com email/senha também.'
                      : 'Altere sua senha regularmente para manter sua conta segura.'}
                  </p>
                  <button
                    onClick={() => setShowPasswordSection(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Lock className="h-4 w-4" />
                    <span>{user.app_metadata?.provider === 'google' ? 'Definir Senha' : 'Alterar Senha'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                  {passwordError && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-sm">{passwordError}</span>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm">{passwordSuccess}</span>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handlePasswordUpdate}
                      disabled={passwordLoading}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4" />
                      <span>{passwordLoading ? 'Salvando...' : 'Salvar Senha'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordSection(false)
                        setPasswordData({ newPassword: '', confirmPassword: '' })
                        setPasswordError('')
                        setPasswordSuccess('')
                      }}
                      disabled={passwordLoading}
                      className="flex items-center space-x-2 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              
              <div className="space-y-3">
                {isAdmin && (
                  <a
                    href="/admin"
                    className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-center"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Painel Admin</span>
                    </div>
                  </a>
                )}
                <a
                  href="/carrinho"
                  className="block w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-center"
                >
                  Ver Carrinho
                </a>
                <a
                  href="/pedidos"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors text-center"
                >
                  Meus Pedidos
                </a>
                <a
                  href="/produtos"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors text-center"
                >
                  Ver Produtos
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

