// AiDisclosureScreen.jsx
// How and where ComfortMap uses AI, and its honesty principles.

import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import Header from '../components/Header'
import Screen from '../components/Screen'

function Section({ title, children, COLORS }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.forest, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.65 }}>{children}</div>
    </div>
  )
}

export default function AiDisclosureScreen() {
  const navigate = useNavigate()
  const { COLORS } = useUser()

  return (
    <div style={{ minHeight: '100vh', background: COLORS.soft }}>
      <Header title="AI Disclosure" onBack={() => navigate(-1)} />
      <Screen>
        <p style={{ fontSize: 13, color: COLORS.muted, margin: '16px 0 20px', lineHeight: 1.6 }}>
          Last updated July 2026. How ComfortMap uses AI — and how we keep it honest.
        </p>

        <Section title="Where AI is used" COLORS={COLORS}>
          ComfortMap uses AI (a large language model, Claude by Anthropic) to write the comfort map for a
          place — the summary, comfort factors, what-to-expect steps, and tips. The AI helps turn
          information into a calm, easy-to-read guide.
        </Section>

        <Section title="Our core principle" COLORS={COLORS}>
          Real data is the truth. AI is the assistant that cleans it up and presents it — and honestly
          admits when we don't know yet.
          <ul style={{ margin: '8px 0 0', paddingLeft: 20, lineHeight: 1.7 }}>
            <li>When real visitors have reported on a place, those verified reports are the ground truth, clearly labeled "✅ From real visits."</li>
            <li>When we don't have verified reports yet, the AI gives a general estimate, clearly labeled as an AI estimate — helpful, but not confirmed.</li>
            <li>We design the AI to never present a guess as a confirmed fact about a specific place.</li>
          </ul>
        </Section>

        <Section title="Important limits" COLORS={COLORS}>
          AI-generated content can be incomplete or wrong — always use your own judgment. ComfortMap is not
          medical, psychological, legal, or professional advice. Comfort factors, timing, parking, and costs
          are typical expectations, not guarantees, and real places change. For safety- or
          accessibility-critical needs, confirm directly with the venue.
        </Section>

        <Section title="What data the AI sees" COLORS={COLORS}>
          To generate a map, we send the place you asked about, any details you provide, your selected
          sensory preferences, and relevant verified community reports to our AI provider. We do not send
          your name, email, or payment information to the AI.
        </Section>

        <Section title="Your control" COLORS={COLORS}>
          Every AI response is clearly marked, and you can always add a real report to replace a guess with
          confirmed information for the next person.
        </Section>
      </Screen>
    </div>
  )
}
