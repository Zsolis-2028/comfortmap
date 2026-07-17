// CommunityReports.jsx
// The read side of the truth engine: shows REAL, attributed observations for
// a venue — each marked VERIFIED, with how many people reported it and a
// "Mixed" flag when reports disagree. Unreported attributes say "No data yet".
// Renders nothing until there's at least one real report — we never fake a card.

import { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext'
import { RADIUS } from '../styles/colors'
import { getVenueState } from '../lib/reports'
import { ATTRIBUTES, labelForRating } from '../lib/attributes'

// Turn one attribute's raw reports into a display summary:
// the blended label, the count, and whether the crowd disagrees.
function summarize(stat, attr) {
  const { count, sum, dist } = stat
  const avg = sum / count
  const voted = [1, 2, 3].filter(v => dist[v] > 0)
  const dominant = Math.max(dist[1], dist[2], dist[3])
  const spread = voted.length ? voted[voted.length - 1] - voted[0] : 0
  // "Mixed" when 2+ people and either the answers span the full range
  // (someone said 1, someone said 3) or no single answer has a clear majority.
  const mixed = count >= 2 && (spread >= 2 || dominant / count < 0.6)
  const breakdown = voted.map(v => `${dist[v]} ${attr.options[v - 1]}`).join(' · ')
  return { label: labelForRating(attr, avg), count, mixed, breakdown }
}

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
  const byAttr = data.byAttr || {}
  const verifiedCount = ATTRIBUTES.filter(a => byAttr[a.key] && byAttr[a.key].count > 0).length
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
        const stat = byAttr[attr.key]
        const has = stat && stat.count > 0
        const s = has ? summarize(stat, attr) : null
        return (
          <div key={attr.key} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            padding: '10px 0',
            borderBottom: i < ATTRIBUTES.length - 1 ? `1px solid ${COLORS.border}` : 'none',
          }}>
            <span style={{ fontSize: 13, color: COLORS.forest, fontWeight: 600, paddingTop: 1 }}>{attr.label}</span>

            {!has ? (
              <span style={{ fontSize: 12, color: COLORS.muted }}>No data yet</span>
            ) : (
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                  <span style={{
                    fontSize: 13,
                    color: s.mixed ? COLORS.warnText : COLORS.text,
                    fontWeight: s.mixed ? 700 : 400,
                  }}>
                    {s.mixed ? 'Mixed' : s.label}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: COLORS.successText,
                    background: COLORS.success, borderRadius: RADIUS.pill, padding: '2px 8px',
                  }}>
                    VERIFIED
                  </span>
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 3 }}>
                  {s.count} report{s.count > 1 ? 's' : ''}{s.mixed ? ` · ${s.breakdown}` : ''}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
