// ResultScreen.jsx
// Calls Claude and displays the comfort map result.
// Handles loading state, errors, follow-up questions, and saving.

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { getComfortMap, askFollowUp } from '../utils/claude'
import { hasReachedDailyLimit, recordMapGenerated, DAILY_MAP_LIMIT } from '../utils/rateLimit'
import { getText } from '../data/languages'
import { RADIUS, BRAND_GRADIENT } from '../styles/colors'
import Header from '../components/Header'
import Screen from '../components/Screen'
import NavBar from '../components/NavBar'
import { GhostButton } from '../components/Button'

const FOLLOW_UP_SUGGESTIONS_BY_LANG = {
  en: [
    'Give me a step-by-step walkthrough',
    "What's the best time to go?",
    'Is there a quiet entrance or area?',
    'Create a low-stress plan for this visit',
    'What should I say to staff?',
    'How do I leave quickly if I need to?',
  ],
  es: [
    'Dame un recorrido paso a paso',
    '¿Cuál es el mejor momento para ir?',
    '¿Hay una entrada o área tranquila?',
    'Crea un plan sin estrés para esta visita',
    '¿Qué debo decirle al personal?',
    '¿Cómo puedo salir rápido si lo necesito?',
  ],
  fr: [
    'Donne-moi un guide étape par étape',
    'Quel est le meilleur moment pour y aller ?',
    'Y a-t-il une entrée ou une zone tranquille ?',
    'Crée un plan sans stress pour cette visite',
    'Que dois-je dire au personnel ?',
    'Comment partir rapidement si j\'en ai besoin ?',
  ],
  de: [
    'Gib mir eine Schritt-für-Schritt-Anleitung',
    'Wann ist die beste Zeit zum Hingehen?',
    'Gibt es einen ruhigen Eingang oder Bereich?',
    'Erstelle einen stressfreien Plan für diesen Besuch',
    'Was soll ich dem Personal sagen?',
    'Wie kann ich schnell gehen, wenn ich es brauche?',
  ],
  pt: [
    'Me dê um passo a passo',
    'Qual é o melhor horário para ir?',
    'Há uma entrada ou área tranquila?',
    'Crie um plano sem estresse para esta visita',
    'O que devo dizer ao funcionário?',
    'Como saio rapidamente se precisar?',
  ],
  ar: [
    'أعطني شرحاً خطوة بخطوة',
    'ما هو أفضل وقت للذهاب؟',
    'هل يوجد مدخل أو منطقة هادئة؟',
    'أنشئ خطة منخفضة التوتر لهذه الزيارة',
    'ماذا أقول للموظفين؟',
    'كيف أغادر بسرعة إذا احتجت ذلك؟',
  ],
  zh: [
    '给我一个逐步指引',
    '什么时候去最好？',
    '有没有安静的入口或区域？',
    '为这次参观制定一个低压力计划',
    '我应该对工作人员说什么？',
    '如果需要，我怎么快速离开？',
  ],
  ja: [
    'ステップごとに説明してください',
    '行くのに最適な時間はいつですか？',
    '静かな入口やエリアはありますか？',
    'この訪問のストレスの少ない計画を作ってください',
    'スタッフに何と言えばいいですか？',
    '必要なときにすぐ退席するにはどうすればいいですか？',
  ],
  hi: [
    'मुझे चरण-दर-चरण मार्गदर्शन दें',
    'जाने का सबसे अच्छा समय कब है?',
    'क्या कोई शांत प्रवेश द्वार या क्षेत्र है?',
    'इस यात्रा के लिए कम तनाव वाली योजना बनाएं',
    'कर्मचारियों से मुझे क्या कहना चाहिए?',
    'अगर जरूरत हो तो मैं जल्दी कैसे निकलूं?',
  ],
  ko: [
    '단계별로 설명해 주세요',
    '언제 가는 게 가장 좋나요?',
    '조용한 입구나 공간이 있나요?',
    '이번 방문을 위한 스트레스 없는 계획을 세워주세요',
    '직원에게 뭐라고 말해야 하나요?',
    '필요하면 어떻게 빨리 나갈 수 있나요?',
  ],
}

