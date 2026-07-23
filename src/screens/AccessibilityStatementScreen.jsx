// AccessibilityStatementScreen.jsx
// ComfortMap's commitment to being accessible, and how to report problems.

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

export default function AccessibilityStatementScreen() {
  const navigate = useNavigate()
  const { COLORS } = useUser()

  return (
    <div style={{ minHeight: '100vh', background: COLORS.soft }}>
      <Header title="Accessibility" onBack={() => navigate(-1)} />
      <Screen>
        <p style={{ fontSize: 13, color: COLORS.muted, margin: '16px 0 20px', lineHeight: 1.6 }}>
          Last updated July 2026. Our commitment to making ComfortMap accessible to everyone.
        </p>

        <Section title="Our commitment" COLORS={COLORS}>
          ComfortMap exists to make the world more navigable for neurodivergent and sensory-sensitive people.
          An accessibility tool has to be accessible itself — so we treat accessibility as a core feature,
          not an afterthought. We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1,
          Level AA.
        </Section>

        <Section title="What we've built in" COLORS={COLORS}>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
            <li>Adjustable text size (Small → Extra Large)</li>
            <li>Dark mode (on / off / follow system)</li>
            <li>Reduced-motion friendly — minimal, calm animations</li>
            <li>Keyboard navigation and a skip-to-content link</li>
            <li>Screen-reader support — meaningful labels and roles</li>
            <li>Calm, low-sensory visual design — soft colors, clear structure, no flashing</li>
            <li>Plain, scannable language and predictable layouts</li>
          </ul>
        </Section>

        <Section title="Ongoing work" COLORS={COLORS}>
          Accessibility is never "done." We keep testing with assistive technologies and improving as we
          learn. Some areas may not yet fully meet every criterion; we're actively working on them.
        </Section>

        <Section title="Tell us where we fall short" COLORS={COLORS}>
          If any part of ComfortMap is hard to use with your assistive technology or your needs, please tell
          us — that feedback directly shapes the product. Email{' '}
          <span style={{ color: COLORS.green, fontWeight: 600 }}>hello@comfortmap.app</span> with the device,
          browser, and assistive tech you're using if you can, and we'll do our best to fix it quickly. The
          people this app serves are the experts on what accessible really means.
        </Section>
      </Screen>
    </div>
  )
}
