// ExploreScreen.jsx
// Shows places that have REAL community reports — makes the honest, growing
// data visible and taps into the same result view. Only lists venues with at
// least one verified report; empty until people contribute.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { RADIUS } from '../styles/colors'
import Header from '../components/Header'
import Screen from '../components/Screen'
import NavBar from '../components/NavBar'
import { getMappedVenues } from '../lib/reports'
import { ATTRIBUTES } from '../lib/attributes'

export default function ExploreScreen() {
  const navigate = useNavigate()
  const { COLORS } = useUser()
  const [venues, setVenues] = useState(null) // null = loading
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    getMappedVenues({ city: 'San Antonio' })
      .then(v => { if (active) setVenues(v) })
      .catch(() => { if (active) setVenues([]) })
    return () => { active = false }
  }, [])

  const q = query.trim().toLowerCase()
  const filtered = (venues || []).filter(v => v.name.toLowerCase().includes(q))

  return (
    <div style={{ minHeight: '100vh', background: COLORS.soft }}>
      <Header title="Explore" />
      <Screen>
        <p style={{ fontSize: 14, color: COLORS.muted, margin: '16px 0', lineHeight: 1.6 }}>
          Places people have actually mapped in San Antonio — built from real visits, not guesses.
        </p>

        {venues && venues.length > 0 && (
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search mapped places…"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              borderRadius: RADIUS.lg,
              border: `1.5px solid ${COLORS.border}`,
              padding: '12px 14px',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none',
              background: COLORS.white,
              color: COLORS.text,
              marginBottom: 14,
            }}
          />
        )}

        {venues === null ? (
          <div style={{ textAlign: 'center', color: COLORS.muted, fontSize: 14, padding: '32px 0' }}>
            Loading…
          </div>
        ) : venues.length === 0 ? (
          <div style={{
            background: COLORS.pale,
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: RADIUS.xl,
            padding: '20px 18px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.forest, marginBottom: 6 }}>
              No places mapped yet
            </div>
            <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.5 }}>
              Search a place you've visited and add a quick report — you'll be the first to put it on the map.
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: COLORS.muted, fontSize: 13, padding: '24px 0' }}>
            No mapped places match “{query}”.
          </div>
        ) : (
          filtered.map(v => (
            <button
              key={v.id}
              onClick={() => navigate('/venue', { state: { venueName: v.name } })}
              style={{
                width: '100%',
                textAlign: 'left',
                background: COLORS.white,
                border: `1.5px solid ${COLORS.border}`,
                borderRadius: RADIUS.lg,
                padding: '14px 16px',
                marginBottom: 10,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.forest }}>{v.name}</span>
              <span style={{ fontSize: 12, color: COLORS.muted }}>
                ✅ {v.verifiedAttrs} of {ATTRIBUTES.length} details · {v.visits} {v.visits === 1 ? 'visit' : 'visits'}
              </span>
            </button>
          ))
        )}

        <div style={{ height: 80 }} aria-hidden="true" />
      </Screen>
      <NavBar />
    </div>
  )
}
