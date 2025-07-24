import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  // For development only - remove for production
  server: {
    fs: {
      allow: ['..']
    }
  },
  // Serve data directory as static files
  publicDir: '../data'
})
