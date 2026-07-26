// HomeScreen.jsx — sensory badges now show translated labels

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { VENUES, getVenueLabel } from '../data/venues'
import { SENSORY_OPTIONS, getSensoryLabel } from '../data/sensoryOptions'
import { getText } from '../data/languages'
import { RADIUS } from '../styles/colors'
import { PrimaryButton } from '../components/Button'
import Screen from '../components/Screen'
import NavBar from '../components/NavBar'
import OnboardingTour from '../components/OnboardingTour'
import InstallPrompt from '../components/InstallPrompt'

const WELCOME_STORAGE_KEY = 'cm_welcome_seen'

// Soft per-category icon tints — keeps the grid calm but easier to scan.
const VENUE_TINTS = {
  restaurant: '#FFEDD5', bus: '#DBEAFE', gym: '#FEE2E2', mall: '#FCE7F3',
  airport: '#E0F2FE', hospital: '#FFE4E6', school: '#FEF3C7', park: '#DCFCE7',
  cinema: '#EDE9FE', office: '#E2E8F0', hotel: '#E0E7FF', worship: '#F3E8FF',
  stadium: '#CCFBF1', transit: '#CFFAFE', grocery: '#ECFCCB', bank: '#E7E5E4',
}

export default function HomeScreen() {
  const navigate = useNavigate()
  const { lang, sensory, COLORS, signedIn, plan } = useUser()
  const t = getText(lang)
  const [input, setInput] = useState('')
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [showWelcome, setShowWelcome] = useState(() => localStorage.getItem(WELCOME_STORAGE_KEY) !== 'true')

  const dismissWelcome = () => {
    localStorage.setItem(WELCOME_STORAGE_KEY, 'true')
    setShowWelcome(false)
  }

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

  const card = {
    background: COLORS.white,
    borderRadius: 18,
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 2px 12px rgba(20,30,60,0.06)',
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pale }}>
      {showWelcome && <OnboardingTour onDone={dismissWelcome} />}
      {!showWelcome && <InstallPrompt />}
      <Screen>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 0 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <img src="/icons/icon-192.png" alt="" width={28} height={28} style={{ borderRadius: 8 }} />
            <span style={{ fontSize: 17, fontWeight: 700, color: COLORS.forest }}>ComfortMap</span>
          </div>
          <button
            onClick={() => navigate(signedIn ? '/settings' : '/auth')}
            style={{
              background: COLORS.white,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.forest,
              borderRadius: 999,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {signedIn ? '👤 Account' : (t.signInShort || 'Sign in')}
          </button>
        </div>

        {/* Hero card */}
        <div style={{ ...card, padding: '22px 20px' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.forest, letterSpacing: -0.5, marginBottom: 6 }}>
            {t.whereGoing || 'Where are you going?'}
          </div>
          <div style={{ fontSize: 14, color: COLORS.muted, marginBottom: 16 }}>
            {t.prepareYou || "Tell us about the place. We'll prepare you."}
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t.describePlaceholder || "Describe where you're going..."}
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

          {plan !== 'free' && (
            <div style={{ textAlign: 'center', fontSize: 12, color: COLORS.muted, marginTop: 10 }}>
              ✨ Unlimited maps
            </div>
          )}
        </div>

        {/* Sensory badges — translated */}
        {sensory.length > 0 && (
          <div style={{
            ...card,
            marginTop: 16,
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.forest, marginBottom: 8 }}>
              {t.sensoryActive || '✓ Sensory profile active'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {sensory.map(key => {
                const opt = SENSORY_OPTIONS.find(o => o.key === key)
                return opt ? (
                  <span key={key} style={{
                    fontSize: 12,
                    background: COLORS.pale,
                    borderRadius: '999px',
                    padding: '4px 11px',
                    color: COLORS.forest,
                    border: `1px solid ${COLORS.border}`,
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
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 16,
                  boxShadow: '0 2px 12px rgba(20,30,60,0.06)',
                  padding: '16px 10px',
                  minHeight: 120,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(20,30,60,0.10)'
                  e.currentTarget.style.borderColor = COLORS.mint
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(20,30,60,0.06)'
                  e.currentTarget.style.borderColor = COLORS.border
                }}
              >
                <span style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: VENUE_TINTS[venue.key] || COLORS.pale,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                }}>
                  {venue.emoji}
                </span>
                <span style={{ fontSize: 12.5, color: COLORS.forest, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>
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
