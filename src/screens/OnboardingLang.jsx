// OnboardingLang.jsx
// Step 1 of onboarding — pick your language.

import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { LANGUAGES, getFlagUrl, getText } from '../data/languages'
import { RADIUS } from '../styles/colors'
import Header from '../components/Header'
import Screen from '../components/Screen'

export default function OnboardingLang() {
  const navigate = useNavigate()
  const { lang, setLang, COLORS } = useUser()
  const t = getText(lang)

  const handleSelect = (code) => {
    setLang(code)
    navigate('/onboarding/who')
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pale }}>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 16 }}>
        <img src="/icons/icon-192.png" alt="ComfortMap" width={40} height={40} style={{ borderRadius: 10 }} />
      </div>
      <Header title={t.chooseLanguage || 'Choose your language'} />
      <Screen>
        <p style={{ fontSize: 14, color: COLORS.muted, margin: '16px 0', lineHeight: 1.6 }}>
          {t.langSubtitle || 'ComfortMap speaks your language. You can change this anytime in Settings.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
              style={{
                background: lang === l.code ? COLORS.pale : COLORS.white,
                border: `1.5px solid ${lang === l.code ? COLORS.mint : COLORS.border}`,
                borderRadius: RADIUS.md,
                padding: '14px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 15,
                color: COLORS.text,
                fontWeight: lang === l.code ? 700 : 400,
                transition: 'all 0.15s',
                textAlign: 'left',
              }}
            >
              <img
                src={getFlagUrl(l.flagCode)}
                srcSet={`${getFlagUrl(l.flagCode, 80)} 2x`}
                alt=""
                width={28}
                height={21}
                style={{ borderRadius: 3, flexShrink: 0, objectFit: 'cover', boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}
              />
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      </Screen>
    </div>
  )
}
