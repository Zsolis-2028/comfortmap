// VenuePreviewScreen.jsx
// A DESIGN PREVIEW ONLY — reachable at /preview. Sample data, no live wiring.
// Purpose: show the "Know Before You Go" polished look (whitespace, rounded
// cards, big icons, real-photo area, AI summary) so we can react to the design
// before building it for real. Nothing here touches the live data or flows.

import { useUser } from '../context/UserContext'
import { RADIUS, SHADOW, BRAND_GRADIENT } from '../styles/colors'
import Header from '../components/Header'
import Screen from '../components/Screen'
import NavBar from '../components/NavBar'
import { PrimaryButton, GhostButton } from '../components/Button'

// Sample venue so the screen renders on its own.
const VENUE = {
  name: 'Armadillo Burgers',
  category: 'Restaurant · Burgers',
  city: 'San Antonio',
  summary:
    'A laid-back local burger spot. Generally calm before 6pm, with warm lighting and easy parking. Gets louder and busier on weekend evenings — the back patio stays quieter if sound is a concern.',
}

const ATTRS = [
  { icon: '🔊', label: 'Noise',     value: 'Moderate',     verified: true },
  { icon: '👥', label: 'Crowds',    value: 'Busy after 6', verified: true },
  { icon: '💡', label: 'Lighting',  value: 'Warm, dim',    verified: true },
  { icon: '🚗', label: 'Parking',   value: 'Easy · free',  verified: true },
  { icon: '🧩', label: 'Sensory',   value: 'Some echo',    verified: false },
  { icon: '🦽', label: 'Wheelchair',value: 'Accessible',   verified: false },
  { icon: '👶', label: 'Kid-friendly', value: 'Yes',       verified: true },
  { icon: '🚻', label: 'Restrooms', value: 'Clean',        verified: false },
  { icon: '🐕', label: 'Dog-friendly', value: 'Patio',     verified: false },
]

export default function VenuePreviewScreen() {
  const { COLORS } = useUser()

  return (
    <div style={{ minHeight: '100vh', background: COLORS.soft }}>
      <Header title="Preview" />
      <Screen>
        {/* Title block */}
        <div style={{ margin: '18px 0 6px' }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: COLORS.forest, letterSpacing: -0.5, lineHeight: 1.15 }}>
            {VENUE.name}
          </div>
          <div style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>
            {VENUE.category} · {VENUE.city}
          </div>
        </div>

        {/* Real-photo area */}
        <div style={{
          marginTop: 16,
          borderRadius: RADIUS.xl,
          overflow: 'hidden',
          border: `1.5px solid ${COLORS.border}`,
          background: `linear-gradient(135deg, ${COLORS.pale}, #FFFFFF)`,
          boxShadow: SHADOW.card,
        }}>
          <div style={{
            height: 170,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: COLORS.forest,
          }}>
            <div style={{ fontSize: 40 }}>📸</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Real photos from visitors</div>
            <div style={{ fontSize: 12, color: COLORS.muted }}>See the actual space before you go</div>
          </div>
          <button
            style={{
              width: '100%', border: 'none', borderTop: `1.5px solid ${COLORS.border}`,
              background: COLORS.white, color: COLORS.forest, fontWeight: 700, fontSize: 14,
              padding: '13px', cursor: 'pointer',
            }}
          >
            ➕ Add a photo
          </button>
        </div>

        {/* Know Before You Go — attribute grid */}
        <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.forest, textTransform: 'uppercase', letterSpacing: 1, margin: '26px 0 12px' }}>
          Know before you go
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {ATTRS.map((a) => (
            <div key={a.label} style={{
              background: COLORS.white,
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: RADIUS.lg,
              padding: '14px 14px 12px',
              boxShadow: SHADOW.card,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}>
              <div style={{ fontSize: 26, lineHeight: 1 }}>{a.icon}</div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>{a.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.forest }}>{a.value}</div>
              {a.verified && (
                <span style={{
                  alignSelf: 'flex-start', marginTop: 4,
                  fontSize: 9, fontWeight: 800, letterSpacing: 0.5,
                  color: COLORS.successText, background: COLORS.success,
                  borderRadius: RADIUS.pill, padding: '2px 7px',
                }}>
                  ✓ VERIFIED
                </span>
              )}
            </div>
          ))}
        </div>

        {/* AI summary */}
        <div style={{
          marginTop: 22,
          background: `linear-gradient(135deg, ${COLORS.pale}, #FFFFFF)`,
          border: `1.5px solid ${COLORS.mint}`,
          borderRadius: RADIUS.xl,
          padding: '16px 18px',
          boxShadow: SHADOW.card,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>🤖</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.forest }}>AI summary</span>
            <span style={{
              fontSize: 9, fontWeight: 800, color: COLORS.muted,
              border: `1px solid ${COLORS.border}`, borderRadius: RADIUS.pill, padding: '2px 7px',
            }}>
              BUILT AROUND REAL REPORTS
            </span>
          </div>
          <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.6 }}>
            {VENUE.summary}
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginTop: 22 }}>
          <PrimaryButton>Build full comfort map →</PrimaryButton>
          <GhostButton>📝 Been here? Add a report</GhostButton>
        </div>

        <p style={{ fontSize: 11, color: COLORS.muted, textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
          Design preview only — sample data. This is the look, not the final wiring.
        </p>

        <div style={{ height: 90 }} aria-hidden="true" />
      </Screen>
      <NavBar />
    </div>
  )
}
