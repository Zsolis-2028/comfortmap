// CleanExploreScreen.jsx — warm, card-based Explore (Sociability-style).
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import CleanNav from './CleanNav'

const PLACES = [
  ['Armadillo Burgers', 'Restaurant', '7 of 7 details', '2 visits'],
  ['Back Unturned Brewery', 'Brewery', '5 of 7 details', '1 visit'],
  ['Chicken N Pickle', 'Entertainment', '7 of 7 details', '1 visit'],
  ['Blanco BBQ', 'Restaurant', '6 of 7 details', '1 visit'],
  ['Flying Saucer', 'Bar', '7 of 7 details', '2 visits'],
  ['Pho Kim Long', 'Restaurant', '5 of 7 details', '1 visit'],
]

export default function CleanExploreScreen() {
  const navigate = useNavigate()
  const { COLORS } = useUser()

  const card = {
    background: COLORS.white, borderRadius: 18, border: `1px solid ${COLORS.border}`,
    boxShadow: '0 2px 12px rgba(20,30,60,0.06)',
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pale }}>
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '24px 18px 100px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: COLORS.forest, letterSpacing: -0.5, margin: '0 0 4px' }}>Explore</h1>
        <p style={{ fontSize: 14, color: COLORS.muted, margin: '0 0 16px' }}>Real places mapped in San Antonio.</p>

        <input
          placeholder="Search mapped places…"
          style={{ width: '100%', boxSizing: 'border-box', border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: '13px 15px', fontSize: 14, fontFamily: 'inherit', outline: 'none', background: COLORS.white, color: COLORS.text }}
        />
        <div style={{ fontSize: 13, color: COLORS.forest, fontWeight: 700, margin: '16px 4px 10px' }}>10 places · 12 real visits</div>

        {PLACES.map(([name, type, details, visits]) => (
          <div key={name} onClick={() => navigate('/clean/venue')} style={{ ...card, display: 'flex', gap: 12, padding: 12, marginBottom: 12, cursor: 'pointer', alignItems: 'center' }}>
            <div style={{ width: 66, height: 66, borderRadius: 12, flexShrink: 0, background: `linear-gradient(135deg, ${COLORS.pale}, ${COLORS.mint})` }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.forest }}>{name}</div>
              <div style={{ fontSize: 12, color: COLORS.muted, margin: '1px 0 7px' }}>{type}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.successText, background: COLORS.success, borderRadius: 999, padding: '3px 9px' }}>✓ {details}</span>
                <span style={{ fontSize: 12, color: COLORS.muted }}>{visits}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <CleanNav />
    </div>
  )
}
