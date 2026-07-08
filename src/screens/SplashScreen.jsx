// SplashScreen.jsx
// First screen the user sees. Routes to onboarding or home.

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { PrimaryButton } from '../components/Button'

export default function SplashScreen() {
  const navigate = useNavigate()
  const { onboardingDone, COLORS, isDark } = useUser()

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
        : `linear-gradient(160deg, ${COLORS.soft} 0%, #ecfdf5 60%, #f0f9ff 100%)`,
      padding: 32,
    }}>
      <div style={{ fontSize: 80, marginBottom: 20, animation: 'pulse 3s ease-in-out infinite' }}>🗺️</div>

      <div style={{ fontSize: 40, fontWeight: 900, color: COLORS.forest, letterSpacing: -1.5, marginBottom: 8 }}>
        ComfortMap
      </div>

      <div style={{ fontSize: 18, color: COLORS.muted, marginBottom: 12, fontWeight: 500 }}>
        Know before you go.
      </div>

      <div style={{ fontSize: 15, color: COLORS.muted, maxWidth: 280, lineHeight: 1.6, marginBottom: 48 }}>
        Feel safe, confident, and prepared before entering any place — anywhere in the world.
      </div>

      <div style={{ width: '100%', maxWidth: 340 }}>
        <PrimaryButton onClick={() => navigate('/onboarding/language')}>
          Get Started →
        </PrimaryButton>

        <div style={{ marginTop: 20, fontSize: 13, color: COLORS.muted, lineHeight: 1.8 }}>
          🌍 10 languages &nbsp;•&nbsp; 🏙️ 16 venue types &nbsp;•&nbsp; 🆓 Free
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }`}</style>
    </div>
  )
}
