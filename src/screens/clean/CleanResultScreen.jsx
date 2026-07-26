// CleanResultScreen.jsx — warm, card-based comfort-map output (Sociability-style).
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { BRAND_GRADIENT } from '../../styles/colors'

const FACTORS = [
  ['Noise', 'Low–medium; soft background music'],
  ['Crowds', 'Calm weekday mornings; busy Fri/Sat eve'],
  ['Lighting', 'Warm and soft, not fluorescent'],
  ['Sensory', 'Light coffee smell, gentle foot traffic'],
  ['Parking', 'Street or nearby lot; usually easy'],
]

const STEPS = [
  'Walk in and take a moment to pick your spot',
  'Order at the counter at your own pace',
  'Settle in — most people keep to themselves',
  'Leave whenever you’re ready, no pressure',
]

export default function CleanResultScreen() {
  const navigate = useNavigate()
  const { COLORS } = useUser()

  const card = {
    background: COLORS.white, borderRadius: 18, border: `1px solid ${COLORS.border}`,
    boxShadow: '0 2px 12px rgba(20,30,60,0.06)', padding: '18px 18px', marginBottom: 16,
  }
  const H = ({ children }) => (
    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.forest, margin: '0 0 12px' }}>{children}</div>
  )

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pale }}>
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '18px 18px 96px' }}>
        <div onClick={() => navigate('/clean')} style={{ fontSize: 14, color: COLORS.forest, fontWeight: 600, cursor: 'pointer', marginBottom: 16, opacity: 0.7 }}>‹ Back</div>

        <div style={card}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: COLORS.forest, letterSpacing: -0.4, margin: '0 0 4px' }}>Your comfort map</h1>
          <p style={{ fontSize: 12, color: COLORS.muted, margin: '0 0 12px' }}>AI estimate · not yet confirmed by real visits</p>
          <p style={{ fontSize: 15, color: COLORS.text, lineHeight: 1.65, margin: 0 }}>
            A calm, low-key spot to settle in and do your own thing. Mornings are quietest, and no one
            rushes you — a good place to ease in.
          </p>
        </div>

        <div style={card}>
          <H>Comfort factors</H>
          {FACTORS.map(([label, value], i) => (
            <div key={label} style={{ padding: '11px 0', borderBottom: i < FACTORS.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.forest }}>{label}</div>
              <div style={{ fontSize: 14, color: COLORS.muted, marginTop: 2, lineHeight: 1.5 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={card}>
          <H>What to expect</H>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '7px 0' }}>
              <span style={{ fontSize: 14, color: COLORS.mint, fontWeight: 700, minWidth: 16 }}>{i + 1}</span>
              <span style={{ fontSize: 15, color: COLORS.text, lineHeight: 1.6 }}>{s}</span>
            </div>
          ))}
        </div>

        <div style={{ ...card, background: `linear-gradient(135deg, ${COLORS.pale}, ${COLORS.white})` }}>
          <H>One tip you might not expect</H>
          <p style={{ fontSize: 15, color: COLORS.text, lineHeight: 1.65, margin: 0 }}>
            Bring headphones — a universal “I’m in my own space” signal that people respect.
          </p>
        </div>

        <button style={{ width: '100%', background: BRAND_GRADIENT, color: '#fff', border: 'none', borderRadius: 12, padding: '15px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Been here? Add what it’s really like
        </button>
      </div>
    </div>
  )
}
