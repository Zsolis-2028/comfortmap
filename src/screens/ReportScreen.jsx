// ReportScreen.jsx
// The 10-second contribution flow — the real engine of ComfortMap.
// A visitor taps what a place was like; each tap becomes a Verified
// observation in the database. This is how the honest map fills up.

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { RADIUS } from '../styles/colors'
import Header from '../components/Header'
import Screen from '../components/Screen'
import { PrimaryButton } from '../components/Button'
import { submitReport } from '../lib/reports'
import { ATTRIBUTES } from '../lib/attributes'

export default function ReportScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { COLORS } = useUser()

  const [venueName, setVenueName] = useState(location.state?.venueName || '')
  const [ratings, setRatings] = useState({})
  const [status, setStatus] = useState('idle') // idle | saving | done | error
  const [errorMsg, setErrorMsg] = useState('')

  const setRating = (key, value) =>
    setRatings(prev => ({ ...prev, [key]: prev[key] === value ? undefined : value }))

  const ratedCount = Object.values(ratings).filter(v => v != null).length
  const canSubmit = venueName.trim().length > 0 && ratedCount > 0 && status !== 'saving'

  const handleSubmit = async () => {
    setStatus('saving')
    setErrorMsg('')
    try {
      const clean = Object.fromEntries(
        Object.entries(ratings).filter(([, v]) => v != null)
      )
      await submitReport({
        venueName,
        category: location.state?.category || 'other',
        city: location.state?.city || 'San Antonio',
        ratings: clean,
      })
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Something went wrong saving your report.')
    }
  }

  if (status === 'done') {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.soft }}>
        <Header title="Thank you 💙" onBack={() => navigate('/home')} />
        <Screen>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.forest, marginBottom: 8 }}>
              Your report is saved!
            </div>
            <div style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
              You just made ComfortMap more honest for the next person visiting {venueName.trim()}. That's real data — thank you.
            </div>
            <PrimaryButton onClick={() => navigate('/home')} style={{ maxWidth: 240, margin: '24px auto 0' }}>
              Done
            </PrimaryButton>
          </div>
        </Screen>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.soft }}>
      <Header title="Rate this place" onBack={() => navigate(-1)} />
      <Screen>
        <p style={{ fontSize: 14, color: COLORS.muted, margin: '16px 0', lineHeight: 1.6 }}>
          Just visited? Tap what it was like — takes about 10 seconds. Skip anything you're not sure about.
        </p>

        <input
          value={venueName}
          onChange={e => setVenueName(e.target.value)}
          placeholder="Place name (e.g. H-E-B on Bandera Rd)"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            borderRadius: RADIUS.lg,
            border: `1.5px solid ${COLORS.border}`,
            padding: '14px 16px',
            fontSize: 15,
            fontFamily: 'inherit',
            outline: 'none',
            background: COLORS.white,
            color: COLORS.text,
            marginBottom: 20,
          }}
        />

        {ATTRIBUTES.map(attr => (
          <div key={attr.key} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.forest, marginBottom: 8 }}>
              {attr.label}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {attr.options.map((opt, i) => {
                const value = i + 1
                const active = ratings[attr.key] === value
                return (
                  <button
                    key={opt}
                    onClick={() => setRating(attr.key, value)}
                    style={{
                      flex: 1,
                      background: active ? COLORS.pale : COLORS.white,
                      border: `1.5px solid ${active ? COLORS.mint : COLORS.border}`,
                      borderRadius: RADIUS.md,
                      padding: '12px 6px',
                      fontSize: 13,
                      fontWeight: active ? 700 : 500,
                      color: active ? COLORS.forest : COLORS.text,
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                    }}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {status === 'error' && (
          <div style={{
            background: COLORS.error,
            color: COLORS.errorText,
            borderRadius: RADIUS.md,
            padding: '10px 14px',
            fontSize: 13,
            marginTop: 8,
          }}>
            {errorMsg}
          </div>
        )}

        <PrimaryButton onClick={handleSubmit} disabled={!canSubmit}>
          {status === 'saving' ? 'Saving…' : `Submit report${ratedCount ? ` (${ratedCount})` : ''}`}
        </PrimaryButton>
        <div style={{ fontSize: 12, color: COLORS.muted, textAlign: 'center', marginTop: 10 }}>
          Your report is anonymous and helps the next visitor.
        </div>
      </Screen>
    </div>
  )
}
