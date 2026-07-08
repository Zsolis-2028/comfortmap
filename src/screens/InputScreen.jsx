// InputScreen.jsx
// Shown after picking a venue type — user adds more detail before AI call.
// All focus tags and UI text now fully translated per language.

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { getVenueLabel } from '../data/venues'
import { getText } from '../data/languages'
import { RADIUS } from '../styles/colors'
import Header from '../components/Header'
import Screen from '../components/Screen'
import { PrimaryButton, GhostButton } from '../components/Button'

const FOCUS_TAGS = {
  en: ['Noise levels', 'How to enter', 'Crowds & timing', 'Social expectations', 'Sensory environment', 'Exit options', 'Parking & getting there', 'What staff will say', 'Best time to go', 'Accessibility'],
  es: ['Niveles de ruido', 'Cómo entrar', 'Multitudes y horarios', 'Expectativas sociales', 'Entorno sensorial', 'Opciones de salida', 'Cómo llegar', 'Qué dirá el personal', 'Mejor momento para ir', 'Accesibilidad'],
  fr: ['Niveaux sonores', 'Comment entrer', 'Foules et horaires', 'Attentes sociales', 'Environnement sensoriel', 'Options de sortie', 'Comment y aller', 'Ce que dira le personnel', 'Meilleur moment', 'Accessibilité'],
  de: ['Lärmpegel', 'Wie man reinkommt', 'Menschenmassen', 'Soziale Erwartungen', 'Sensorische Umgebung', 'Ausgänge', 'Anreise', 'Was das Personal sagt', 'Beste Zeit', 'Barrierefreiheit'],
  pt: ['Níveis de ruído', 'Como entrar', 'Multidões e horários', 'Expectativas sociais', 'Ambiente sensorial', 'Opções de saída', 'Como chegar', 'O que a equipe dirá', 'Melhor horário', 'Acessibilidade'],
  ar: ['مستويات الضوضاء', 'كيفية الدخول', 'الحشود والتوقيت', 'التوقعات الاجتماعية', 'البيئة الحسية', 'خيارات الخروج', 'كيفية الوصول', 'ماذا سيقول الموظفون', 'أفضل وقت', 'إمكانية الوصول'],
  zh: ['噪音水平', '如何进入', '人流与时间', '社交期望', '感官环境', '出口选项', '如何到达', '工作人员会说什么', '最佳时间', '无障碍设施'],
  ja: ['騒音レベル', '入り方', '混雑と時間帯', '社会的期待', '感覚環境', '出口オプション', 'アクセス方法', 'スタッフが言うこと', '最適な時間', 'アクセシビリティ'],
  hi: ['शोर स्तर', 'कैसे प्रवेश करें', 'भीड़ और समय', 'सामाजिक अपेक्षाएं', 'संवेदी वातावरण', 'निकास विकल्प', 'कैसे पहुंचें', 'कर्मचारी क्या कहेंगे', 'सबसे अच्छा समय', 'पहुंच'],
  ko: ['소음 수준', '입장 방법', '혼잡도와 시간', '사회적 기대', '감각 환경', '출구 옵션', '가는 방법', '직원이 할 말', '최적 시간', '접근성'],
}

export default function InputScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang, sensory, who, COLORS } = useUser()
  const t = getText(lang)

  const { venue, freeText } = location.state || {}
  const [input, setInput] = useState(freeText || '')
  const [focusTags, setFocusTags] = useState([])

  const tags = FOCUS_TAGS[lang] || FOCUS_TAGS['en']

  const toggleTag = (tag) => {
    setFocusTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const buildPrompt = () => {
    let prompt = input.trim()
    if (venue) prompt = `Venue type: ${getVenueLabel(venue, lang)}\n\n${prompt}`
    if (focusTags.length > 0) prompt += `\n\nI especially want to know about: ${focusTags.join(', ')}`
    return prompt
  }

  const handleSubmit = (skipDetails = false) => {
    const prompt = skipDetails
      ? (venue ? `Give me a comfort map for: ${getVenueLabel(venue, lang)}` : input)
      : buildPrompt()
    navigate('/result', { state: { prompt, venue } })
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.soft }}>
      <Header
        title={venue ? `${venue.emoji} ${getVenueLabel(venue, lang)}` : t.whereGoing || 'Tell us more'}
        onBack={() => navigate('/home')}
      />
      <Screen>
        <p style={{ fontSize: 14, color: COLORS.muted, margin: '16px 0', lineHeight: 1.6 }}>
          {t.addDetails || 'Add any details you know — name, location, what you\'re going for.'}
        </p>

        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={venue?.placeholderHint || ''}
          rows={5}
          style={{
            width: '100%',
            borderRadius: RADIUS.lg,
            border: `1.5px solid ${COLORS.border}`,
            padding: '14px 16px',
            fontSize: 15,
            fontFamily: 'inherit',
            resize: 'none',
            outline: 'none',
            background: COLORS.white,
            color: COLORS.text,
            lineHeight: 1.6,
          }}
        />

        {/* Focus tags — fully translated */}
        <div style={{ marginTop: 16, marginBottom: 4, fontSize: 13, color: COLORS.muted, fontWeight: 600 }}>
          {t.whatMatters || 'What matters most to you?'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
          {tags.map(tag => {
            const active = focusTags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  background: active ? COLORS.pale : COLORS.white,
                  border: `1.5px solid ${active ? COLORS.mint : COLORS.border}`,
                  borderRadius: '999px',
                  padding: '7px 14px',
                  fontSize: 13,
                  cursor: 'pointer',
                  color: active ? COLORS.forest : COLORS.text,
                  fontWeight: active ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {tag}
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: 20 }}>
          <PrimaryButton onClick={() => handleSubmit(false)}>
            {t.buildMap || 'Build My Comfort Map →'}
          </PrimaryButton>
          <GhostButton onClick={() => handleSubmit(true)}>
            {t.skipDetails || 'Skip details — just give me basics'}
          </GhostButton>
        </div>
      </Screen>
    </div>
  )
}
