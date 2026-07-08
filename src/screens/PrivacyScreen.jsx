// PrivacyScreen.jsx
// Privacy policy — describes exactly what ComfortMap stores and sends,
// matching the actual behavior in UserContext.jsx and utils/claude.js.

import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { RADIUS } from '../styles/colors'
import Header from '../components/Header'
import Screen from '../components/Screen'

function Section({ title, children, COLORS }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.forest, marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.65 }}>
        {children}
      </div>
    </div>
  )
}

export default function PrivacyScreen() {
  const navigate = useNavigate()
  const { COLORS } = useUser()

  return (
    <div style={{ minHeight: '100vh', background: COLORS.soft }}>
      <Header title="Privacy Policy" onBack={() => navigate(-1)} />
      <Screen>
        <p style={{ fontSize: 13, color: COLORS.muted, margin: '16px 0 20px', lineHeight: 1.6 }}>
          Last updated July 2026. This policy explains exactly what ComfortMap stores and shares —
          in plain language, no legalese.
        </p>

        <div style={{
          background: COLORS.pale,
          border: `1px solid ${COLORS.border}`,
          borderRadius: RADIUS.md,
          padding: '12px 14px',
          marginBottom: 22,
          fontSize: 13,
          color: COLORS.forest,
          lineHeight: 1.6,
        }}>
          🔒 ComfortMap has no account, no server, and no database. Everything you enter is
          stored only on this device.
        </div>

        <Section title="What we store" COLORS={COLORS}>
          Your language, who you're preparing for, your sensory profile, and any comfort maps you
          save are stored locally in your browser's storage on this device. This data never leaves
          your device and is never sent to ComfortMap — because ComfortMap has no servers to send it
          to. Clearing your browser data or uninstalling the app permanently deletes it.
        </Section>

        <Section title="What we send to Claude (Anthropic)" COLORS={COLORS}>
          When you build a comfort map, the venue details you type and your sensory profile are
          sent directly from your device to Anthropic's Claude API to generate your map. That's the
          only outside party that ever sees what you enter. Claude does not retain your
          conversation between visits — each map is generated fresh from what you provide. See{' '}
          <span style={{ color: COLORS.green, fontWeight: 600 }}>anthropic.com/privacy</span> for
          how Anthropic handles API data.
        </Section>

        <Section title="No ads, no tracking" COLORS={COLORS}>
          ComfortMap doesn't run ads, analytics, or third-party trackers, and doesn't sell or share
          your data with anyone.
        </Section>

        <Section title="Your control" COLORS={COLORS}>
          You can edit or clear your language, profile, and sensory settings at any time from
          Settings. Deleting a saved map removes it immediately and permanently — there's no
          "undo" because there's no copy anywhere else to restore it from.
        </Section>

        <Section title="Changes to this policy" COLORS={COLORS}>
          If how ComfortMap handles data ever changes, this page will be updated and the "last
          updated" date above will reflect it.
        </Section>

        <Section title="Questions" COLORS={COLORS}>
          Reach out any time at{' '}
          <span style={{ color: COLORS.green, fontWeight: 600 }}>hello@comfortmap.app</span>.
        </Section>
      </Screen>
    </div>
  )
}
