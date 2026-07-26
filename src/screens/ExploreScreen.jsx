// ExploreScreen.jsx
// Shows places that have REAL community reports — the honest, growing data made
// visible. List or Map view, plus a filter sheet to narrow by type / how mapped.

import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { RADIUS } from '../styles/colors'
import Header from '../components/Header'
import Screen from '../components/Screen'
import NavBar from '../components/NavBar'
import MapView from '../components/MapView'
import { PrimaryButton } from '../components/Button'
import { getMappedVenues } from '../lib/reports'
import { ATTRIBUTES } from '../lib/attributes'

const CATEGORY_LABELS = {
  restaurant: '🍽️ Restaurant', bus: '🚌 Bus / Transit', gym: '🏋️ Gym', mall: '🛍️ Mall',
  airport: '✈️ Airport', hospital: '🏥 Hospital', school: '🏫 School', park: '🏖️ Park / Beach',
  cinema: '🎬 Cinema', office: '🏢 Office', hotel: '🏨 Hotel', worship: '⛪ Worship',
  stadium: '🏟️ Stadium', transit: '🚉 Train / Metro', grocery: '🛒 Grocery', bank: '🏦 Bank / Gov',
}
const catLabel = (c) => CATEGORY_LABELS[c] || (c ? c[0].toUpperCase() + c.slice(1) : 'Other')

const SORTS = [
  ['detailed', 'Most detailed'],
  ['visited', 'Most visited'],
  ['az', 'A – Z'],
]

