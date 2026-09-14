'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  on_sale?: boolean
  original_price?: number
  sale_price?: number
  discount_percentage?: number
}

interface FirebaseAuthContextType {
  // Auth
  user: FirebaseUser | null
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

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined)

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null)
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
    if (!user?.uid) return
    
    try {
      console.log('💾 Salvando carrinho no Firebase para usuário:', user.uid)
      
      const cartDataToSave = {
        userId: user.uid,
        cartItems: cartData,
        updatedAt: new Date()
      }

      const cartRef = doc(db, 'userCarts', user.uid)
      const cartDoc = await getDoc(cartRef)

      if (cartDoc.exists()) {
        await updateDoc(cartRef, cartDataToSave)
        console.log('✅ Carrinho atualizado no Firebase')
      } else {
        await setDoc(cartRef, cartDataToSave)
        console.log('✅ Carrinho criado no Firebase')
      }
    } catch (error) {
      console.warn('❌ Erro ao salvar carrinho no Firebase:', error)
    }
  }

  // Carregar carrinho do banco de dados
  const loadCartFromDatabase = async () => {
    if (!user?.uid) return
    
    try {
      console.log('🔄 Carregando carrinho do Firebase para usuário:', user.uid)
      
      const cartRef = doc(db, 'userCarts', user.uid)
      const cartDoc = await getDoc(cartRef)

      if (cartDoc.exists() && cartDoc.data()?.cartItems) {
        setCart(cartDoc.data().cartItems)
        console.log('✅ Carrinho carregado do Firebase')
      } else {
        console.log('ℹ️ Nenhum carrinho encontrado no Firebase')
        const savedCart = localStorage.getItem('alfajoias-cart')
        if (savedCart) {
          try {
            const cartData = JSON.parse(savedCart)
            setCart(cartData)
            console.log('✅ Carrinho carregado do localStorage como fallback')
          } catch (parseError) {
            console.error('❌ Erro ao parsear carrinho do localStorage:', parseError)
          }
        }
      }
    } catch (error) {
      console.warn('❌ Erro ao carregar carrinho do Firebase:', error)
    }
  }

  // Funções auxiliares
  const ensureUserInDatabase = async (authUser: FirebaseUser) => {
    if (isCheckingUser) return
    
    try {
      setIsCheckingUser(true)
      console.log('🔄 Verificando usuário no Firebase...', authUser.uid)
      
      const userRef = doc(db, 'users', authUser.uid)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) {
        console.log('🔄 Usuário não existe, criando...')
        
        const userData = {
          email: authUser.email,
          name: authUser.displayName || authUser.email?.split('@')[0] || '',
          phone: authUser.phoneNumber || '',
          isAdmin: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        await setDoc(userRef, userData)
        console.log('✅ Usuário criado no Firebase')
      } else {
        console.log('✓ Usuário já existe no Firebase')
      }
    } catch (error) {
      console.error('Erro ao garantir usuário no Firebase:', error)
    } finally {
      setIsCheckingUser(false)
    }
  }

  const checkAdminStatus = async (userId: string) => {
    try {
      console.log('🔍 Verificando status de admin para:', userId)
      setAdminLoading(true)

      const userRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        setIsAdmin(Boolean(userDoc.data()?.isAdmin))
        console.log('✅ Admin status:', userDoc.data()?.isAdmin)
      } else {
        setIsAdmin(false)
      }
    } catch (error) {
      console.error('❌ Erro ao verificar admin status:', error)
      setIsAdmin(false)
    } finally {
      setAdminLoading(false)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        checkAdminStatus(firebaseUser.uid).catch(err => console.error('Erro ao verificar admin:', err))
        ensureUserInDatabase(firebaseUser).catch(err => console.error('Erro ao garantir usuário:', err))
      } else {
        setIsAdmin(false)
        setAdminLoading(false)
      }

      setLoading(false)
    })

    return () => unsubscribe()
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

  // Salvar carrinho sempre que ele mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('alfajoias-cart', JSON.stringify(cart))
      
      if (user?.uid && cart.length > 0) {
        saveCartToDatabase(cart).catch(err => console.error('Erro ao salvar carrinho:', err))
      }
    }
  }, [cart, user?.uid])

  // Auth functions
  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      console.log('🔄 Iniciando cadastro...', { email, userData })
      
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
      
      console.log('✅ Usuário criado no Firebase Auth:', firebaseUser?.uid)
      
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid)
        const userDataToSave = {
          email: firebaseUser.email,
          name: userData?.name || userData?.fullName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          phone: userData?.phone || firebaseUser.phoneNumber || '',
          addressStreet: userData?.addressStreet || '',
          addressNumber: userData?.addressNumber || '',
          addressComplement: userData?.addressComplement || '',
          addressNeighborhood: userData?.addressNeighborhood || '',
          addressCity: userData?.addressCity || '',
          addressState: userData?.addressState || '',
          addressZipcode: userData?.addressZipcode || '',
          isAdmin: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        await setDoc(userRef, userDataToSave)
        console.log('✅ Usuário criado no Firestore')
      }
      
      return { user: firebaseUser, error: null }
    } catch (error: any) {
      console.error('❌ Erro geral no cadastro:', error)
      return { user: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔄 Tentando fazer login...', email)
      
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password)
      
      console.log('✅ Login realizado com sucesso')
      return { user: firebaseUser, error: null }
    } catch (error) {
      return { user: null, error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const { user: firebaseUser } = await signInWithPopup(auth, provider)
      
      if (firebaseUser) {
        await ensureUserInDatabase(firebaseUser)
      }
      
      return { user: firebaseUser, error: null }
    } catch (error) {
      return { user: null, error }
    }
  }

  const signOut = async () => {
    if (isLoggingOut) return
    
    try {
      setIsLoggingOut(true)
      console.log('🔄 Fazendo logout...')
      
      setUser(null)
      setIsAdmin(false)
      setCart([])
      
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.includes('firebase') || key.includes('alfajoias')) {
            localStorage.removeItem(key)
          }
        })
      }
      
      await firebaseSignOut(auth)
      
      console.log('✅ Logout realizado com sucesso')
      
      if (typeof window !== 'undefined') {
        window.location.replace('/')
      }
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error)
      setUser(null)
      setIsAdmin(false)
      setCart([])
    } finally {
      setIsLoggingOut(false)
    }
  }

  const updateProfile = async (updates: any) => {
    if (!user?.uid) {
      const error = new Error('Usuário não autenticado')
      return { data: null, error }
    }

    try {
      const userRef = doc(db, 'users', user.uid)
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: new Date()
      }
      
      await updateDoc(userRef, updatesWithTimestamp)
      
      const updatedDoc = await getDoc(userRef)
      return { data: updatedDoc.data(), error: null }
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error)
      return { data: null, error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      return { data: null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      if (!user) {
        return { data: null, error: new Error('Você precisa estar logado para alterar a senha.') }
      }
      
      await firebaseUpdatePassword(user, newPassword)
      return { data: null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Cart functions
  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existingItem = prev.find(i => i.id === item.id)
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
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
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const clearCart = () => {
    setCart([])
  }

  const value: FirebaseAuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    isAdmin,
    isLoggedIn: !!user,
    adminLoading,
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  )
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext)
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider')
  }
  return context
}