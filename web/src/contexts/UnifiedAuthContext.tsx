'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
// Supabase imports temporarily disabled during Firebase migration
// import { supabase } from '@/lib/supabase'
// import { User, Session } from '@supabase/supabase-js'

// Placeholder types during migration
type User = any
type Session = any

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

      // Temporarily disabled Supabase cart persistence during Firebase migration
      // Cart is now using localStorage
      console.log('⚠️ Carrinho temporariamente usando localStorage durante migração para Firebase')
    } catch (error) {
      console.warn('❌ Erro geral ao salvar carrinho no banco:', error)
    }
  }

  // Carregar carrinho do banco de dados
  const loadCartFromDatabase = async () => {
    if (!user?.id) return

    // Temporarily disabled Supabase cart loading during Firebase migration
    // Cart is now using localStorage
    console.log('⚠️ Carrinho temporariamente usando localStorage durante migração para Firebase')

    try {
      const savedCart = localStorage.getItem('alfajoias-cart')
      if (savedCart) {
        try {
          const cartData = JSON.parse(savedCart)
          setCart(cartData)
          console.log('✅ Carrinho carregado do localStorage:', cartData)
        } catch (parseError) {
          console.error('❌ Erro ao parsear carrinho do localStorage:', parseError)
        }
      }
    } catch (error) {
      console.warn('❌ Erro ao carregar carrinho do localStorage:', error)
    }
  }


  // Funções auxiliares (declaradas antes dos hooks)
  const ensureUserInDatabase = async (authUser: any) => {
    if (isCheckingUser) return // Evitar múltiplas verificações simultâneas

    try {
      setIsCheckingUser(true)
      console.log('⚠️ Verificação de usuário no banco temporariamente desabilitada durante migração para Firebase')
    } catch (error) {
      console.error('Erro ao garantir usuário no banco:', error)
    } finally {
      setIsCheckingUser(false)
    }
  }

  const checkAdminStatus = async (userId: string) => {
    try {
      console.log('⚠️ Verificação de admin status temporariamente desabilitada durante migração para Firebase')
      setAdminLoading(true)
      setIsAdmin(false) // Temporarily disable admin during migration
    } catch (error) {
      console.error('❌ Erro ao verificar admin status:', error)
      setIsAdmin(false)
    } finally {
      setAdminLoading(false)
    }
  }

  useEffect(() => {
    // Obter sessão inicial (não bloqueante - verificações em background)
    // Supabase auth temporarily disabled during Firebase migration
    console.log('⚠️ Supabase auth temporariamente desabilitado durante migração para Firebase')
    setLoading(false)
    setAdminLoading(false)
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

  // Carregar carrinho do banco quando usuário logar (removido - não bloquear carregamento)
  useEffect(() => {
    // Não carregar carrinho do banco automaticamente - isso bloqueia o carregamento
    // Carrinho será carregado apenas quando necessário (na página de carrinho)
  }, [])

  // Salvar carrinho sempre que ele mudar (não bloqueante)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Sempre salvar no localStorage
      localStorage.setItem('alfajoias-cart', JSON.stringify(cart))
      
      // Salvar no banco se usuário estiver logado (em background)
      if (user?.id && cart.length > 0) {
        saveCartToDatabase(cart).catch(err => console.error('Erro ao salvar carrinho:', err))
      }
    }
  }, [cart, user?.id])


  // Auth functions
  const signUp = async (email: string, password: string, userData?: any) => {
    console.log('⚠️ Supabase auth temporariamente desabilitado durante migração para Firebase')
    throw new Error('Auth temporarily disabled during Firebase migration')
  }

  const signIn = async (email: string, password: string) => {
    console.log('⚠️ Supabase auth temporariamente desabilitado durante migração para Firebase')
    throw new Error('Auth temporarily disabled during Firebase migration')
  }

  const signInWithGoogle = async () => {
    console.log('⚠️ Supabase auth temporariamente desabilitado durante migração para Firebase')
    throw new Error('Auth temporarily disabled during Firebase migration')
  }

  const signOut = async () => {
    console.log('⚠️ Supabase auth temporariamente desabilitado durante migração para Firebase')
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

    console.log('✅ Logout realizado com sucesso')

    // Redirecionar sem recarregar a página
    if (typeof window !== 'undefined') {
      window.location.replace('/')
    }
  }

  const updateProfile = async (updates: any) => {
    console.log('⚠️ Supabase profile update temporariamente desabilitado durante migração para Firebase')
    return { data: null, error: new Error('Profile update temporarily disabled during Firebase migration') }
  }

  const resetPassword = async (email: string) => {
    console.log('⚠️ Supabase password reset temporariamente desabilitado durante migração para Firebase')
    return { data: null, error: new Error('Password reset temporarily disabled during Firebase migration') }
  }

  const updatePassword = async (newPassword: string) => {
    console.log('⚠️ Supabase password update temporariamente desabilitado durante migração para Firebase')
    return { data: null, error: new Error('Password update temporarily disabled during Firebase migration') }
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
    // Cart database clearing temporarily disabled during Firebase migration
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
