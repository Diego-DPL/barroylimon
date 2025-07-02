// utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

/**
 * En Vite las variables de entorno públicas deben empezar con VITE_
 * Crea un archivo .env en la raíz de tu proyecto con:
 *   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
 *   VITE_SUPABASE_ANON_KEY=tu_anon_key
 * Luego reinicia el servidor de Vite (npm run dev).
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

console.log('👉 Supabase URL:', supabaseUrl)
console.log('👉 Supabase Key:', supabaseAnonKey.substring(0, 10) + '…') 

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en las variables de entorno'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
