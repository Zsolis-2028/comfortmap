// VenueScreen.jsx
// A free, read-only view of a place's real community reports (reached from
// Explore). Browsing verified data costs nothing and no AI call — generating
// the full comfort map is an explicit, opt-in action.

import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import Header from '../components/Header'
import Screen from '../components/Screen'
import NavBar from '../components/NavBar'
import { PrimaryButton, GhostButton } from '../components/Button'
import CommunityReports from '../components/CommunityReports'
import VenuePhotos from '../components/VenuePhotos'

export default function VenueScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { COLORS } = useUser()
  const venueName = location.state?.venueName || ''

  useEffect(() => {
    if (!venueName) navigate('/explore')
  }, [venueName, navigate])

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pale }}>
      <Header title={venueName || 'Place'} onBack={() => navigate(-1)} />
      <Screen>
        <VenuePhotos venueName={venueName} />
        <CommunityReports venueName={venueName} />

        <div style={{ marginTop: 20 }}>
          <PrimaryButton onClick={() => navigate('/result', { state: { prompt: venueName } })}>
            Build full comfort map →
          </PrimaryButton>
          <GhostButton onClick={() => navigate('/report', { state: { venueName } })}>
            📝 Been here? Add a report
          </GhostButton>
        </div>

        <p style={{ fontSize: 12, color: COLORS.muted, textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
          The reports above are free to browse. Building the full comfort map adds tips and a step-by-step of what to expect.
        </p>

        <div style={{ height: 80 }} aria-hidden="true" />
      </Screen>
      <NavBar />
    </div>
  )
}