// Maps app language codes to BCP-47 speech-synthesis locales.
const TTS_LANG_MAP = {
  en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', pt: 'pt-BR',
  ar: 'ar-SA', zh: 'zh-CN', ja: 'ja-JP', hi: 'hi-IN', ko: 'ko-KR',
}

// Strips markdown-style formatting so the speech synthesizer doesn't
// read out "asterisk asterisk" or bullet punctuation.
function stripForSpeech(text) {
  return text
    .replace(/\*\*/g, '')
    .replace(/^[•\-]\s*/gm, '')
    .replace(/^\d+\.\s*/gm, '')
    .replace(/\n+/g, '. ')
}

// Shimmering placeholder bar used while the comfort map is generating.
function SkeletonBar({ COLORS, width = '100%', height = 10, style = {} }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius: 6,
        background: `linear-gradient(90deg, ${COLORS.pale} 25%, ${COLORS.white} 37%, ${COLORS.pale} 63%)`,
        backgroundSize: '300px 100%',
        animation: 'shimmer 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  )
}

// Splits a line on **bold** markers and renders the bold segments as
// <strong>, so inline bold survives even on lines that aren't full headers.
function renderInline(line) {
  const parts = line.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}

// Render markdown-style bold and bullet formatting from AI response
function FormattedResponse({ text }) {
  const { COLORS } = useUser()
  if (!text) return null
  return (
    <div>
      {text.split('\n').map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <div key={i} style={{ fontWeight: 700, color: COLORS.mint, marginTop: 20, marginBottom: 6, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
              {line.replace(/\*\*/g, '')}
            </div>
          )
        }
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 14, color: COLORS.text, lineHeight: 1.55 }}>
              <span style={{ color: COLORS.mint, flexShrink: 0, fontWeight: 700 }}>•</span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          )
        }
        if (line.match(/^\d+\./)) {
          const num = line.match(/^(\d+)\./)[1]
          const content = line.replace(/^\d+\.\s*/, '')
          return (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 14, color: COLORS.text, lineHeight: 1.55 }}>
              <span style={{ color: COLORS.mint, fontWeight: 700, flexShrink: 0, fontSize: 12, marginTop: 2, minWidth: 16 }}>{num}</span>
              <span>{renderInline(content)}</span>
            </div>
          )
        }
        if (line.trim() === '') return <div key={i} style={{ height: 4 }} />
        return <div key={i} style={{ fontSize: 15, color: COLORS.text, lineHeight: 1.65, marginBottom: 4 }}>{renderInline(line)}</div>
      })}
    </div>
  )
}

