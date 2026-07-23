import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import App from './App'
import './styles/global.css'

Sentry.init({
  dsn: 'https://23e0e1f2fe19bd83d4d9fcbcbe2d6ab3@o4511711404228608.ingest.us.sentry.io/4511711432212485',
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // Drop stale-deploy chunk-load errors: the app already auto-recovers from
  // these (App.jsx lazyWithRetry + vite:preloadError + the ErrorBoundary), so
  // they're self-healing noise, not something to act on. Keeps Sentry meaningful.
  beforeSend(event, hint) {
    const err = hint && hint.originalException
    const msg = (err && err.message) || (event && event.message) || ''
    if (/dynamically imported module|module script failed|importing a module/i.test(String(msg))) {
      return null
    }
    return event
  },
})

// Vite fires this when a module preload fails — almost always a stale page
// pointing at chunks a newer deploy has replaced. Reload once (loop-guarded)
// to pull the fresh build.
window.addEventListener('vite:preloadError', () => {
  const last = Number(sessionStorage.getItem('cm_chunk_reload_at') || 0)
  if (Date.now() - last > 10000) {
    sessionStorage.setItem('cm_chunk_reload_at', String(Date.now()))
    window.location.reload()
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary
      onError={(error) => {
        // Last-resort safety net: if a chunk/import failure bubbles all the way
        // up here (e.g. iOS Safari's "Importing a module script failed"), reload
        // once to fetch the fresh build. Shares the same guard as lazyWithRetry
        // and vite:preloadError so it can never loop.
        const msg = String((error && error.message) || '')
        if (/module script|dynamically imported module|importing a module/i.test(msg)) {
          const last = Number(sessionStorage.getItem('cm_chunk_reload_at') || 0)
          if (Date.now() - last > 10000) {
            sessionStorage.setItem('cm_chunk_reload_at', String(Date.now()))
            window.location.reload()
          }
        }
      }}
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 32, fontFamily: 'system-ui, sans-serif', color: '#1a1a2e' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧭</div>
          <p style={{ fontSize: 16, marginBottom: 20 }}>Something hiccuped. A quick refresh should fix it.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: 'linear-gradient(135deg, #4A90D9, #7B68EE)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
          >
            Refresh
          </button>
        </div>
      }
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      // Non-fatal: offline caching just won't be available this load.
      console.warn('Service worker registration failed:', err)
    })
  })
}
