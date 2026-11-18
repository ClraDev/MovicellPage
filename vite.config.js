import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Nombre exacto del repositorio. Con dominio propio cambiar a: base: '/'
  base: '/MovicellPage/',
})
