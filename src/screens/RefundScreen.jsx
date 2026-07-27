// RefundScreen.jsx
// Plain-language refund & cancellation policy for ComfortMap subscriptions.

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

export default function RefundScreen() {
  const navigate = useNavigate()
  const { COLORS } = useUser()

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pale }}>
      <Header title="Refund Policy" onBack={() => navigate(-1)} />
      <Screen>
        <p style={{ fontSize: 13, color: COLORS.muted, margin: '16px 0 20px', lineHeight: 1.6 }}>
          Last updated July 2026. Plain-language refund and cancellation terms for ComfortMap subscriptions.
        </p>

        <Section title="Subscriptions" COLORS={COLORS}>
          ComfortMap has a free tier and paid subscriptions (Pro is $5.99/month). Paid plans are billed
          monthly in advance and renew automatically until you cancel.
        </Section>

        <Section title="Cancelling" COLORS={COLORS}>
          You can cancel anytime by emailing us from the address on your account, and we'll cancel it
          right away (self-service cancellation from your account is coming soon). When you cancel, your
          subscription stays active until the end of the current billing period you've already paid for —
          you won't be charged again after that, and your account simply returns to the free tier. You keep
          your account and everything you've contributed.
        </Section>

        <Section title="Refunds" COLORS={COLORS}>
          Because you can cancel anytime and keep access through the period you paid for, we generally don't
          offer partial-month refunds for time already used. That said:
          <ul style={{ margin: '8px 0 0', paddingLeft: 20, lineHeight: 1.7 }}>
            <li>First-time charge, within 7 days: if you're unhappy with your first paid month, email us within 7 days and we'll refund it.</li>
            <li>Billing errors or duplicate charges: refunded in full, always.</li>
            <li>Downtime or a broken feature you paid for: contact us and we'll make it right.</li>
          </ul>
        </Section>

        <Section title="How to request a refund" COLORS={COLORS}>
          Email <span style={{ color: COLORS.green, fontWeight: 600 }}>hello@comfortmap.app</span> from the
          address on your account with a short note about what happened. We aim to respond within a few
          business days. If something's wrong, please email us first — we can almost always fix it faster
          than a bank dispute.
        </Section>
      </Screen>
    </div>
  )
}
