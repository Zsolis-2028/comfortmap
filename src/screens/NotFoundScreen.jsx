// NotFoundScreen.jsx
// Custom 404 — shown for any route that doesn't match a screen.

import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { getText } from '../data/languages'
import { PrimaryButton } from '../components/Button'

export default function NotFoundScreen() {
  const navigate = useNavigate()
  const { lang, onboardingDone, COLORS } = useUser()
  const t = getText(lang)

  return (
    <div
      role="main"
      aria-labelledby="notfound-title"
      style={{
        minHeight: '100vh',
        background: COLORS.pale,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 32,
      }}
    >
      <div style={{ fontSize: 64, marginBottom: 20 }}>🧭</div>
      <div id="notfound-title" style={{ fontSize: 22, fontWeight: 800, color: COLORS.forest, marginBottom: 8 }}>
        {t.notFoundTitle || 'Page not found'}
      </div>
      <div style={{ fontSize: 14, color: COLORS.muted, maxWidth: 280, lineHeight: 1.6, marginBottom: 28 }}>
        {t.notFoundSubtitle || "The page you're looking for doesn't exist or may have moved."}
      </div>
      <div style={{ width: '100%', maxWidth: 280 }}>
        <PrimaryButton onClick={() => navigate(onboardingDone ? '/home' : '/')}>
          {t.backToHome || '← Back to home'}
        </PrimaryButton>
      </div>
    </div>
  )
}
