// HomeScreen.jsx — sensory badges now show translated labels

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { VENUES, getVenueLabel } from '../data/venues'
import { SENSORY_OPTIONS, getSensoryLabel } from '../data/sensoryOptions'
import { getText } from '../data/languages'
import { RADIUS, BRAND_GRADIENT } from '../styles/colors'
import { PrimaryButton } from '../components/Button'
import Screen from '../components/Screen'
import NavBar from '../components/NavBar'

export default function HomeScreen() {
  const navigate = useNavigate()
  const { lang, sensory, COLORS } = useUser()
  const t = getText(lang)
  const [input, setInput] = useState('')
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')

  const handleSubmit = () => {
    if (!input.trim()) return
    navigate('/input', { state: { freeText: input } })
  }

  const handleVenuePick = (venue) => {
    navigate('/input', { state: { venue } })
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t.locationUnsupported || "Your browser doesn't support location access.")
      return
    }
    setLocating(true)
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
          if (!res.ok) throw new Error('lookup failed')
          const data = await res.json()
          const city = data.city || data.locality
          const state = data.principalSubdivision
          const place = [city, state].filter(Boolean).join(', ')
          if (place) {
            setInput(prev => prev.trim() ? `${prev.trim()} ${place}` : place)
          } else {
            setLocationError(t.locationUnavailable || "Couldn't determine your city. Please type it instead.")
          }
        } catch {
          setLocationError(t.locationUnavailable || "Couldn't determine your city. Please type it instead.")
        }
        setLocating(false)
      },
      (err) => {
        setLocating(false)
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError(t.locationDenied || 'Location access denied. You can type your location instead.')
        } else if (err.code === err.TIMEOUT) {
          setLocationError(t.locationTimeout || 'Location request timed out. Please type your location instead.')
        } else {
          setLocationError(t.locationUnavailable || "Couldn't determine your location. Please type it instead.")
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.soft }}>
      <div style={{
        background: BRAND_GRADIENT,
        color: 'white',
        padding: '32px 20px 28px',
      }}>
        <div style={{ fontSize: 12, opacity: 0.65, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>
          🗺️ ComfortMap
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 6 }}>
          {t.whereGoing || 'Where are you going?'}
        </div>
        <div style={{ fontSize: 14, opacity: 0.8 }}>
          {t.prepareYou || "Tell us about the place. We'll prepare you."}
        </div>
      </div>

      <Screen>
        <div style={{ marginTop: 20 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={"Describe where you're going..."}
            rows={4}
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
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSubmit() }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              onClick={handleUseLocation}
              disabled={locating}
              style={{
                background: 'none',
                border: 'none',
                color: COLORS.forest,
                fontSize: 13,
                fontWeight: 600,
                cursor: locating ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 2px',
                opacity: locating ? 0.7 : 1,
              }}
            >
              {locating ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    border: `2px solid ${COLORS.border}`,
                    borderTopColor: COLORS.forest,
                    borderRadius: '50%',
                    animation: 'cm-spin 0.7s linear infinite',
                  }} />
                  {t.locating || 'Locating…'}
                </>
              ) : (
                <>📍 {t.useMyLocation || 'Use my location'}</>
              )}
            </button>
          </div>
          {locationError && (
            <div style={{ fontSize: 12, color: COLORS.errorText, marginTop: 4, textAlign: 'right' }}>
              {locationError}
            </div>
          )}
          <style>{`@keyframes cm-spin{to{transform:rotate(360deg)}}`}</style>

          <PrimaryButton onClick={handleSubmit} disabled={!input.trim()}>
            {t.buildMap || 'Build My Comfort Map →'}
          </PrimaryButton>
        </div>

        {/* Sensory badges — translated */}
        {sensory.length > 0 && (
          <div style={{
            marginTop: 16,
            background: COLORS.warn,
            border: `1px solid ${COLORS.warnBorder}`,
            borderRadius: RADIUS.md,
            padding: '10px 14px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.warnText, marginBottom: 6 }}>
              {t.sensoryActive || '✓ Sensory profile active'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {sensory.map(key => {
                const opt = SENSORY_OPTIONS.find(o => o.key === key)
                return opt ? (
                  <span key={key} style={{
                    fontSize: 12,
                    background: COLORS.white,
                    borderRadius: '999px',
                    padding: '3px 10px',
                    color: COLORS.warnText,
                    border: `1px solid ${COLORS.warnBorder}`,
                  }}>
                    {opt.emoji} {getSensoryLabel(opt, lang)}
                  </span>
                ) : null
              })}
            </div>
          </div>
        )}

        {/* Venue grid */}
        <div style={{ marginTop: 28 }}>
          <div style={{
            fontSize: 12,
            color: COLORS.muted,
            letterSpacing: 1,
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 12,
          }}>
            {t.pickPlace || 'Or pick a place type'}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 10,
          }}>
            {VENUES.map(venue => (
              <button
                key={venue.key}
                onClick={() => handleVenuePick(venue)}
                style={{
                  background: COLORS.white,
                  border: `1.5px solid ${COLORS.border}`,
                  borderRadius: RADIUS.md,
                  padding: '14px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = COLORS.soft}
                onMouseLeave={e => e.currentTarget.style.background = COLORS.white}
              >
                <span style={{ fontSize: 28 }}>{venue.emoji}</span>
                <span style={{ fontSize: 12, color: COLORS.text, fontWeight: 500, textAlign: 'center', lineHeight: 1.3 }}>
                  {getVenueLabel(venue, lang)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Screen>
      <NavBar />
    </div>
  )
}
