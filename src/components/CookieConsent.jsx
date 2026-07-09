// CookieConsent.jsx
// GDPR-style consent banner. ComfortMap doesn't actually use cookies —
// everything is localStorage on-device (see PrivacyScreen) — but EU
// ePrivacy rules treat any on-device storage the same way, so we still
// ask before writing anything, and say plainly what we store.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { RADIUS } from '../styles/colors'
import { getText } from '../data/languages'

const STORAGE_KEY = 'cm_cookie_consent'

export default function CookieConsent() {
  const navigate = useNavigate()
  const { lang, COLORS } = useUser()
  const t = getText(lang)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true')

  if (dismissed) return null

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setDismissed(true)
  }

  return (
    <div
      role="region"
      aria-label={t.cookiePrivacyLink || 'Privacy Policy'}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
        background: COLORS.white,
        borderTop: `1.5px solid ${COLORS.border}`,
        padding: '14px 16px max(14px, env(safe-area-inset-bottom))',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <p style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.55, margin: '0 0 10px' }}>
          🍪{' '}
          {t.cookieMessage ||
            'We store your preferences locally on this device — no cookies, no tracking. By continuing to use ComfortMap, you agree to our Privacy Policy.'}
          {' '}
          <button
            onClick={() => navigate('/settings/privacy')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              color: COLORS.green,
              fontWeight: 600,
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            {t.cookiePrivacyLink || 'Privacy Policy'}
          </button>
        </p>
        <button
          onClick={accept}
          style={{
            background: COLORS.forest,
            color: 'white',
            border: 'none',
            borderRadius: RADIUS.md,
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          {t.cookieAccept || 'Got it'}
        </button>
      </div>
    </div>
  )
}
