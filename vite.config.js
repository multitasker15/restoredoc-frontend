import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        app:  resolve(__dirname, 'app.html'),
      },
    },
  },

  // During local dev: proxy all API calls to the local backend so no CORS or URL config needed
  server: {
    proxy: {
      '/auth':      'http://localhost:3001',
      '/checklist': 'http://localhost:3001',
      '/dashboard': 'http://localhost:3001',
      '/billing':   'http://localhost:3001',
      '/health':    'http://localhost:3001',
      '/status':    'http://localhost:3001',
    },
  },
})
