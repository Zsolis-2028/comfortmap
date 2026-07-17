// CommunityReports.jsx
// The read side of the truth engine: shows REAL, attributed observations for
// a venue, each marked VERIFIED. Attributes with no reports say "No data yet"
// — we never fake a full card. Renders nothing until there's at least one
// verified report, so it only appears when there's real truth to show.

import { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext'
import { RADIUS } from '../styles/colors'
import { getVenueState } from '../lib/reports'
import { ATTRIBUTES, labelForRating } from '../lib/attributes'

export default function CommunityReports({ venueName, city = 'San Antonio' }) {
  const { COLORS } = useUser()
  const [data, setData] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    if (!venueName || !venueName.trim()) { setLoaded(true); return }
    getVenueState({ name: venueName, city })
      .then(res => { if (active) { setData(res); setLoaded(true) } })
      .catch(() => { if (active) setLoaded(true) })
    return () => { active = false }
  }, [venueName, city])

  if (!loaded || !data) return null

  const stateByAttr = {}
  ;(data.states || []).forEach(s => { stateByAttr[s.attribute] = s })
  const verifiedCount = (data.states || []).filter(s => s.shown_confidence === 'verified').length
  if (verifiedCount === 0) return null // never fake a full card

  return (
    <div style={{
      background: COLORS.white,
      border: `1.5px solid ${COLORS.mint}`,
      borderRadius: RADIUS.xl,
      padding: '18px 18px 8px',
      marginTop: 16,
    }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.forest, textTransform: 'uppercase', letterSpacing: 1 }}>
        ✅ From real visits
      </div>
      <div style={{ fontSize: 12, color: COLORS.muted, margin: '4px 0 12px' }}>
        {verifiedCount} of {ATTRIBUTES.length} details confirmed by people who've actually been here.
      </div>

      {ATTRIBUTES.map((attr, i) => {
        const st = stateByAttr[attr.key]
        const verified = st && st.shown_confidence === 'verified'
        return (
          <div key={attr.key} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '9px 0',
            borderBottom: i < ATTRIBUTES.length - 1 ? `1px solid ${COLORS.border}` : 'none',
          }}>
            <span style={{ fontSize: 13, color: COLORS.forest, fontWeight: 600 }}>{attr.label}</span>
            {verified ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: COLORS.text }}>{labelForRating(attr, st.avg_rating)}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: COLORS.successText,
                  background: COLORS.success, borderRadius: RADIUS.pill, padding: '2px 8px',
                }}>
                  VERIFIED
                </span>
              </span>
            ) : (
              <span style={{ fontSize: 12, color: COLORS.muted }}>No data yet</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
