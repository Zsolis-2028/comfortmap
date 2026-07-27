// LandingScreen.jsx
// Public marketing / "what is ComfortMap" page at /welcome. Shareable with
// organizations, on social, and in grant applications. Not gated by onboarding.
// Warm, card-based styling to match the rest of the app.

import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { RADIUS, BRAND_GRADIENT } from '../styles/colors'

export default function LandingScreen() {
  const navigate = useNavigate()
  const { COLORS, onboardingDone } = useUser()

  const start = () => navigate(onboardingDone ? '/home' : '/onboarding/language')

  const card = {
    background: COLORS.white,
    borderRadius: 18,
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 2px 12px rgba(20,30,60,0.06)',
    padding: '24px 22px',
    marginBottom: 16,
  }

  const Cta = ({ children }) => (
    <button
      onClick={start}
      style={{
        background: BRAND_GRADIENT, color: '#fff', border: 'none',
        borderRadius: 14, padding: '15px 28px', fontSize: 16, fontWeight: 700,
        cursor: 'pointer', letterSpacing: 0.3,
      }}
    >
      {children}
    </button>
  )

  const H = ({ children }) => (
    <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.forest, letterSpacing: -0.3, margin: '0 0 12px' }}>{children}</h2>
  )

  const chip = {
    display: 'inline-block', background: COLORS.pale, color: COLORS.forest,
    borderRadius: RADIUS.pill, padding: '7px 14px', fontSize: 14, fontWeight: 600,
    margin: '0 8px 8px 0',
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pale }}>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '24px 18px 56px' }}>

        {/* Hero card */}
        <div style={{ ...card, padding: '40px 24px', textAlign: 'center', marginBottom: 18 }}>
          <img src="/icons/icon-192.png" alt="ComfortMap" width={72} height={72} style={{ borderRadius: RADIUS.xl, marginBottom: 16 }} />
          <h1 style={{ fontSize: 38, fontWeight: 900, color: COLORS.forest, letterSpacing: -1, margin: '0 0 8px' }}>
            ComfortMap
          </h1>
          <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.mint, marginBottom: 14 }}>
            Know before you go.
          </div>
          <p style={{ fontSize: 16, color: COLORS.muted, maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.6 }}>
            A community-verified sensory map of the real world — so neurodivergent people and their
            families can know what a place is actually like <em>before</em> they walk in.
          </p>
          <Cta>Get Started — Free →</Cta>
          <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 14 }}>
            Free to start · no card needed · works on any phone
          </div>
        </div>

        {/* The problem */}
        <div style={card}>
          <H>The problem</H>
          <p style={{ fontSize: 15.5, color: COLORS.text, lineHeight: 1.7, margin: 0 }}>
            For autistic, ADHD, and sensory-sensitive people — and the parents and caregivers who
            support them — the hardest part of going somewhere new isn't the place. It's the
            <strong> unknown</strong>. How loud is it? How bright? How crowded? Where's the quiet
            corner? Review sites tell you if the food's good — not whether a place will overwhelm your kid.
          </p>
        </div>

        {/* What it does */}
        <div style={card}>
          <H>What ComfortMap does</H>
          <p style={{ fontSize: 15.5, color: COLORS.text, lineHeight: 1.7, margin: 0 }}>
            Search any place and get a calm, clear <strong>comfort map</strong>: noise, crowds, lighting,
            sensory triggers, parking, what to expect step-by-step, and gentle tips — plus a ready-to-read
            prep script for parents taking a child. Been somewhere? Add a report in about 10 seconds and
            help the next family.
          </p>
        </div>

        {/* Honest by design */}
        <div style={card}>
          <H>Honest by design</H>
          <p style={{ fontSize: 15.5, color: COLORS.text, lineHeight: 1.7, margin: '0 0 12px' }}>
            Most apps guess and present it as fact. We don't. Our core principle:
          </p>
          <p style={{ fontSize: 15.5, fontWeight: 700, color: COLORS.forest, lineHeight: 1.6, margin: '0 0 16px' }}>
            "Real data is the truth. AI cleans it up and presents it — and honestly admits when we
            don't know yet."
          </p>
          <div>
            <span style={chip}>✅ Verified by real visits</span>
            <span style={chip}>✨ Clearly-labeled AI estimates</span>
            <span style={chip}>⚖️ "Mixed" when people disagree</span>
          </div>
        </div>

        {/* Who it's for */}
        <div style={card}>
          <H>Who it's for</H>
          <div>
            <span style={chip}>🧩 Sensory-sensitive individuals</span>
            <span style={chip}>👨‍👩‍👧 Parents & caregivers</span>
            <span style={chip}>🩺 Therapists & teachers</span>
            <span style={chip}>🏪 Sensory-friendly businesses</span>
          </div>
        </div>

        {/* Final CTA card */}
        <div style={{ ...card, textAlign: 'center', padding: '32px 24px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.forest, letterSpacing: -0.4, margin: '0 0 8px' }}>
            Walk in feeling prepared.
          </h2>
          <p style={{ fontSize: 15, color: COLORS.muted, maxWidth: 420, margin: '0 auto 22px', lineHeight: 1.6 }}>
            Founded in San Antonio, built from real visits — join us and help make the map.
          </p>
          <Cta>Open ComfortMap →</Cta>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: COLORS.muted }}>
          <span onClick={() => navigate('/settings/privacy')} style={{ cursor: 'pointer', textDecoration: 'underline', margin: '0 8px' }}>Privacy</span>
          ·
          <span onClick={() => navigate('/terms')} style={{ cursor: 'pointer', textDecoration: 'underline', margin: '0 8px' }}>Terms</span>
          ·
          <span style={{ margin: '0 8px' }}>hello@comfortmap.app</span>
        </div>

      </div>
    </div>
  )
}
