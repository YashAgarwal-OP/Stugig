import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    // In production the frontend is served as a static build on Render.
    // The backend URL is injected via VITE_API_URL at build time.
    // In development the Vite dev server proxy handles /api and /socket.io.
    server: {
      proxy: {
        '/api': env.VITE_API_URL
          ? { target: env.VITE_API_URL, changeOrigin: true }
          : 'http://localhost:5000',
        '/socket.io': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          ws: true,
          changeOrigin: true,
        },
      },
    },
  }
})
