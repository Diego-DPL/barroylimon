// utils/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Comprueba que las variables de entorno estén definidas
declare const process: {
  env: {
    NEXT_PUBLIC_SUPABASE_URL?: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// SupabaseClient tipado con la interfaz Database generada por Supabase
// (puedes generar tipos automáticamente con la CLI de Supabase)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)
