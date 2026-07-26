// CleanSettingsScreen.jsx — warm, card-based Settings (Sociability-style).
import { useUser } from '../../context/UserContext'
import CleanNav from './CleanNav'

const GROUPS = [
  ['Account', [['Signed in', 'z@comfortmap.app'], ['Plan', 'Free']]],
  ['Profile', [['Language', 'English'], ['Who it’s for', 'Myself'], ['Sensory profile', '4 selected']]],
  ['Display', [['Text size', 'Medium'], ['Dark mode', 'System']]],
  ['About', [['Privacy', ''], ['Terms', ''], ['Accessibility', '']]],
]

export default function CleanSettingsScreen() {
  const { COLORS } = useUser()

  const card = {
    background: COLORS.white, borderRadius: 18, border: `1px solid ${COLORS.border}`,
    boxShadow: '0 2px 12px rgba(20,30,60,0.06)', padding: '4px 18px', marginBottom: 18,
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pale }}>
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '24px 18px 100px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: COLORS.forest, letterSpacing: -0.5, margin: '0 0 20px' }}>Settings</h1>

        {GROUPS.map(([title, rows]) => (
          <div key={title}>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4, textTransform: 'uppercase', margin: '0 4px 8px' }}>{title}</div>
            <div style={card}>
              {rows.map(([label, value], i) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '15px 0',
                  borderBottom: i < rows.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                }}>
                  <span style={{ fontSize: 15, color: COLORS.forest }}>{label}</span>
                  <span style={{ fontSize: 14, color: COLORS.muted }}>{value} ›</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <CleanNav />
    </div>
  )
}