export default function ResultScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang, sensory, who, saveMap, COLORS } = useUser()
  const t = getText(lang)
  const FOLLOW_UP_SUGGESTIONS = FOLLOW_UP_SUGGESTIONS_BY_LANG[lang] || FOLLOW_UP_SUGGESTIONS_BY_LANG.en

  const { prompt, venue } = location.state || {}

  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [followUpInput, setFollowUpInput] = useState('')
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [limitReached, setLimitReached] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const runningRef = useRef(false)
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  // Run the AI call on mount
  useEffect(() => {
    if (!prompt) { navigate('/home'); return }
    runComfortMap()
  }, [])

  // Stop any speech in progress when the screen unmounts or the user
  // navigates away mid-read.
  useEffect(() => {
    return () => { if (ttsSupported) window.speechSynthesis.cancel() }
  }, [])

  const handleReadAloud = () => {
    if (!ttsSupported || !response) return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(stripForSpeech(response))
    utterance.lang = TTS_LANG_MAP[lang] || 'en-US'
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  const runComfortMap = async () => {
    if (runningRef.current) return
    if (hasReachedDailyLimit()) {
      setLimitReached(true)
      return
    }
    runningRef.current = true
    setLoading(true)
    setError('')
    setLimitReached(false)
    setFeedback(null)
    if (ttsSupported) { window.speechSynthesis.cancel(); setSpeaking(false) }
    try {
      const result = await getComfortMap({ userMessage: prompt, sensory, who, lang })
      recordMapGenerated()
      setResponse(result)
      setHistory([
        { role: 'user', content: prompt },
        { role: 'assistant', content: result },
      ])
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
    runningRef.current = false
  }

  const handleFollowUp = async (question) => {
    const q = question || followUpInput.trim()
    if (!q) return
    setFollowUpLoading(true)
    setFollowUpInput('')
    setFeedback(null)
    try {
      const result = await askFollowUp({ followUp: q, sensory, who, lang, conversationHistory: history })
      const newHistory = [...history, { role: 'user', content: q }, { role: 'assistant', content: result }]
      setHistory(newHistory)
      setResponse(result)
    } catch (err) {
      setError(err.message)
    }
    setFollowUpLoading(false)
  }

  const handleSave = () => {
    saveMap({
      venue: venue?.emoji || '📍',
      name: prompt.slice(0, 50),
      type: venue?.key || 'custom',
      response,
    })
    setSaved(true)
  }

  // Daily limit reached
  if (limitReached) return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.soft,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 32,
    }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>🌙</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.forest, marginBottom: 8 }}>
        {(t.limitReachedTitle || "You've used your {n} comfort maps for today").replace('{n}', DAILY_MAP_LIMIT)}
      </div>
      <div style={{ fontSize: 14, color: COLORS.muted, maxWidth: 280, lineHeight: 1.6, marginBottom: 28 }}>
        {t.limitReachedSubtitle || 'Take a breath — your maps will refresh tomorrow. Come back then for more.'}
      </div>
      <div style={{ width: '100%', maxWidth: 280 }}>
        <GhostButton onClick={() => navigate('/home')}>
          {t.backToHome || '← Back to home'}
        </GhostButton>
      </div>
    </div>
  )

  // Loading state — animated skeleton so the layout doesn't jump when
  // the real content arrives.
  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.soft,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '56px 20px 32px',
    }}>
      <div role="status" aria-live="polite" style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 56, marginBottom: 18, animation: 'pulse 1.5s ease-in-out infinite' }} aria-hidden="true">🗺️</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.forest, marginBottom: 8 }}>
          {t.buildingMap || 'Building your comfort map...'}
        </div>
        <div style={{ fontSize: 14, color: COLORS.muted, maxWidth: 260, lineHeight: 1.6 }}>
          {t.loadingSubtitle || 'Scanning noise, crowds, sensory triggers, and what to expect.'}
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 440, background: COLORS.white, border: `1.5px solid ${COLORS.border}`, borderRadius: RADIUS.xl, padding: 20 }}>
        <SkeletonBar COLORS={COLORS} width="35%" height={11} style={{ marginBottom: 12 }} />
        <SkeletonBar COLORS={COLORS} width="100%" height={9} style={{ marginBottom: 7 }} />
        <SkeletonBar COLORS={COLORS} width="88%" height={9} style={{ marginBottom: 22 }} />

        <SkeletonBar COLORS={COLORS} width="45%" height={11} style={{ marginBottom: 12 }} />
        {[95, 80, 90, 70].map((w, i) => (
          <SkeletonBar key={i} COLORS={COLORS} width={`${w}%`} height={9} style={{ marginBottom: 9 }} />
        ))}
      </div>

      <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: COLORS.soft }}>
      <Header
        title={t.yourMap || 'Your Comfort Map'}
        onBack={() => navigate('/home')}
        onRight={!saved ? handleSave : undefined}
        rightLabel={saved ? `✓ ${t.saved || 'Saved'}` : (t.saveMap || '🔖 Save')}
      />
      <Screen>
        {/* Error state */}
        {error && (
          <div role="status" aria-live="assertive" style={{
            marginTop: 16,
            background: COLORS.error,
            border: `1px solid ${COLORS.errorText}55`,
            borderRadius: RADIUS.md,
            padding: '12px 16px',
            color: COLORS.errorText,
            fontSize: 14,
          }}>
            {error}
            <button onClick={runComfortMap} style={{ marginLeft: 8, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.errorText, fontSize: 14 }}>
              {t.tryAgain || 'Try again'}
            </button>
          </div>
        )}

        {/* AI Response */}
        {response && (
          <div style={{
            background: COLORS.white,
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: RADIUS.xl,
            padding: '20px 20px 16px',
            marginTop: 16,
            className: 'fade-in',
          }}>
            <FormattedResponse text={response} />

            <div style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: `1px solid ${COLORS.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 32,
            }}>
              {feedback ? (
                <div style={{ fontSize: 13, color: COLORS.muted }}>
                  {t.feedbackThanks || 'Thanks for letting us know 🌿'}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, color: COLORS.muted }}>{t.wasHelpful || 'Was this helpful?'}</span>
                  <button
                    onClick={() => setFeedback('up')}
                    aria-label={t.helpfulYesAria || 'Yes, this was helpful'}
                    style={{
                      background: 'none',
                      border: `1.5px solid ${COLORS.border}`,
                      borderRadius: RADIUS.pill,
                      width: 32,
                      height: 32,
                      fontSize: 15,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    👍
                  </button>
                  <button
                    onClick={() => setFeedback('down')}
                    aria-label={t.helpfulNoAria || 'No, this was not helpful'}
                    style={{
                      background: 'none',
                      border: `1.5px solid ${COLORS.border}`,
                      borderRadius: RADIUS.pill,
                      width: 32,
                      height: 32,
                      fontSize: 15,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    👎
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Follow-up suggestions */}
        {response && !followUpLoading && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, color: COLORS.muted, fontWeight: 600, marginBottom: 10 }}>
              💬 {t.wantMore || 'Want to know more?'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {FOLLOW_UP_SUGGESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => handleFollowUp(q)}
                  style={{
                    background: COLORS.white,
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: RADIUS.md,
                    padding: '11px 14px',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: COLORS.forest,
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.soft}
                  onMouseLeave={e => e.currentTarget.style.background = COLORS.white}
                >
                  {q} →
                </button>
              ))}
            </div>

            {/* Custom follow-up input */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={followUpInput}
                onChange={e => setFollowUpInput(e.target.value)}
                placeholder={t.followUpPlaceholder || 'Or ask anything else...'}
                onKeyDown={e => { if (e.key === 'Enter') handleFollowUp() }}
                style={{
                  flex: 1,
                  borderRadius: RADIUS.md,
                  border: `1.5px solid ${COLORS.border}`,
                  padding: '11px 14px',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                  background: COLORS.white,
                  color: COLORS.text,
                }}
              />
              <button
                onClick={() => handleFollowUp()}
                disabled={!followUpInput.trim()}
                style={{
                  background: BRAND_GRADIENT,
                  color: 'white',
                  border: 'none',
                  borderRadius: RADIUS.md,
                  padding: '11px 18px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.askButton || 'Ask →'}
              </button>
            </div>
          </div>
        )}

        {followUpLoading && (
          <div style={{ textAlign: 'center', padding: '24px', color: COLORS.muted, fontSize: 14 }}>
            {t.thinking || 'Thinking...'}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: (ttsSupported && response) ? 'repeat(3, 1fr)' : '1fr 1fr', gap: 10, marginTop: 20 }}>
          {[
            [t.shareMap || '📤 Share', () => {}],
            [t.regenerate || '🔄 Regenerate', runComfortMap],
            ...((ttsSupported && response) ? [[
              speaking ? (t.stopReading || '⏹ Stop') : (t.readAloud || '🔊 Read aloud'),
              handleReadAloud,
            ]] : []),
          ].map(([label, action]) => (
            <button
              key={label}
              onClick={action}
              aria-pressed={speaking && label === (t.stopReading || '⏹ Stop') ? true : undefined}
              style={{
                background: COLORS.white,
                border: `1.5px solid ${COLORS.border}`,
                borderRadius: RADIUS.md,
                padding: '13px',
                fontSize: 14,
                color: COLORS.forest,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <GhostButton onClick={() => navigate('/home')}>
          {t.newMap || '← Start a new map'}
        </GhostButton>
      </Screen>
      <NavBar />
    </div>
  )
}
