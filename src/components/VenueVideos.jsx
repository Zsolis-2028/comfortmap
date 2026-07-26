// VenueVideos.jsx
// Shows REAL, APPROVED short clips for a place. Renders nothing until there are
// approved clips — so a venue with only pending (unreviewed) videos shows no
// strip, keeping the app safe by default. Mirrors VenuePhotos.jsx.

import { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext'
import { RADIUS } from '../styles/colors'
import { getVenueState } from '../lib/reports'
import { getVenueVideos } from '../lib/videos'

export default function VenueVideos({ venueName, city = 'San Antonio' }) {
  const { COLORS } = useUser()
  const [videos, setVideos] = useState([])

  useEffect(() => {
    let active = true
    if (!venueName || !venueName.trim()) return
    getVenueState({ name: venueName, city })
      .then((state) => {
        if (!state || !state.venue) return []
        return getVenueVideos({ venueId: state.venue.id })
      })
      .then((list) => { if (active) setVideos(list || []) })
      .catch(() => { if (active) setVideos([]) })
    return () => { active = false }
  }, [venueName, city])

  if (!videos.length) return null

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.forest, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        🎬 Real clips from visitors
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
        {videos.map((v) => (
          <video
            key={v.id}
            src={v.url}
            controls
            playsInline
            preload="metadata"
            style={{
              width: 220, height: 220, objectFit: 'cover',
              borderRadius: RADIUS.lg, border: `1.5px solid ${COLORS.border}`,
              flexShrink: 0, background: '#000',
            }}
          />
        ))}
      </div>
    </div>
  )
}
