// CleanHomeScreen.jsx
// DESIGN PREVIEW — warm, card-based, image-forward take (Sociability-style).
// Reachable at /clean. Doesn't touch the real app.

import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { BRAND_GRADIENT } from '../styles/colors'
import CleanNav from './clean/CleanNav'

const NEARBY = [
  ['Armadillo Burgers', 'Restaurant', '7 of 7 details', '2 visits'],
  ['Back Unturned Brewery', 'Brewery', '5 of 7 details', '1 visit'],
  ['Chicken N Pickle', 'Entertainment', '7 of 7 details', '1 visit'],
  ['Blanco BBQ', 'Restaurant', '6 of 7 details', '1 visit'],
]

export default function CleanHomeScreen() {
  const navigate = useNavigate()
  const { COLORS } = useUser()

  const card = {
    background: COLORS.white,
    borderRadius: 18,
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 2px 12px rgba(20,30,60,0.06)',
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pale }}>
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '22px 18px 100px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <img src="/icons/icon-192.png" alt="" width={30} height={30} style={{ borderRadius: 8 }} />
            <span style={{ fontSize: 17, fontWeight: 700, color: COLORS.forest }}>ComfortMap</span>
          </div>
          <span onClick={() => navigate('/home')} style={{ fontSize: 12, color: COLORS.forest, fontWeight: 600, cursor: 'pointer', opacity: 0.55 }}>Current design →</span>
        </div>

        {/* Hero card */}
        <div style={{ ...card, padding: '22px 20px', marginBottom: 18 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: COLORS.forest, letterSpacing: -0.5, lineHeight: 1.2, margin: '0 0 6px' }}>Know before you go.</h1>
          <p style={{ fontSize: 15, color: COLORS.muted, lineHeight: 1.55, margin: '0 0 16px' }}>See what a place is really like — from real visits.</p>
          <input
            placeholder="Search a place…"
            style={{ width: '100%', boxSizing: 'border-box', border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: '14px 15px', fontSize: 15, fontFamily: 'inherit', outline: 'none', background: COLORS.soft, color: COLORS.text }}
          />
          <button onClick={() => navigate('/clean/venue')} style={{ width: '100%', marginTop: 10, background: BRAND_GRADIENT, color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Build my comfort map</button>
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.forest, margin: '6px 4px 10px' }}>Mapped near you</div>

        {NEARBY.map(([name, type, details, visits]) => (
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
