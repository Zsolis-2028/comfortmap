// DataRetentionScreen.jsx
// What data ComfortMap keeps, why, for how long, and how to delete it.

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

export default function DataRetentionScreen() {
  const navigate = useNavigate()
  const { COLORS } = useUser()

  return (
    <div style={{ minHeight: '100vh', background: COLORS.soft }}>
      <Header title="Data Retention" onBack={() => navigate(-1)} />
      <Screen>
        <p style={{ fontSize: 13, color: COLORS.muted, margin: '16px 0 20px', lineHeight: 1.6 }}>
          Last updated July 2026. What we keep, why, and how to delete it.
        </p>

        <Section title="Our promise" COLORS={COLORS}>
          We collect the least we need to run ComfortMap, we're clear about what we keep, and you can ask us
          to delete it.
        </Section>

        <Section title="What we store" COLORS={COLORS}>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
            <li><b>Account</b> (email, login) — until you delete your account.</li>
            <li><b>Sensory profile</b> — until you change or delete it.</li>
            <li><b>Reports you submit</b> (ratings, optional notes) — part of the shared community map.</li>
            <li><b>Photos you upload</b> — until removed by you or a moderator.</li>
            <li><b>Usage</b> (maps generated) — to enforce fair limits; rolling by month.</li>
            <li><b>Payment info</b> — handled by Stripe; we never store card numbers.</li>
            <li><b>Error logs</b> — short-term only; we do not log your message content.</li>
          </ul>
        </Section>

        <Section title="Sensitive data" COLORS={COLORS}>
          Your sensory profile and the places you look up can reveal disability- or health-related
          information. We treat this as sensitive: tied to your account, protected by access controls, never
          sold, and never used for advertising.
        </Section>

        <Section title="Contributions to the shared map" COLORS={COLORS}>
          Reports and photos you submit become part of ComfortMap's community data so they can help others.
          These are stored without your name attached. If you delete your account, we remove your personal
          identifiers; anonymized report data may remain part of the shared map so it stays useful.
        </Section>

        <Section title="Deleting your data" COLORS={COLORS}>
          Email <span style={{ color: COLORS.green, fontWeight: 600 }}>hello@comfortmap.app</span> from your
          account email to delete your account, or to remove a specific report or photo you submitted. We
          action deletion requests promptly.
        </Section>

        <Section title="Data decay" COLORS={COLORS}>
          Comfort reports naturally age out of the "verified" view after about 18 months, so the map reflects
          what places are like now, not years ago.
        </Section>
      </Screen>
    </div>
  )
}
