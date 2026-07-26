// OnboardingTour.jsx
// Sociability-style first-run tour. Progress segments up top, big bold heading,
// calm subtitle, a soft illustration block, and Previous / Skip / Next controls.
// Self-contained: pass onDone to close it (Home stores the "seen" flag).

import { useState } from 'react'
import { useUser } from '../context/UserContext'
import { BRAND_GRADIENT } from '../styles/colors'

const ACCENT = '#4A90D9' // keeps ComfortMap blue, Sociability-clean

const SLIDES = [
  {
    emoji: '🗺️',
    tint: '#E0F2FE',
    title: 'Know before you go',
    body: "Build a comfort map for any place — what to expect with noise, crowds, lighting, and sensory details, so you feel prepared before you arrive.",
  },
  {
    emoji: '✅',
    tint: '#DCFCE7',
    title: 'Built from real visits',
    body: "See details verified by people who've actually been there — not guesses. Look for the green check to know it's confirmed by the community.",
  },
  {
    emoji: '🎯',
    tint: '#EDE9FE',
    title: 'Tailored to what matters to you',
    body: "Set your sensory profile once, and every comfort map leads with the things that affect you most.",
  },
  {
    emoji: '📷',
    tint: '#FFEDD5',
    title: 'Help the next person',
    body: "Been somewhere? Share a quick report and a photo. Every visit you add makes the map more real for someone else.",
  },
]

export default function OnboardingTour({ onDone }) {
  const { COLORS } = useUser()
  const [i, setI] = useState(0)
  const slide = SLIDES[i]
  const last = i === SLIDES.length - 1

  const next = () => (last ? onDone() : setI(i + 1))
  const prev = () => setI(Math.max(0, i - 1))

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to ComfortMap"
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(20,24,42,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{
        background: COLORS.white,
        borderRadius: 24,
        width: '100%', maxWidth: 420,
        padding: '22px 22px 20px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
      }}>
        {/* Progress segments + Skip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div style={{ display: 'flex', gap: 6, flex: 1 }}>
            {SLIDES.map((_, idx) => (
              <div key={idx} style={{
                height: 5, flex: 1, borderRadius: 999,
                background: idx <= i ? ACCENT : COLORS.border,
                transition: 'background 0.2s',
              }} />
            ))}
          </div>
          <button
            onClick={onDone}
            style={{ background: 'none', border: 'none', color: ACCENT, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Skip
          </button>
        </div>

        {/* Illustration */}
        <div style={{
          height: 180,
          borderRadius: 18,
          background: slide.tint,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 76, marginBottom: 22,
        }}>
          <span aria-hidden="true">{slide.emoji}</span>
        </div>

        {/* Copy */}
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.forest, letterSpacing: -0.5, lineHeight: 1.2, margin: '0 0 10px' }}>
          {slide.title}
        </h2>
        <p style={{ fontSize: 15, color: COLORS.muted, lineHeight: 1.6, margin: '0 0 24px' }}>
          {slide.body}
        </p>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={prev}
            disabled={i === 0}
            style={{
              background: 'none', border: 'none',
              color: i === 0 ? 'transparent' : COLORS.forest,
              fontSize: 15, fontWeight: 600,
              cursor: i === 0 ? 'default' : 'pointer',
              padding: '12px 4px',
            }}
          >
            Previous
          </button>
          <button
            onClick={next}
            style={{
              flex: 1,
              background: BRAND_GRADIENT,
              color: '#fff', border: 'none',
              borderRadius: 12, padding: '15px',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {last ? 'Start exploring →' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
