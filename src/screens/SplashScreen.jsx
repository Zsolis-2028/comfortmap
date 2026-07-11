// SplashScreen.jsx
// First screen the user sees. Routes to onboarding or home.

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { getText } from '../data/languages'
import { PrimaryButton } from '../components/Button'
import { RADIUS } from '../styles/colors'

export default function SplashScreen() {
  const navigate = useNavigate()
  const { onboardingDone, COLORS, isDark, lang } = useUser()
  const t = getText(lang)

  // If already onboarded, go straight to home
  useEffect(() => {
    if (onboardingDone) navigate('/home')
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      background: isDark
        ? `linear-gradient(160deg, ${COLORS.soft} 0%, #0b140f 60%, #060a08 100%)`
        : `linear-gradient(160deg, #FFFFFF 0%, #FFFFFF 55%, ${COLORS.pale} 100%)`,
      padding: 32,
    }}>
      <img
        src="/icons/icon-512.png"
        alt="ComfortMap"
        style={{ width: 96, height: 96, marginBottom: 20, animation: 'pulse 3s ease-in-out infinite', borderRadius: RADIUS.xl }}
      />

      <div style={{ fontSize: 40, fontWeight: 900, color: COLORS.forest, letterSpacing: -1.5, marginBottom: 8 }}>
        ComfortMap
      </div>

      <div style={{ fontSize: 18, color: COLORS.muted, marginBottom: 12, fontWeight: 500 }}>
        {t.tagline || 'Information. Preparation. Peace of mind.'}
      </div>

      <div style={{ fontSize: 15, color: COLORS.muted, maxWidth: 280, lineHeight: 1.6, marginBottom: 48 }}>
        {t.splashSubtitle || 'For every place you go.'}
      </div>

      <div style={{ width: '100%', maxWidth: 340 }}>
        <PrimaryButton onClick={() => navigate('/onboarding/language')}>
          {t.getStarted || 'Get Started →'}
        </PrimaryButton>

        <div style={{ marginTop: 20, fontSize: 13, color: COLORS.muted, lineHeight: 1.8 }}>
          🌍 {t.statLanguages || '10 languages'} &nbsp;•&nbsp; 🏙️ {t.statVenues || '16 venue types'} &nbsp;•&nbsp; 🆓 {t.statFree || 'Free'}
        </div>

        <div style={{
          marginTop: 40,
          textAlign: 'left',
          background: COLORS.white,
          border: `1px solid ${COLORS.border}`,
          borderRadius: RADIUS.lg,
          padding: '18px 20px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.forest, marginBottom: 12, letterSpacing: 0.3 }}>
            How it works
          </div>
          {[
            '📍 Tell us where you’re going',
            '🧠 We build your comfort map',
            '✅ Walk in feeling prepared',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: COLORS.text, marginBottom: i < 2 ? 8 : 0 }}>
              <span style={{
                width: 20, height: 20, borderRadius: '50%', background: COLORS.pale,
                color: COLORS.forest, fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {i + 1}
              </span>
              {step}
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }`}</style>
    </div>
  )
}
