// SavedScreen.jsx
// Shows all saved comfort maps.

import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { getText } from '../data/languages'
import { RADIUS } from '../styles/colors'
import Header from '../components/Header'
import Screen from '../components/Screen'
import NavBar from '../components/NavBar'
import { PrimaryButton } from '../components/Button'

export default function SavedScreen() {
  const navigate = useNavigate()
  const { savedMaps, deleteMap, lang, COLORS } = useUser()
  const t = getText(lang)

  return (
    <div style={{ minHeight: '100vh', background: COLORS.soft }}>
      <Header title={t.savedMaps || 'Saved Maps'} />
      <Screen>
        <div style={{ marginTop: 16 }}>
          {savedMaps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.muted }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔖</div>
              <div style={{ fontSize: 16, marginBottom: 8, color: COLORS.text, fontWeight: 600 }}>No saved maps yet</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                Build a comfort map and tap Save to keep it here.
              </div>
              <PrimaryButton onClick={() => navigate('/home')}>
                Build your first map →
              </PrimaryButton>
            </div>
          ) : (
            <>
              {savedMaps.map(map => (
                <div
                  key={map.id}
                  onClick={() => navigate('/result', { state: { prompt: map.name, response: map.response } })}
                  style={{
                    background: COLORS.white,
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: RADIUS.lg,
                    padding: '14px 16px',
                    marginBottom: 12,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.soft}
                  onMouseLeave={e => e.currentTarget.style.background = COLORS.white}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 30 }}>{map.venue || '📍'}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: COLORS.text, fontSize: 15 }}>{map.name}</div>
                        <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                          {new Date(map.savedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteMap(map.id) }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: COLORS.muted,
                        fontSize: 18,
                        padding: '4px',
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <PrimaryButton onClick={() => navigate('/home')}>
                + Build a new map
              </PrimaryButton>
            </>
          )}
        </div>
      </Screen>
      <NavBar />
    </div>
  )
}
