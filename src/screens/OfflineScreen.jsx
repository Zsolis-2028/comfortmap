// OfflineScreen.jsx
// Full-screen fallback shown whenever the browser reports no network
// connection (see useOnlineStatus). Automatically goes away once the
// 'online' event fires — the "Try again" button just gives the user
// something to do while they fix their connection.

import { useUser } from '../context/UserContext'
import { getText } from '../data/languages'
import { PrimaryButton } from '../components/Button'

export default function OfflineScreen() {
  const { lang, COLORS } = useUser()
  const t = getText(lang)

  return (
    <div
      role="main"
      aria-labelledby="offline-title"
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
      <div style={{ fontSize: 64, marginBottom: 20 }}>📡</div>
      <div id="offline-title" style={{ fontSize: 22, fontWeight: 800, color: COLORS.forest, marginBottom: 8 }}>
        {t.offlineTitle || "You're offline"}
      </div>
      <div style={{ fontSize: 14, color: COLORS.muted, maxWidth: 280, lineHeight: 1.6, marginBottom: 28 }}>
        {t.offlineSubtitle || 'Check your internet connection and try again.'}
      </div>
      <div style={{ width: '100%', maxWidth: 280 }}>
        <PrimaryButton onClick={() => window.location.reload()}>
          {t.tryAgain || 'Try again'}
        </PrimaryButton>
      </div>
    </div>
  )
}
