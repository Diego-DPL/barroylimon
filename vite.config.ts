import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    fs: {
      allow: ['src'], // opcional: restringe lectura a src/
    }
  },
  optimizeDeps: {
    exclude: ['supabase'], // ignora esa carpeta al hacer deps scan
  }
})
