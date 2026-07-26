// OnboardingWho.jsx — fully translated labels and descriptions

import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { WHO_OPTIONS, getWhoLabel, getWhoDescription } from '../data/sensoryOptions'
import { getText } from '../data/languages'
import { RADIUS } from '../styles/colors'
import Header from '../components/Header'
import Screen from '../components/Screen'
import { GhostButton } from '../components/Button'

export default function OnboardingWho() {
  const navigate = useNavigate()
  const { who, setWho, lang, COLORS } = useUser()
  const t = getText(lang)

  const handleSelect = (key) => {
    setWho(key)
    navigate('/onboarding/sensory')
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pale }}>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 16 }}>
        <img src="/icons/icon-192.png" alt="ComfortMap" width={40} height={40} style={{ borderRadius: 10 }} />
      </div>
      <Header title={t.whoTitle || 'Who is this for?'} onBack={() => navigate('/onboarding/language')} />
      <Screen>
        <p style={{ fontSize: 14, color: COLORS.muted, margin: '16px 0 20px', lineHeight: 1.6 }}>
          {t.whoSubtitle || 'ComfortMap personalizes every comfort map based on who is using it.'}
        </p>

        {WHO_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => handleSelect(opt.key)}
            style={{
              background: who === opt.key ? COLORS.pale : COLORS.white,
              border: `1.5px solid ${who === opt.key ? COLORS.mint : COLORS.border}`,
              borderRadius: RADIUS.lg,
              padding: '16px 18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              width: '100%',
              marginBottom: 10,
              textAlign: 'left',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 30 }}>{opt.emoji}</span>
            <div>
              <div style={{ fontWeight: 700, color: COLORS.text, fontSize: 15, marginBottom: 2 }}>
                {getWhoLabel(opt, lang)}
              </div>
              <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.4 }}>
                {getWhoDescription(opt, lang)}
              </div>
            </div>
          </button>
        ))}

        <GhostButton onClick={() => navigate('/home')}>
          {t.skipForNow || 'Skip for now'}
        </GhostButton>
      </Screen>
    </div>
  )
}
