// OnboardingSensory.jsx — fully translated labels and descriptions

import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { SENSORY_OPTIONS, getSensoryLabel, getSensoryDescription } from '../data/sensoryOptions'
import { getText } from '../data/languages'
import { RADIUS } from '../styles/colors'
import Header from '../components/Header'
import Screen from '../components/Screen'
import { PrimaryButton, GhostButton } from '../components/Button'

export default function OnboardingSensory() {
  const navigate = useNavigate()
  const { sensory, toggleSensory, completeOnboarding, lang, COLORS } = useUser()
  const t = getText(lang)

  const handleDone = () => {
    completeOnboarding()
    navigate('/home')
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.soft }}>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 16 }}>
        <img src="/icons/icon-192.png" alt="ComfortMap" width={40} height={40} style={{ borderRadius: 10 }} />
      </div>
      <Header title={t.sensoryTitle || 'Sensory profile'} onBack={() => navigate('/onboarding/who')} />
      <Screen>
        <p style={{ fontSize: 14, color: COLORS.muted, margin: '16px 0 20px', lineHeight: 1.6 }}>
          {t.sensorySubtitle || 'Select any sensitivities to watch for. ComfortMap flags these in every map.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {SENSORY_OPTIONS.map(opt => {
            const selected = sensory.includes(opt.key)
            return (
              <button
                key={opt.key}
                onClick={() => toggleSensory(opt.key)}
                style={{
                  background: selected ? COLORS.pale : COLORS.white,
                  border: `1.5px solid ${selected ? COLORS.mint : COLORS.border}`,
                  borderRadius: RADIUS.md,
                  padding: '16px 12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{opt.emoji}</div>
                <div style={{
                  fontSize: 13,
                  color: COLORS.text,
                  fontWeight: selected ? 700 : 400,
                  lineHeight: 1.3,
                }}>
                  {getSensoryLabel(opt, lang)}
                </div>
                {selected && <div style={{ fontSize: 16, marginTop: 4, color: COLORS.mint }}>✓</div>}
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: 24 }}>
          {sensory.length > 0 && (
            <div style={{
              background: COLORS.pale,
              border: `1px solid ${COLORS.border}`,
              borderRadius: RADIUS.md,
              padding: '10px 14px',
              marginBottom: 12,
              fontSize: 13,
              color: COLORS.forest,
            }}>
              ✓ {(sensory.length === 1
                ? (t.sensitivityCountOne || '{n} sensitivity selected')
                : (t.sensitivityCountOther || '{n} sensitivities selected')
              ).replace('{n}', sensory.length)}
            </div>
          )}
          <PrimaryButton onClick={handleDone}>
            {t.saveAndContinue || 'Save & continue →'}
          </PrimaryButton>
          <GhostButton onClick={handleDone}>
            {t.skipSensory || 'Skip — no sensitivities'}
          </GhostButton>
        </div>
      </Screen>
    </div>
  )
}
