import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiOrigin = env.VITE_API_URL?.replace(/\/$/, '')

  return {
    plugins: [react(), tailwindcss()],
    server: apiOrigin
      ? {
          proxy: {
            '/api': {
              target: apiOrigin,
              changeOrigin: true,
            },
            '/uploads': {
              target: apiOrigin,
              changeOrigin: true,
            },
          },
        }
      : undefined,
  }
})
