import { createClient } from '@supabase/supabase-js'

// Limpar espaços em branco e validar
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO: Variáveis de ambiente do Supabase não configuradas!')
  console.error('Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Log para debug (apenas em desenvolvimento)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔍 Supabase Config:', {
    urlConfigured: !!supabaseUrl,
    urlValid: supabaseUrl.startsWith('http'),
    keyConfigured: !!supabaseAnonKey,
    keyLength: supabaseAnonKey.length
  })
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Tipos TypeScript para o banco de dados
export interface Product {
  id: string
  name: string
  category: string
  brand: string
  price: string
  image: string
  description: string
  featured?: boolean
  on_sale?: boolean
  original_price?: string
  discount_percentage?: number
  sale_price?: string
  gender?: string
  model?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string
  image: string
  icon: string
  created_at: string
  updated_at: string
}

export interface Banner {
  id: string
  title: string
  subtitle: string
  image: string
  cta_text: string
  cta_link: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface Brand {
  id: string
  name: string
  image: string
  active?: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  address_street?: string
  address_number?: string
  address_complement?: string
  address_neighborhood?: string
  address_city?: string
  address_state?: string
  address_zipcode?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id?: string
  order_number: string
  products: any[]
  subtotal: number | string
  tax?: number | string
  shipping?: number | string
  discount?: number | string
  total: number | string
  status: string
  payment_status?: string
  payment_method?: string
  shipping_address?: any
  billing_address?: any
  notes?: string
  tracking_number?: string
  shipped_at?: string | null
  delivered_at?: string | null
  picked_up_at?: string | null
  delivery_method?: 'delivery' | 'pickup'
  created_at: string
  updated_at?: string
  // Campos que realmente existem na tabela
  customer_name?: string
  customer_phone?: string
  customer_email?: string
}

export interface Review {
  id: string
  order_id: string
  product_id: string
  user_id?: string
  rating: number
  comment?: string
  customer_name?: string
  customer_email?: string
  approved: boolean
  created_at: string
  updated_at?: string
}




