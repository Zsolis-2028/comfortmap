// CleanNav.jsx — shared bottom nav for the clean design preview.
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../../context/UserContext'

const TABS = [
  ['Home', '/clean'],
  ['Explore', '/clean/explore'],
  ['Settings', '/clean/settings'],
]

export default function CleanNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { COLORS } = useUser()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: COLORS.white, borderTop: `1px solid ${COLORS.border}`,
    }}>
      <div style={{
        maxWidth: 440, margin: '0 auto', display: 'flex', justifyContent: 'space-around',
        padding: '13px 0 max(14px, env(safe-area-inset-bottom))',
      }}>
        {TABS.map(([label, path]) => {
          const active = pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: active ? 600 : 400,
                color: active ? COLORS.forest : COLORS.muted,
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
