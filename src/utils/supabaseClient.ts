// utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// NEXT_PUBLIC_* variables son inyectadas en tiempo de compilación por Vercel/Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Exportamos el cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
