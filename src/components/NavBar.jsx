// NavBar.jsx
// Fixed bottom navigation bar shown on all main screens.

import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { getText } from '../data/languages'

const TABS = [
  { path: '/home',     icon: '/icons/icon-192.png', labelKey: 'home'     },
  { path: '/explore',  emoji: '🧭', labelKey: 'explore'  },
  { path: '/saved',    emoji: '🔖', labelKey: 'saved'    },
  { path: '/settings', emoji: '⚙️', labelKey: 'settings' },
]

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang, COLORS } = useUser()
  const t = getText(lang)

  return (
    <nav aria-label={t.mainNavLabel || 'Main navigation'} style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: COLORS.white,
      borderTop: `1px solid ${COLORS.border}`,
      display: 'flex',
      justifyContent: 'space-around',
      padding: '10px 0 max(16px, env(safe-area-inset-bottom))',
      zIndex: 100,
    }}>
      {TABS.map(tab => {
        const active = location.pathname.startsWith(tab.path)
        const label = t[tab.labelKey] || tab.labelKey
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            aria-current={active ? 'page' : undefined}
            aria-label={label}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '4px 20px',
              opacity: active ? 1 : 0.4,
              transition: 'opacity 0.2s',
            }}
          >
            {tab.icon ? (
              <img src={tab.icon} alt="" width={24} height={24} style={{ borderRadius: 6 }} aria-hidden="true" />
            ) : (
              <span style={{ fontSize: 24 }} aria-hidden="true">{tab.emoji}</span>
            )}
            <span style={{
              fontSize: 11,
              color: COLORS.forest,
              fontWeight: 600,
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
