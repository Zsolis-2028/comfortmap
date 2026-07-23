// LandingScreen.jsx
// Public marketing / "what is ComfortMap" page at /welcome. Shareable with
// organizations, on social, and in grant applications. Not gated by onboarding.

import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { RADIUS, BRAND_GRADIENT } from '../styles/colors'

export default function LandingScreen() {
  const navigate = useNavigate()
  const { COLORS, onboardingDone } = useUser()

  const start = () => navigate(onboardingDone ? '/home' : '/onboarding/language')

  const Cta = ({ children }) => (
    <button
      onClick={start}
      style={{
        background: BRAND_GRADIENT, color: '#fff', border: 'none',
        borderRadius: RADIUS.lg, padding: '15px 28px', fontSize: 16, fontWeight: 700,
        cursor: 'pointer', letterSpacing: 0.3,
      }}
    >
      {children}
    </button>
  )

  const Section = ({ title, children }) => (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px 36px' }}>
      {title && (
        <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.forest, margin: '0 0 12px' }}>{title}</h2>
      )}
      <div style={{ fontSize: 16, color: COLORS.text, lineHeight: 1.7 }}>{children}</div>
    </div>
  )

  const chip = {
    display: 'inline-block', background: COLORS.pale, color: COLORS.forest,
    borderRadius: RADIUS.pill, padding: '7px 14px', fontSize: 14, fontWeight: 600,
    margin: '0 8px 8px 0',
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.soft }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(160deg, ${COLORS.pale} 0%, #FFFFFF 70%)`,
        padding: '56px 24px 44px', textAlign: 'center',
      }}>
        <img src="/icons/icon-192.png" alt="ComfortMap" width={72} height={72} style={{ borderRadius: RADIUS.xl, marginBottom: 16 }} />
        <h1 style={{ fontSize: 40, fontWeight: 900, color: COLORS.forest, letterSpacing: -1, margin: '0 0 8px' }}>
          ComfortMap
        </h1>
        <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.mint, marginBottom: 14 }}>
          Know before you go.
        </div>
        <p style={{ fontSize: 17, color: COLORS.muted, maxWidth: 520, margin: '0 auto 26px', lineHeight: 1.6 }}>
          A community-verified sensory map of the real world — so neurodivergent people and their
          families can know what a place is actually like <em>before</em> they walk in.
        </p>
        <Cta>Get Started — Free →</Cta>
        <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 14 }}>
          Free · works on any phone · no download
        </div>
      </div>

      <div style={{ height: 40 }} />

      <Section title="The problem">
        For autistic, ADHD, and sensory-sensitive people — and the parents and caregivers who
        support them — the hardest part of going somewhere new isn't the place. It's the
        <strong> unknown</strong>. How loud is it? How bright? How crowded? Where's the quiet
        corner? Review sites tell you if the food's good — not whether a place will overwhelm your kid.
      </Section>

      <Section title="What ComfortMap does">
        Search any place and get a calm, clear <strong>comfort map</strong>: noise, crowds, lighting,
        sensory triggers, parking, what to expect step-by-step, and gentle tips — plus a ready-to-read
        prep script for parents taking a child. Been somewhere? Add a report in about 10 seconds and
        help the next family.
      </Section>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px 36px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.forest, margin: '0 0 12px' }}>Honest by design</h2>
        <div style={{
          background: COLORS.white, border: `1.5px solid ${COLORS.mint}`, borderRadius: RADIUS.xl,
          padding: '20px 22px',
        }}>
          <p style={{ fontSize: 16, color: COLORS.text, lineHeight: 1.7, margin: '0 0 12px' }}>
            Most apps guess and present it as fact. We don't. Our core principle:
          </p>
          <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.forest, lineHeight: 1.6, margin: '0 0 12px' }}>
            "Real data is the truth. AI cleans it up and presents it — and honestly admits when we
            don't know yet."
          </p>
          <div>
            <span style={chip}>✅ Verified by real visits</span>
            <span style={chip}>✨ Clearly-labeled AI estimates</span>
            <span style={chip}>⚖️ "Mixed" when people disagree</span>
          </div>
        </div>
      </div>

      <Section title="Who it's for">
        <div>
          <span style={chip}>🧩 Sensory-sensitive individuals</span>
          <span style={chip}>👨‍👩‍👧 Parents & caregivers</span>
          <span style={chip}>🩺 Therapists & teachers</span>
          <span style={chip}>🏪 Sensory-friendly businesses</span>
        </div>
      </Section>

      {/* Final CTA */}
      <div style={{ textAlign: 'center', padding: '20px 24px 56px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.forest, margin: '0 0 8px' }}>
          Walk in feeling prepared.
        </h2>
        <p style={{ fontSize: 15, color: COLORS.muted, maxWidth: 420, margin: '0 auto 22px', lineHeight: 1.6 }}>
          Founded in San Antonio, built from real visits — join us and help make the map.
        </p>
        <Cta>Open ComfortMap →</Cta>

        <div style={{ marginTop: 40, fontSize: 13, color: COLORS.muted }}>
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
