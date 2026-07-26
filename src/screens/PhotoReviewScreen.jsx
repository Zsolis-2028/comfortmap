// PhotoReviewScreen.jsx
// Founder-only moderation queue. Shows every PENDING photo with the place it
// belongs to, so the founder can SEE each one and Approve (make it public) or
// Reject (delete it) — nothing reaches families without a human look first.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { RADIUS } from '../styles/colors'
import Header from '../components/Header'
import Screen from '../components/Screen'
import NavBar from '../components/NavBar'
import { getPendingPhotos, approvePhoto, rejectPhoto } from '../lib/photos'

export default function PhotoReviewScreen() {
  const navigate = useNavigate()
  const { COLORS, plan } = useUser()
  const [photos, setPhotos] = useState(null) // null = loading
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  const isFounder = plan === 'founder'

  useEffect(() => {
    if (!isFounder) return
    let active = true
    getPendingPhotos()
      .then((list) => { if (active) setPhotos(list) })
      .catch((e) => { if (active) { setError(e.message || 'Could not load photos.'); setPhotos([]) } })
    return () => { active = false }
  }, [isFounder])

  const remove = (id) => setPhotos((prev) => (prev || []).filter((p) => p.id !== id))

  const onApprove = async (p) => {
    setBusyId(p.id); setError('')
    try { await approvePhoto(p.id); remove(p.id) }
    catch (e) { setError(e.message || 'Could not approve.') }
    setBusyId(null)
  }

  const onReject = async (p) => {
    setBusyId(p.id); setError('')
    try { await rejectPhoto(p.id, p.storagePath); remove(p.id) }
    catch (e) { setError(e.message || 'Could not reject.') }
    setBusyId(null)
  }

  if (!isFounder) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.pale }}>
        <Header title="Review photos" onBack={() => navigate('/settings')} />
        <Screen>
          <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 24, textAlign: 'center' }}>
            This area is for the ComfortMap founder account.
          </p>
        </Screen>
        <NavBar />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pale }}>
      <Header title="Review photos" onBack={() => navigate('/settings')} />
      <Screen>
        <p style={{ fontSize: 14, color: COLORS.muted, margin: '16px 0', lineHeight: 1.6 }}>
          Photos waiting for review. Approve to make one public, or reject to delete it. Nothing shows to anyone until you approve it.
        </p>

        {error && (
          <div style={{ background: COLORS.error, color: COLORS.errorText, borderRadius: RADIUS.md, padding: '10px 14px', fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}

        {photos === null ? (
          <div style={{ textAlign: 'center', color: COLORS.muted, fontSize: 14, padding: '32px 0' }}>Loading…</div>
        ) : photos.length === 0 ? (
          <div style={{
            background: COLORS.white, border: `1px solid ${COLORS.border}`, boxShadow: '0 2px 12px rgba(20,30,60,0.06)', borderRadius: 18,
            padding: '24px 18px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.forest }}>No photos waiting</div>
            <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>You're all caught up.</div>
          </div>
        ) : (
          photos.map((p) => (
            <div key={p.id} style={{
              background: COLORS.white, border: `1.5px solid ${COLORS.border}`, borderRadius: RADIUS.xl,
              padding: 12, marginBottom: 14,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.forest, marginBottom: 8 }}>{p.venueName}</div>
              <img
                src={p.url}
                alt={`Pending photo for ${p.venueName}`}
                style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: RADIUS.lg, border: `1px solid ${COLORS.border}` }}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button
                  onClick={() => onApprove(p)}
                  disabled={busyId === p.id}
                  style={{
                    flex: 1, border: 'none', borderRadius: RADIUS.lg, padding: '12px',
                    background: COLORS.success, color: COLORS.successText, fontWeight: 700, fontSize: 14,
                    cursor: busyId === p.id ? 'default' : 'pointer', opacity: busyId === p.id ? 0.6 : 1,
                  }}
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => onReject(p)}
                  disabled={busyId === p.id}
                  style={{
                    flex: 1, borderRadius: RADIUS.lg, padding: '12px',
                    background: COLORS.error, color: COLORS.errorText, border: 'none', fontWeight: 700, fontSize: 14,
                    cursor: busyId === p.id ? 'default' : 'pointer', opacity: busyId === p.id ? 0.6 : 1,
                  }}
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          ))
        )}

        <div style={{ height: 80 }} aria-hidden="true" />
      </Screen>
      <NavBar />
    </div>
  )
}
