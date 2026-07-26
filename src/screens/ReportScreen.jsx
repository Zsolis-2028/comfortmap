// ReportScreen.jsx
// The 10-second contribution flow — the real engine of ComfortMap.
// A visitor taps what a place was like; each tap becomes a Verified
// observation in the database. This is how the honest map fills up.

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { RADIUS } from '../styles/colors'
import Header from '../components/Header'
import Screen from '../components/Screen'
import { PrimaryButton } from '../components/Button'
import { submitReport } from '../lib/reports'
import { uploadVenuePhoto } from '../lib/photos'
import { uploadVenueVideo } from '../lib/videos'
import { searchPlaces } from '../lib/places'
import { track } from '@vercel/analytics'
import { ATTRIBUTES } from '../lib/attributes'
import { containsProfanity, PROFANITY_MESSAGE } from '../utils/moderation'

export default function ReportScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { COLORS } = useUser()

  const [venueName, setVenueName] = useState(location.state?.venueName || '')
  const [placeId, setPlaceId] = useState(null)     // canonical Google place id
  const [address, setAddress] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [ratings, setRatings] = useState({})
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState(null)         // selected File
  const [photoPreview, setPhotoPreview] = useState('') // object URL for thumbnail
  const [video, setVideo] = useState(null)         // selected video File
  const [videoPreview, setVideoPreview] = useState('') // object URL for the clip
  const [status, setStatus] = useState('idle') // idle | saving | done | error
  const [errorMsg, setErrorMsg] = useState('')

  // Debounced place search — only while no place is selected. If Places isn't
  // configured, searchPlaces returns [] and the field just works as plain text.
  useEffect(() => {
    if (placeId) return
    const q = venueName.trim()
    if (q.length < 3) { setSuggestions([]); return }
    let active = true
    const t = setTimeout(async () => {
      const results = await searchPlaces(q)
      if (active) setSuggestions(results)
    }, 300)
    return () => { active = false; clearTimeout(t) }
  }, [venueName, placeId])

  const onVenueNameChange = (v) => {
    setVenueName(v)
    // Typing means they're no longer bound to a previously picked place.
    if (placeId) { setPlaceId(null); setAddress('') }
  }

  const pickSuggestion = (s) => {
    setVenueName(s.name)
    setPlaceId(s.placeId)
    setAddress(s.address || '')
    setSuggestions([])
  }

  const setRating = (key, value) =>
    setRatings(prev => ({ ...prev, [key]: prev[key] === value ? undefined : value }))

  const onPickPhoto = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please choose an image file (JPG or PNG).')
      setStatus('error')
      return
    }
    if (file.size > 8 * 1024 * 1024) { // 8 MB cap
      setErrorMsg('That image is a bit large — please choose one under 8 MB.')
      setStatus('error')
      return
    }
    setStatus('idle')
    setErrorMsg('')
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const clearPhoto = () => {
    setPhoto(null)
    setPhotoPreview('')
  }

  const onPickVideo = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      setErrorMsg('Please choose a video file (MP4 or MOV).')
      setStatus('error')
      return
    }
    if (file.size > 50 * 1024 * 1024) { // 50 MB cap
      setErrorMsg('That video is a bit large — please keep it under 50 MB.')
      setStatus('error')
      return
    }
    // Check length (≤ 30s) before accepting, so clips stay short and cheap to host.
    const url = URL.createObjectURL(file)
    const probe = document.createElement('video')
    probe.preload = 'metadata'
    probe.onloadedmetadata = () => {
      if (probe.duration && probe.duration > 31) {
        URL.revokeObjectURL(url)
        setErrorMsg('Please keep the clip under 30 seconds.')
        setStatus('error')
        return
      }
      setStatus('idle')
      setErrorMsg('')
      setVideo(file)
      setVideoPreview(url)
    }
    probe.onerror = () => {
      URL.revokeObjectURL(url)
      setErrorMsg("Couldn't read that video — please try a different file.")
      setStatus('error')
    }
    probe.src = url
  }

  const clearVideo = () => {
    setVideo(null)
    setVideoPreview('')
  }

  const ratedCount = Object.values(ratings).filter(v => v != null).length
  const canSubmit = venueName.trim().length > 0 &&
    (ratedCount > 0 || note.trim().length > 0 || photo || video) && status !== 'saving'

  const handleSubmit = async () => {
    // Keep it clean for families: block profanity/slurs in the name or note.
    if (containsProfanity(venueName) || containsProfanity(note)) {
      setStatus('error')
      setErrorMsg(PROFANITY_MESSAGE)
      return
    }

    setStatus('saving')
    setErrorMsg('')
    try {
      const clean = Object.fromEntries(
        Object.entries(ratings).filter(([, v]) => v != null)
      )
      const { venueId } = await submitReport({
        venueName,
        category: location.state?.category || 'other',
        city: location.state?.city || 'San Antonio',
        ratings: clean,
        note,
        placeId,
        address,
      })

      // Optional photo — best-effort. It's saved as PENDING and won't show to
      // anyone until it's approved, so nothing inappropriate can slip through.
      // If the upload fails, the report itself is still saved (fail-open).
      if (photo && venueId) {
        try {
          await uploadVenuePhoto({ venueId, file: photo })
        } catch (photoErr) {
          console.warn('Photo upload failed (report still saved):', photoErr)
        }
      }

      // Optional short video — same best-effort, pending-review path as photos.
      if (video && venueId) {
        try {
          await uploadVenueVideo({ venueId, file: video })
        } catch (videoErr) {
          console.warn('Video upload failed (report still saved):', videoErr)
        }
      }

      track('report_submitted', { hasPhoto: Boolean(photo), hasVideo: Boolean(video) })
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Something went wrong saving your report.')
    }
  }

  if (status === 'done') {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.pale }}>
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
    <div style={{ minHeight: '100vh', background: COLORS.pale }}>
      <Header title="Rate this place" onBack={() => navigate(-1)} />
      <Screen>
        <p style={{ fontSize: 14, color: COLORS.muted, margin: '16px 0', lineHeight: 1.6 }}>
          Just visited? Tap what it was like — takes about 10 seconds. Skip anything you're not sure about.
        </p>

        <div style={{ position: 'relative', marginBottom: 20 }}>
          <input
            value={venueName}
            onChange={e => onVenueNameChange(e.target.value)}
            placeholder="Start typing a place… (e.g. Armadillo Burgers)"
            autoComplete="off"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              borderRadius: RADIUS.lg,
              border: `1.5px solid ${placeId ? COLORS.mint : COLORS.border}`,
              padding: '14px 16px',
              fontSize: 15,
              fontFamily: 'inherit',
              outline: 'none',
              background: COLORS.white,
              color: COLORS.text,
            }}
          />
          {placeId && address && (
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 6 }}>
              ✓ {address}
            </div>
          )}
          {suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 20,
              marginTop: 4,
              background: COLORS.white,
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: RADIUS.lg,
              overflow: 'hidden',
              boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
            }}>
              {suggestions.map((s, i) => (
                <button
                  key={s.placeId}
                  onClick={() => pickSuggestion(s)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: COLORS.white,
                    border: 'none',
                    borderTop: i > 0 ? `1px solid ${COLORS.border}` : 'none',
                    padding: '12px 14px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.forest }}>{s.name}</div>
                  {s.address && <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{s.address}</div>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick one-tap overall feel — the fast path. Maps to the sensory
            rating, so it stays in sync with the detailed row below. */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.forest, marginBottom: 8 }}>
            Overall, how did it feel?
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { value: 1, emoji: '😊', label: 'Comfortable' },
              { value: 2, emoji: '😐', label: 'Okay' },
              { value: 3, emoji: '😣', label: 'Tough' },
            ].map(o => {
              const active = ratings.sensory === o.value
              return (
                <button
                  key={o.value}
                  onClick={() => setRating('sensory', o.value)}
                  style={{
                    flex: 1,
                    background: active ? COLORS.pale : COLORS.white,
                    border: `1.5px solid ${active ? COLORS.mint : COLORS.border}`,
                    borderRadius: 16,
                    padding: '14px 6px',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    transition: 'all 0.12s',
                  }}
                >
                  <span style={{ fontSize: 30 }} aria-hidden="true">{o.emoji}</span>
                  <span style={{ fontSize: 12.5, fontWeight: active ? 700 : 500, color: active ? COLORS.forest : COLORS.text }}>
                    {o.label}
                  </span>
                </button>
              )
            })}
          </div>
          <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 8, lineHeight: 1.5 }}>
            One tap is enough to help. Add more detail below if you like.
          </div>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 14 }}>
          More detail <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span>
        </div>

        {ATTRIBUTES.filter(a => a.key !== 'sensory').map(attr => (
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

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.forest, marginBottom: 8 }}>
            Anything else worth knowing? <span style={{ fontWeight: 400, color: COLORS.muted }}>(optional)</span>
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            maxLength={280}
            rows={3}
            placeholder="e.g. smells like grease sometimes, cold inside, TVs are loud"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              borderRadius: RADIUS.lg,
              border: `1.5px solid ${COLORS.border}`,
              padding: '12px 14px',
              fontSize: 14,
              fontFamily: 'inherit',
              lineHeight: 1.5,
              outline: 'none',
              resize: 'vertical',
              background: COLORS.white,
              color: COLORS.text,
            }}
          />
          <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 6, lineHeight: 1.5 }}>
            The specifics a rating can't capture — the exact thing someone with that sensitivity would want to know.
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.forest, marginBottom: 8 }}>
            Add a photo <span style={{ fontWeight: 400, color: COLORS.muted }}>(optional)</span>
          </div>

          {photoPreview ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={photoPreview}
                alt="Selected"
                style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: RADIUS.lg, border: `1.5px solid ${COLORS.border}` }}
              />
              <button
                onClick={clearPhoto}
                aria-label="Remove photo"
                style={{
                  position: 'absolute', top: -8, right: -8, width: 26, height: 26,
                  borderRadius: '50%', border: 'none', background: COLORS.forest, color: '#fff',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer', lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              border: `1.5px dashed ${COLORS.border}`, borderRadius: RADIUS.lg,
              padding: '16px', fontSize: 14, fontWeight: 600, color: COLORS.forest,
              background: COLORS.white, cursor: 'pointer',
            }}>
              📸 Choose a photo
              <input type="file" accept="image/*" onChange={onPickPhoto} style={{ display: 'none' }} />
            </label>
          )}

          <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 6, lineHeight: 1.5 }}>
            A real photo helps the next visitor know what to expect. Please keep it appropriate — photos are reviewed before they appear.
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.forest, marginBottom: 8 }}>
            Add a short video <span style={{ fontWeight: 400, color: COLORS.muted }}>(optional)</span>
          </div>

          {videoPreview ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <video
                src={videoPreview}
                controls
                playsInline
                preload="metadata"
                style={{ width: 200, maxHeight: 240, borderRadius: RADIUS.lg, border: `1.5px solid ${COLORS.border}`, background: '#000' }}
              />
              <button
                onClick={clearVideo}
                aria-label="Remove video"
                style={{
                  position: 'absolute', top: -8, right: -8, width: 26, height: 26,
                  borderRadius: '50%', border: 'none', background: COLORS.forest, color: '#fff',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer', lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              border: `1.5px dashed ${COLORS.border}`, borderRadius: RADIUS.lg,
              padding: '16px', fontSize: 14, fontWeight: 600, color: COLORS.forest,
              background: COLORS.white, cursor: 'pointer',
            }}>
              🎬 Choose a short video
              <input type="file" accept="video/*" onChange={onPickVideo} style={{ display: 'none' }} />
            </label>
          )}

          <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 6, lineHeight: 1.5 }}>
            Up to 30 seconds. A quick clip of the entrance, the noise, or the vibe helps the next visitor. Reviewed before it appears.
          </div>
        </div>

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
