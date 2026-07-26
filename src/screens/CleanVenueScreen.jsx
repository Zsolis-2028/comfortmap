// CleanVenueScreen.jsx
// DESIGN PREVIEW — warm, card-based venue page (Sociability-style).
// Reachable at /clean/venue. Sample data, doesn't touch the real app.

import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { BRAND_GRADIENT } from '../styles/colors'

const FACTORS = [
  ['Noise', 'Moderate', true],
  ['Crowds', 'Busy after 6pm', true],
  ['Lighting', 'Warm, dim', true],
  ['Parking', 'Easy · free lot', true],
  ['Sensory', 'Some echo', false],
  ['Accessibility', 'Good', true],
]

export default function CleanVenueScreen() {
  const navigate = useNavigate()
  const { COLORS } = useUser()

  const card = {
    background: COLORS.white, borderRadius: 18, border: `1px solid ${COLORS.border}`,
    boxShadow: '0 2px 12px rgba(20,30,60,0.06)',
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pale }}>
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '18px 18px 96px' }}>

        <div onClick={() => navigate('/clean')} style={{ fontSize: 14, color: COLORS.forest, fontWeight: 600, cursor: 'pointer', marginBottom: 16, opacity: 0.7 }}>‹ Back</div>

        {/* Photo hero */}
        <div style={{ height: 170, borderRadius: 18, background: `linear-gradient(135deg, ${COLORS.pale}, ${COLORS.mint})`, marginBottom: 16, position: 'relative' }}>
          <span style={{ position: 'absolute', bottom: 12, left: 14, background: 'rgba(255,255,255,0.9)', color: COLORS.forest, fontSize: 12, fontWeight: 600, borderRadius: 999, padding: '4px 10px' }}>📷 2 photos from visitors</span>
        </div>

        {/* Title card */}
        <div style={{ ...card, padding: '18px 18px', marginBottom: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.forest, letterSpacing: -0.4, margin: '0 0 4px' }}>Armadillo Burgers</h1>
          <p style={{ fontSize: 14, color: COLORS.muted, margin: '0 0 10px' }}>Restaurant · San Antonio</p>
          <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.successText, background: COLORS.success, borderRadius: 999, padding: '4px 10px' }}>✓ From real visits · 2 people</span>
          <p style={{ fontSize: 15, color: COLORS.text, lineHeight: 1.65, margin: '14px 0 0' }}>
            A laid-back local burger spot — calm before 6pm, warm lighting, easy parking. The back
            patio stays quieter if sound is a concern.
          </p>
        </div>

        {/* Comfort factors card */}
        <div style={{ ...card, padding: '6px 18px', marginBottom: 16 }}>
          {FACTORS.map(([label, value, verified], i) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < FACTORS.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
              <span style={{ fontSize: 15, color: COLORS.muted }}>{label}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.forest }}>{value}</span>
                {verified && <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.successText, background: COLORS.success, borderRadius: 999, padding: '2px 7px' }}>✓</span>}
              </span>
            </div>
          ))}
        </div>

        <button onClick={() => navigate('/clean/result')} style={{ width: '100%', background: BRAND_GRADIENT, color: '#fff', border: 'none', borderRadius: 12, padding: '15px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Build full comfort map</button>
        <button onClick={() => navigate('/clean')} style={{ width: '100%', marginTop: 10, background: COLORS.white, color: COLORS.forest, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Been here? Add a report</button>

      </div>
    </div>
  )
}