export default function ExploreScreen() {
  const navigate = useNavigate()
  const { COLORS } = useUser()
  const [venues, setVenues] = useState(null) // null = loading
  const [query, setQuery] = useState('')
  const [view, setView] = useState('list') // list | map
  const [showFilters, setShowFilters] = useState(false)
  const [shuffleKey, setShuffleKey] = useState(0)

  // Filters
  const [cat, setCat] = useState(null)
  const [fullyMapped, setFullyMapped] = useState(false)
  const [sort, setSort] = useState('detailed')

  useEffect(() => {
    let active = true
    getMappedVenues({ city: 'San Antonio' })
      .then(v => { if (active) setVenues(v) })
      .catch(() => { if (active) setVenues([]) })
    return () => { active = false }
  }, [])

  const categories = useMemo(
    () => [...new Set((venues || []).map(v => v.category).filter(c => c && c !== 'other'))],
    [venues]
  )

  const q = query.trim().toLowerCase()
  const filtered = useMemo(() => {
    let list = (venues || []).filter(v => v.name.toLowerCase().includes(q))
    if (cat) list = list.filter(v => v.category === cat)
    if (fullyMapped) list = list.filter(v => v.verifiedAttrs >= ATTRIBUTES.length)
    const sorted = [...list]
    if (sort === 'visited') sorted.sort((a, b) => b.visits - a.visits || b.verifiedAttrs - a.verifiedAttrs)
    else if (sort === 'az') sorted.sort((a, b) => a.name.localeCompare(b.name))
    else sorted.sort((a, b) => b.verifiedAttrs - a.verifiedAttrs || b.visits - a.visits)
    return sorted
  }, [venues, q, cat, fullyMapped, sort])

  const activeFilterCount = (cat ? 1 : 0) + (fullyMapped ? 1 : 0) + (sort !== 'detailed' ? 1 : 0)

  // Default browse shows a fresh random 5 so the list never feels overwhelming.
  // Searching or filtering reaches every mapped place, not just the sample.
  const isBrowsing = q === '' && activeFilterCount === 0
  const displayList = useMemo(() => {
    if (!isBrowsing) return filtered
    const arr = [...filtered]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr.slice(0, 5)
  }, [filtered, isBrowsing, shuffleKey])
  const placeCount = (venues || []).length
  const visitCount = (venues || []).reduce((n, v) => n + (v.visits || 0), 0)

  const card = {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 2px 12px rgba(20,30,60,0.06)',
    borderRadius: 18,
  }

  const segBtn = (active) => ({
    flex: 1,
    padding: '9px 0',
    borderRadius: 999,
    border: 'none',
    background: active ? COLORS.white : 'transparent',
    color: active ? COLORS.forest : COLORS.muted,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: active ? '0 1px 4px rgba(20,30,60,0.12)' : 'none',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pale }}>
      <Header title="Explore" />
      <Screen>
        <p style={{ fontSize: 14, color: COLORS.muted, margin: '16px 0', lineHeight: 1.6 }}>
          Places people have actually mapped in San Antonio — built from real visits, not guesses.
        </p>

        {placeCount > 0 && (
          <div style={{ ...card, padding: '12px 14px', marginBottom: 16, fontSize: 13, fontWeight: 700, color: COLORS.forest, textAlign: 'center' }}>
            🌱 {placeCount} {placeCount === 1 ? 'place' : 'places'} · {visitCount} real {visitCount === 1 ? 'visit' : 'visits'} mapped in San Antonio
          </div>
        )}

        <PrimaryButton onClick={() => navigate('/report')} style={{ marginBottom: 16 }}>
          ➕ Add a place you've been
        </PrimaryButton>

        {/* List / Map toggle + Filters */}
        {placeCount > 0 && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', flex: 1, background: COLORS.pale, borderRadius: 999, padding: 4, border: `1px solid ${COLORS.border}` }}>
              <button style={segBtn(view === 'list')} onClick={() => setView('list')}>List</button>
              <button style={segBtn(view === 'map')} onClick={() => setView('map')}>Map</button>
            </div>
            <button
              onClick={() => setShowFilters(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: activeFilterCount ? COLORS.forest : COLORS.white,
                color: activeFilterCount ? '#fff' : COLORS.forest,
                border: `1px solid ${activeFilterCount ? COLORS.forest : COLORS.border}`,
                borderRadius: 999, padding: '9px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}
            >
              ⚙︎ Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
            </button>
          </div>
        )}

        {venues === null ? (
          <div style={{ textAlign: 'center', color: COLORS.muted, fontSize: 14, padding: '32px 0' }}>Loading…</div>
        ) : venues.length === 0 ? (
          <div style={{ ...card, padding: '20px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.forest, marginBottom: 6 }}>No places mapped yet</div>
            <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.5 }}>
              Search a place you've visited and add a quick report — you'll be the first to put it on the map.
            </div>
          </div>
        ) : view === 'map' ? (
          <MapView venues={filtered} onPick={(v) => navigate('/venue', { state: { venueName: v.name } })} COLORS={COLORS} />
        ) : (
          <>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search mapped places…"
              style={{
                width: '100%', boxSizing: 'border-box', borderRadius: RADIUS.lg,
                border: `1.5px solid ${COLORS.border}`, padding: '12px 14px', fontSize: 14,
                fontFamily: 'inherit', outline: 'none', background: COLORS.white, color: COLORS.text, marginBottom: 14,
              }}
            />
            {isBrowsing && filtered.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 2px 12px' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.forest }}>A few places to explore</span>
                {filtered.length > 5 && (
                  <button
                    onClick={() => setShuffleKey(k => k + 1)}
                    style={{ background: 'none', border: 'none', color: COLORS.forest, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: 0.85 }}
                  >
                    🔀 Shuffle
                  </button>
                )}
              </div>
            )}
            {displayList.length === 0 ? (
              <div style={{ textAlign: 'center', color: COLORS.muted, fontSize: 13, padding: '24px 0' }}>
                No mapped places match your search or filters.
              </div>
            ) : (
              displayList.map(v => (
                <button
                  key={v.id}
                  onClick={() => navigate('/venue', { state: { venueName: v.name } })}
                  style={{
                    width: '100%', textAlign: 'left', ...card, borderRadius: 16,
                    padding: '15px 16px', marginBottom: 12, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', gap: 4,
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.forest }}>{v.name}</span>
                  <span style={{ fontSize: 12, color: COLORS.muted }}>
                    ✅ {v.verifiedAttrs} of {ATTRIBUTES.length} details · {v.visits} {v.visits === 1 ? 'visit' : 'visits'}
                  </span>
                </button>
              ))
            )}
          </>
        )}

        <div style={{ height: 80 }} aria-hidden="true" />
      </Screen>

      {/* Filter sheet */}
      {showFilters && (
        <div
          onClick={() => setShowFilters(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(20,24,42,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: COLORS.white, width: '100%', maxWidth: 480,
              borderRadius: '22px 22px 0 0', padding: '20px 20px 28px',
              maxHeight: '80vh', overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.forest }}>Filters</div>
              <button
                onClick={() => { setCat(null); setFullyMapped(false); setSort('detailed') }}
                style={{ background: 'none', border: 'none', color: COLORS.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Clear all
              </button>
            </div>

            {categories.length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.forest, marginBottom: 10 }}>Place type</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
                  {categories.map(c => {
                    const active = cat === c
                    return (
                      <button
                        key={c}
                        onClick={() => setCat(active ? null : c)}
                        style={{
                          background: active ? COLORS.pale : COLORS.white,
                          border: `1.5px solid ${active ? COLORS.mint : COLORS.border}`,
                          borderRadius: 999, padding: '8px 14px', fontSize: 13,
                          fontWeight: active ? 700 : 500, color: COLORS.forest, cursor: 'pointer',
                        }}
                      >
                        {catLabel(c)}
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.forest, marginBottom: 10 }}>Sort by</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
              {SORTS.map(([key, label]) => {
                const active = sort === key
                return (
                  <button
                    key={key}
                    onClick={() => setSort(key)}
                    style={{
                      background: active ? COLORS.pale : COLORS.white,
                      border: `1.5px solid ${active ? COLORS.mint : COLORS.border}`,
                      borderRadius: 999, padding: '8px 14px', fontSize: 13,
                      fontWeight: active ? 700 : 500, color: COLORS.forest, cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setFullyMapped(f => !f)}
              style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: COLORS.white, border: `1.5px solid ${fullyMapped ? COLORS.mint : COLORS.border}`,
                borderRadius: 14, padding: '14px 16px', marginBottom: 22, cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.forest }}>Only fully mapped (7 of 7)</span>
              <span style={{
                width: 44, height: 26, borderRadius: 999, background: fullyMapped ? COLORS.mint : COLORS.border,
                position: 'relative', transition: 'background 0.15s', flexShrink: 0,
              }}>
                <span style={{
                  position: 'absolute', top: 3, left: fullyMapped ? 21 : 3, width: 20, height: 20,
                  borderRadius: '50%', background: '#fff', transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </span>
            </button>

            <PrimaryButton onClick={() => setShowFilters(false)}>
              Show {filtered.length} {filtered.length === 1 ? 'place' : 'places'}
            </PrimaryButton>
          </div>
        </div>
      )}

      <NavBar />
    </div>
  )
}
