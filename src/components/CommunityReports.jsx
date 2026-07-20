// CommunityReports.jsx
// The read side of the truth engine. Three honest states:
//   • Verified — real reports exist: show them, with counts and a "Mixed"
//     flag when people disagree.
//   • Empty    — no real reports yet: say so plainly and invite the first one,
//     rather than pretending the AI estimate below is confirmed.
// Renders nothing only while still loading or with no place to look up.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
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

  if (!loaded || !venueName || !venueName.trim()) return null

  const byAttr = (data && data.byAttr) || {}
  const verifiedCount = ATTRIBUTES.filter(a => byAttr[a.key] && byAttr[a.key].count > 0).length

  // ---- Empty state: no real reports yet — be honest, invite the first ----
  if (verifiedCount === 0) {
    return (
      <div style={{
        background: COLORS.pale,
        border: `1.5px solid ${COLORS.border}`,
        borderRadius: RADIUS.xl,
        padding: '16px 18px',
        marginTop: 16,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.forest, marginBottom: 4 }}>
          🌱 No real visits logged here yet
        </div>
        <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.5, marginBottom: 12 }}>
          The map below is an AI estimate — helpful, but not confirmed. If you've been here,
          you can make it real for the next person in about 10 seconds.
        </div>
        <button
          onClick={() => navigate('/report', { state: { venueName } })}
          style={{
            width: '100%',
            background: COLORS.white,
            border: `1.5px solid ${COLORS.mint}`,
            borderRadius: RADIUS.lg,
            padding: '12px',
            fontSize: 14,
            fontWeight: 700,
            color: COLORS.forest,
            cursor: 'pointer',
          }}
        >
          📝 Be the first to add a real report →
        </button>
      </div>
    )
  }

  // ---- Verified state: show the real reports ----
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

      {data && data.notes && data.notes.length > 0 && (
        <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 4, paddingTop: 12, paddingBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.forest, marginBottom: 8 }}>
            💬 What visitors mentioned
          </div>
          {data.notes.slice(0, 5).map((n, i) => (
            <div key={i} style={{
              fontSize: 13,
              color: COLORS.text,
              lineHeight: 1.5,
              marginBottom: 8,
              paddingLeft: 12,
              borderLeft: `2px solid ${COLORS.mint}`,
            }}>
              “{n.text}”
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
