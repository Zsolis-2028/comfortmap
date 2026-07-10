import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Mounts api/comfort.js into the Vite dev server so `npm run dev` can
// hit the same backend proxy that Vercel serves in production, without
// needing `vercel dev`.
function comfortApiDevMiddleware(env) {
  return {
    name: 'comfortmap-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/comfort', async (req, res) => {
        process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY
        const { default: handler } = await import('./api/comfort.js')
        await handler(req, res)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), comfortApiDevMiddleware(env)],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'router': ['react-router-dom'],
            'sentry': ['@sentry/react'],
          },
        },
      },
    },
  }
})
