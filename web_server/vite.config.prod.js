import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production config for static deployment with nginx
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
  }
}) 