// PrivacyScreen.jsx
// Privacy policy — describes exactly what ComfortMap stores and sends,
// matching the actual behavior in UserContext.jsx and utils/claude.js.

import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { getText } from '../data/languages'
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
  const { COLORS, lang } = useUser()
  const t = getText(lang)

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pale }}>
      <Header title={t.privacy || 'Privacy Policy'} onBack={() => navigate(-1)} />
      <Screen>
        <p style={{ fontSize: 13, color: COLORS.muted, margin: '16px 0 20px', lineHeight: 1.6 }}>
          Last updated August 2026. This policy explains exactly what ComfortMap stores and shares —
          in plain language, no legalese.
        </p>

        <div style={{
          background: COLORS.white,
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 2px 12px rgba(20,30,60,0.06)',
          borderRadius: 16,
          padding: '14px 16px',
          marginBottom: 22,
          fontSize: 13,
          color: COLORS.forest,
          lineHeight: 1.6,
        }}>
          🔒 We collect the least we need to run ComfortMap, we're clear about what we keep, and
          you can ask us to delete it at any time.
        </div>

        <Section title="What we store" COLORS={COLORS}>
          Your account (email + login), your sensory profile, and any comfort maps you save are
          tied to your account so they follow you across devices. If you submit a comfort report,
          photo, or video, it becomes part of the shared community map (see "Community
          contributions" below). We also track basic usage (like how many maps you've generated)
          to enforce plan limits, and — if you subscribe to Pro — your subscription status. We
          never store your card number; billing is handled entirely by Stripe.
        </Section>

        <Section title="What we send to Claude (Anthropic)" COLORS={COLORS}>
          When you build a comfort map, the venue details you enter and your sensory profile are
          sent to our server, which calls Anthropic's Claude API to generate your map. Anthropic is
          the only outside party that ever sees what you enter for this purpose. Claude does not
          retain your conversation between visits — each map is generated fresh from what you
          provide. See{' '}
          <span style={{ color: COLORS.green, fontWeight: 600 }}>anthropic.com/privacy</span> for
          how Anthropic handles API data.
        </Section>

        <Section title="Community contributions" COLORS={COLORS}>
          Reports, photos, and videos you submit become part of ComfortMap's shared community map
          so they can help other visitors. They're stored without your name attached in the public
          map. If you delete your account, we remove your personal identifiers from your
          contributions; the anonymized report data itself may remain part of the shared map so it
          stays useful for the community. Comfort reports naturally age out of the "verified" view
          after about 18 months, so the map reflects what a place is like now.
        </Section>

        <Section title="No ads, no tracking" COLORS={COLORS}>
          ComfortMap doesn't run ads, and doesn't sell your data or use it for advertising. Your
          sensory profile and the places you look up can reveal disability- or health-related
          information — we treat that as sensitive, protected by access controls, and it's never
          used for anything beyond running the app for you.
        </Section>

        <Section title="Your control" COLORS={COLORS}>
          You can edit or clear your language, profile, and sensory settings at any time from
          Settings. To delete your account, a specific report, or a photo/video you submitted,
          email{' '}
          <span style={{ color: COLORS.green, fontWeight: 600 }}>hello@comfortmap.app</span> from
          your account email — we'll action deletion requests promptly.
        </Section>

        <Section title="Your rights, wherever you are" COLORS={COLORS}>
          If you're in the UK or EU, Canada, or Australia, the same core rights apply under your
          local law (UK/EU GDPR, Canada's PIPEDA, Australia's Privacy Act): you can ask what we
          hold about you, correct it, ask us to delete it, and — where it applies — get a copy of
          it. These are the same practical rights every ComfortMap user already has, listed here
          explicitly so it's clear regardless of where you're using the app from. Email{' '}
          <span style={{ color: COLORS.green, fontWeight: 600 }}>hello@comfortmap.app</span> for
          any of these requests.
        </Section>

        <Section title="Changes to this policy" COLORS={COLORS}>
          If how ComfortMap handles data ever changes, this page will be updated and the "last
          updated" date above will reflect it.
        </Section>

        <Section title="Questions" COLORS={COLORS}>
          Reach out any time at{' '}
          <span style={{ color: COLORS.green, fontWeight: 600 }}>hello@comfortmap.app</span>.
        </Section>

        <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 12 }}>
          <button
            onClick={() => navigate('/terms')}
            style={{
              background: 'none',
              border: 'none',
              color: COLORS.green,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 4,
            }}
          >
            {t.terms || 'Terms of Service'}
          </button>
        </div>
      </Screen>
    </div>
  )
}
