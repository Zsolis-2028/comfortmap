// VenuePhotos.jsx
// Shows a swipeable strip of REAL, APPROVED photos for a place. Renders nothing
// until there are approved photos — so a venue with only pending (unreviewed)
// photos simply shows no strip, keeping the app safe by default.

import { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext'
import { RADIUS } from '../styles/colors'
import { getVenueState } from '../lib/reports'
import { getVenuePhotos } from '../lib/photos'

export default function VenuePhotos({ venueName, city = 'San Antonio' }) {
  const { COLORS } = useUser()
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    let active = true
    if (!venueName || !venueName.trim()) return
    getVenueState({ name: venueName, city })
      .then((state) => {
        if (!state || !state.venue) return []
        return getVenuePhotos({ venueId: state.venue.id })
      })
      .then((list) => { if (active) setPhotos(list || []) })
      .catch(() => { if (active) setPhotos([]) })
    return () => { active = false }
  }, [venueName, city])

  if (!photos.length) return null

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.forest, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        📸 Real photos from visitors
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
        {photos.map((p) => (
          <img
            key={p.id}
            src={p.url}
            alt="From a visitor"
            loading="lazy"
            style={{
              width: 150, height: 150, objectFit: 'cover',
              borderRadius: RADIUS.lg, border: `1.5px solid ${COLORS.border}`,
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}
