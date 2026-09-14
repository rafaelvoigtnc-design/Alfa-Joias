import { createClient } from '@supabase/supabase-js'

// Limpar espaços em branco e validar
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

// Supabase não é mais necessário (migrado para Firebase)
// Este arquivo é mantido apenas para compatibilidade durante a migração
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export { supabase }




