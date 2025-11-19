'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

interface CartItem {
  id: string
  name: string
  price: string
  image: string
  quantity: number
  on_sale?: boolean
  original_price?: string
  sale_price?: string
  discount_percentage?: number
}

interface UnifiedAuthContextType {
  // Auth
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData?: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signInWithGoogle: () => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<any>
  resetPassword: (email: string) => Promise<any>
  updatePassword: (newPassword: string) => Promise<any>
  isAdmin: boolean
  isLoggedIn: boolean
  adminLoading: boolean
  
  // Cart
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined)

export function UnifiedAuthProvider({ children }: { children: ReactNode }) {
  // Auth state
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([])
  
  // Flags para evitar múltiplas operações simultâneas
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isCheckingUser, setIsCheckingUser] = useState(false)

  // Salvar carrinho no banco de dados
  const saveCartToDatabase = async (cartData: CartItem[]) => {
    if (!user?.id) return // Só salva se usuário estiver logado
    
    try {
      console.log('💾 Salvando carrinho no banco para usuário:', user.id, 'Itens:', cartData)
      
      const cartDataToSave = {
        user_id: user.id,
        cart_items: cartData,
        updated_at: new Date().toISOString()
      }

      // Verificar se já existe um carrinho para este usuário
      const { data: existingCart } = await supabase
        .from('user_carts')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existingCart) {
        // Atualizar carrinho existente
        const { error: updateError } = await supabase
          .from('user_carts')
          .update(cartDataToSave)
          .eq('user_id', user.id)
        
        if (updateError) {
          console.error('❌ Erro ao atualizar carrinho:', updateError)
        } else {
          console.log('✅ Carrinho atualizado no banco')
        }
      } else {
        // Criar novo carrinho
        const { error: insertError } = await supabase
          .from('user_carts')
          .insert([cartDataToSave])
        
        if (insertError) {
          console.error('❌ Erro ao criar carrinho:', insertError)
        } else {
          console.log('✅ Carrinho criado no banco')
        }
      }
    } catch (error) {
      console.warn('❌ Erro geral ao salvar carrinho no banco:', error)
    }
  }

  // Carregar carrinho do banco de dados
  const loadCartFromDatabase = async () => {
    if (!user?.id) return
    
    try {
      console.log('🔄 Carregando carrinho do banco para usuário:', user.id)
      
      const { data, error } = await supabase
        .from('user_carts')
        .select('cart_items')
        .eq('user_id', user.id)
        .single()

      if (!error && data?.cart_items) {
        setCart(data.cart_items)
        console.log('✅ Carrinho carregado do banco:', data.cart_items)
      } else {
        console.log('ℹ️ Nenhum carrinho encontrado no banco para este usuário')
        // Se não tem carrinho no banco, tentar carregar do localStorage
        const savedCart = localStorage.getItem('alfajoias-cart')
        if (savedCart) {
          try {
            const cartData = JSON.parse(savedCart)
            setCart(cartData)
            console.log('✅ Carrinho carregado do localStorage como fallback:', cartData)
          } catch (parseError) {
            console.error('❌ Erro ao parsear carrinho do localStorage:', parseError)
          }
        }
      }
    } catch (error) {
      console.warn('❌ Erro ao carregar carrinho do banco:', error)
    }
  }


  // Funções auxiliares (declaradas antes dos hooks)
  const ensureUserInDatabase = async (authUser: any) => {
    if (isCheckingUser) return // Evitar múltiplas verificações simultâneas
    
    try {
      setIsCheckingUser(true)
      console.log('🔄 Verificando usuário no banco...', authUser.id)
      
      // Verificar se usuário já existe (com timeout)
      const result = await Promise.race([
        supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]) as any
      
      const { data: existingUser, error: selectError } = result
      
      if (selectError && selectError.message !== 'PGRST116') {
        console.error('❌ Erro ao verificar usuário:', selectError)
        return
      }
      
      if (!existingUser) {
        console.log('🔄 Usuário não existe, criando...')
        
        // Extrair dados do usuário (funciona para Google e email/senha)
        const userData = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || 
                authUser.user_metadata?.full_name || 
                authUser.email?.split('@')[0] || '',
          phone: authUser.user_metadata?.phone || '',
          is_admin: false
        }
        
        // Inserir com timeout
        const insertResult = await Promise.race([
          supabase.from('users').insert([userData]),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]) as any
        
        const { error: insertError } = insertResult
        
        if (insertError) {
          console.error('❌ Erro ao criar usuário:', insertError)
        } else {
          console.log('✅ Usuário criado no banco')
        }
      } else {
        console.log('✓ Usuário já existe no banco')
      }
    } catch (error) {
      console.error('Erro ao garantir usuário no banco:', error)
    } finally {
      setIsCheckingUser(false)
    }
  }

  const checkAdminStatus = async (userId: string) => {
    try {
      console.log('🔍 Verificando status de admin para:', userId)
      setAdminLoading(true)

      // Verificar com timeout para evitar travamentos
      const result = await Promise.race([
        supabase
          .from('users')
          .select('is_admin')
          .eq('id', userId)
          .single(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]) as any

      const { data, error } = result

      if (error) {
        console.warn('⚠️ Erro ao verificar admin status:', error)
        // Tentar novamente após um segundo (sem timeout)
        setTimeout(async () => {
          try {
            const { data: retryData, error: retryError } = await supabase
              .from('users')
              .select('is_admin')
              .eq('id', userId)
              .single()

            if (!retryError && retryData) {
              setIsAdmin(Boolean(retryData.is_admin))
              console.log('✅ Admin status (retry):', retryData.is_admin)
            }
          } catch (e) {
            console.error('❌ Falha na tentativa de verificar admin')
          } finally {
            setAdminLoading(false)
          }
        }, 1000)
      } else {
        setIsAdmin(Boolean(data?.is_admin))
        console.log('✅ Admin status:', data?.is_admin)
      }
    } catch (error) {
      console.error('❌ Timeout ao verificar admin status')
    } finally {
      setAdminLoading(false)
    }
  }

  useEffect(() => {
    // Obter sessão inicial (otimizado)
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Executar verificações em paralelo para melhor performance
          await Promise.all([
            checkAdminStatus(session.user.id),
            ensureUserInDatabase(session.user)
          ])
        }
      } catch (error) {
        console.error('Erro ao obter sessão:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Escutar mudanças na autenticação (otimizado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          const promises = [checkAdminStatus(session.user.id)]

          if (event === 'SIGNED_IN') {
            promises.push(ensureUserInDatabase(session.user))
          }

          await Promise.all(promises)
        } else {
          setIsAdmin(false)
          setAdminLoading(false)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Carregar carrinho do localStorage na inicialização
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading) {
      const savedCart = localStorage.getItem('alfajoias-cart')
      if (savedCart) {
        try {
          const localCart = JSON.parse(savedCart)
          if (localCart && Array.isArray(localCart)) {
            setCart(localCart)
            console.log('✅ Carrinho carregado do localStorage:', localCart.length, 'itens')
          }
        } catch (error) {
          console.error('❌ Erro ao carregar carrinho:', error)
          setCart([])
        }
      }
    }
  }, [loading])

  // Carregar carrinho do banco quando usuário logar
  useEffect(() => {
    if (user?.id && !loading) {
      loadCartFromDatabase()
    }
  }, [user?.id, loading])

  // Salvar carrinho sempre que ele mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Sempre salvar no localStorage
      localStorage.setItem('alfajoias-cart', JSON.stringify(cart))
      
      // Salvar no banco se usuário estiver logado
      if (user?.id && cart.length > 0) {
        saveCartToDatabase(cart)
      }
    }
  }, [cart, user?.id])


  // Auth functions
  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      console.log('🔄 Iniciando cadastro...', { email, userData })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        console.error('❌ Erro no Supabase Auth:', error)
        throw error
      }
      
      console.log('✅ Usuário criado no Auth:', data.user?.id)
      
      // Garantir que o usuário seja inserido na tabela users (fallback se trigger falhar)
      if (data.user) {
        try {
          console.log('🔄 Inserindo usuário na tabela users...')
          
          const { error: insertError } = await supabase
            .from('users')
            .upsert({
              id: data.user.id,
              email: data.user.email,
              name: userData?.name || userData?.full_name || '',
              phone: userData?.phone || '',
              address_street: userData?.address_street || '',
              address_number: userData?.address_number || '',
              address_complement: userData?.address_complement || '',
              address_neighborhood: userData?.address_neighborhood || '',
              address_city: userData?.address_city || '',
              address_state: userData?.address_state || '',
              address_zipcode: userData?.address_zipcode || '',
              is_admin: false
            }, {
              onConflict: 'id'
            })
          
          if (insertError) {
            console.error('❌ Erro ao inserir na tabela users:', insertError)
          } else {
            console.log('✅ Usuário inserido na tabela users')
          }
        } catch (insertError) {
          console.warn('⚠️ Usuário criado no auth mas não inserido na tabela users:', insertError)
        }
      }
      
      return { data, error: null }
    } catch (error: any) {
      console.error('❌ Erro geral no cadastro:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔄 Tentando fazer login...', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('❌ Erro no login:', error)
        
        // Se o erro for de email não confirmado, dar orientação clara
        if (error.message.includes('Email not confirmed')) {
          return { 
            data: null, 
            error: {
              ...error,
              message: 'Email não confirmado. Verifique sua caixa de entrada e spam, ou desabilite a confirmação de email no Supabase (Authentication > Providers > Email > desmarcar "Confirm email").'
            }
          }
        }
        
        throw error
      }
      
      console.log('✅ Login realizado com sucesso')
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      // Importar função dinamicamente para evitar problemas de SSR
      const { getSiteUrl } = await import('@/lib/getSiteUrl')
      const siteUrl = getSiteUrl()
      const redirectTo = `${siteUrl}/auth/callback`
      
      console.log('🔗 URL de redirecionamento Google:', redirectTo)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    if (isLoggingOut) return // Evitar múltiplos logouts simultâneos
    
    try {
      setIsLoggingOut(true)
      console.log('🔄 Fazendo logout...')
      
      // Limpar estados primeiro para resposta mais rápida
      setUser(null)
      setSession(null)
      setIsAdmin(false)
      setCart([])
      
      // Limpar localStorage imediatamente
      if (typeof window !== 'undefined') {
        // Limpar todas as chaves relacionadas ao Supabase
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase') || key.includes('alfajoias')) {
            localStorage.removeItem(key)
          }
        })
      }
      
      // Fazer logout do Supabase em background
      supabase.auth.signOut().catch(console.error)
      
      console.log('✅ Logout realizado com sucesso')
      
      // Redirecionar sem recarregar a página
      if (typeof window !== 'undefined') {
        window.location.replace('/')
      }
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error)
      // Mesmo com erro, limpar estados locais
      setUser(null)
      setSession(null)
      setIsAdmin(false)
      setCart([])
    } finally {
      setIsLoggingOut(false)
    }
  }

  const updateProfile = async (updates: any) => {
    if (!user?.id) {
      const error = new Error('Usuário não autenticado')
      return { data: null, error }
    }

    try {
      // Buscar colunas existentes para evitar erros de colunas ausentes
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      // Se não existir, continuar com conjunto básico de colunas permitidas
      const allowedColumns = fetchError && !existingUser
        ? ['id', 'email', 'name', 'phone', 'updated_at']
        : Array.from(new Set([...(existingUser ? Object.keys(existingUser) : []), 'id', 'updated_at']))

      // Filtrar apenas campos existentes na tabela
      const filteredUpdates = Object.entries(updates || {})
        .filter(([key]) => allowedColumns.includes(key))
        .reduce((acc, [key, value]) => {
          acc[key] = value
          return acc
        }, {} as Record<string, any>)

      // Se nenhum campo válido, não tentar atualizar tabela (evita erro)
      if (Object.keys(filteredUpdates).length === 0) {
        return { data: existingUser || null, error: null }
      }

      filteredUpdates.id = user.id
      filteredUpdates.email = existingUser?.email || user.email || filteredUpdates.email
      filteredUpdates.updated_at = filteredUpdates.updated_at || new Date().toISOString()

      const { data, error } = await supabase
        .from('users')
        .upsert(filteredUpdates, { onConflict: 'id' })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error)
      return { data: null, error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      // Importar função dinamicamente para evitar problemas de SSR
      const { getSiteUrl } = await import('@/lib/getSiteUrl')
      const siteUrl = getSiteUrl()
      const redirectTo = `${siteUrl}/auth/reset-password`
      
      console.log('🔗 URL de redirecionamento reset password:', redirectTo)
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      // Primeiro, verificar se há usuário logado no contexto
      if (!user) {
        console.error('❌ Nenhum usuário logado no contexto')
        return { data: null, error: new Error('Você precisa estar logado para alterar a senha.') }
      }
      
      console.log('🔄 Verificando e atualizando sessão antes de alterar senha...')
      
      // Sempre buscar a sessão mais recente do Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ Erro ao verificar sessão:', sessionError)
        return { data: null, error: new Error('Erro ao verificar sessão. Faça login novamente.') }
      }
      
      if (!sessionData.session) {
        console.error('❌ Nenhuma sessão ativa encontrada')
        return { data: null, error: new Error('Sessão expirada. Por favor, faça login novamente.') }
      }
      
      // Atualizar a sessão no contexto
      setSession(sessionData.session)
      setUser(sessionData.session.user)
      
      console.log('✅ Sessão verificada, tentando atualizar senha...')
      
      // Tentar atualizar a sessão antes de mudar a senha (refresh)
      try {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession(sessionData.session)
        if (!refreshError && refreshData.session) {
          console.log('✅ Sessão atualizada (refresh)')
          setSession(refreshData.session)
          setUser(refreshData.user)
        } else {
          console.warn('⚠️ Não foi possível atualizar a sessão, continuando...')
        }
      } catch (refreshErr) {
        console.warn('⚠️ Erro ao atualizar sessão, continuando...', refreshErr)
      }
      
      // Verificar novamente a sessão antes de atualizar
      const { data: finalSessionData } = await supabase.auth.getSession()
      if (!finalSessionData.session) {
        console.error('❌ Sessão perdida após refresh')
        return { data: null, error: new Error('Sessão expirada. Por favor, faça login novamente.') }
      }
      
      console.log('🔄 Atualizando senha no Supabase...')
      
      // Atualizar a senha - o Supabase usa a sessão atual automaticamente
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) {
        console.error('❌ Erro ao atualizar senha:', error)
        
        // Mensagens de erro mais amigáveis
        let errorMessage = error.message || 'Erro ao atualizar senha'
        
        if (error.message?.includes('same password') || error.message?.includes('mesma senha')) {
          errorMessage = 'A nova senha deve ser diferente da senha atual.'
        } else if (error.message?.includes('weak password') || error.message?.includes('senha fraca')) {
          errorMessage = 'A senha é muito fraca. Use uma senha mais forte (mínimo 6 caracteres).'
        } else if (error.message?.includes('session') || error.message?.includes('Auth session missing')) {
          errorMessage = 'Sessão expirada ou inválida. Por favor, faça logout e login novamente, depois tente alterar a senha.'
        } else if (error.message?.includes('JWT') || error.message?.includes('token')) {
          errorMessage = 'Token de autenticação inválido. Faça login novamente.'
        }
        
        return { data: null, error: new Error(errorMessage) }
      }
      
      console.log('✅ Senha atualizada com sucesso!')
      
      // Atualizar a sessão após mudança de senha
      if ('session' in data && data.session) {
        setSession(data.session)
        setUser(data.user)
      } else if ('user' in data && data.user) {
        // Se não retornou sessão, atualizar apenas o usuário
        setUser(data.user)
      }
      
      return { data, error: null }
    } catch (error: any) {
      console.error('❌ Erro capturado ao atualizar senha:', error)
      const errorMessage = error?.message || 'Erro desconhecido ao atualizar senha'
      return { data: null, error: error instanceof Error ? error : new Error(errorMessage) }
    }
  }

  // Cart functions
  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    // Track no Google Analytics
    if (typeof window !== 'undefined') {
      import('@/lib/analytics').then(({ trackAddToCart }) => {
        const price = parseFloat(item.price.toString().replace(/[^\d.,]/g, '').replace(',', '.'))
        if (!isNaN(price)) {
          trackAddToCart(item.id, item.name, price, 1)
        }
      })
    }
    
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = async () => {
    setCart([])
    
    // Limpar também do banco se usuário estiver logado
    if (user?.id) {
      try {
        await supabase
          .from('user_carts')
          .delete()
          .eq('user_id', user.id)
      } catch (error) {
        console.warn('Erro ao limpar carrinho do banco:', error)
      }
    }
  }

  const value = {
    // Auth
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    isAdmin,
    adminLoading,
    isLoggedIn: !!user,
    
    // Cart
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  )
}

export function useUnifiedAuth() {
  const context = useContext(UnifiedAuthContext)
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider')
  }
  return context
}
