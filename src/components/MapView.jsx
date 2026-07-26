// MapView.jsx
// A real interactive map for Explore. Loads Leaflet + OpenStreetMap from CDN at
// runtime (no npm install, no API key) and drops a real pin for each mapped
// place by geocoding its name (OpenStreetMap Nominatim), cached in localStorage
// so repeat views are instant. Places we can't locate simply aren't pinned —
// staying honest, never faking a position.

import { useEffect, useRef, useState } from 'react'

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
const SA_CENTER = [29.4241, -98.4936] // San Antonio
const ACCENT = '#4A90D9'

function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L)
    if (!document.querySelector('link[data-leaflet]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = LEAFLET_CSS
      link.setAttribute('data-leaflet', '1')
      document.head.appendChild(link)
    }
    let s = document.querySelector('script[data-leaflet]')
    if (s && window.L) return resolve(window.L)
    if (!s) {
      s = document.createElement('script')
      s.src = LEAFLET_JS
      s.async = true
      s.setAttribute('data-leaflet', '1')
      document.body.appendChild(s)
    }
    s.addEventListener('load', () => resolve(window.L))
    s.addEventListener('error', reject)
  })
}

async function geocode(name) {
  const key = 'cm_geo_' + name.toLowerCase().trim()
  try {
    const cached = localStorage.getItem(key)
    if (cached != null) return JSON.parse(cached)
  } catch { /* ignore */ }
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(name + ', San Antonio, Texas, USA')}`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const data = await res.json()
    const p = data && data.length ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } : null
    try { localStorage.setItem(key, JSON.stringify(p)) } catch { /* ignore */ }
    return p
  } catch {
    return null
  }
}

export default function MapView({ venues, onPick, COLORS }) {
  const ref = useRef(null)
  const mapRef = useRef(null)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [pinned, setPinned] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false

    loadLeaflet().then(async (L) => {
      if (cancelled || !ref.current) return
      const map = L.map(ref.current, { scrollWheelZoom: false }).setView(SA_CENTER, 11)
      mapRef.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)
      setStatus('ready')

      const bounds = []
      for (const v of venues) {
        if (cancelled) break
        const p = await geocode(v.name)
        if (cancelled) break
        if (!p) continue
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:20px;height:20px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${ACCENT};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 18],
        })
        const m = L.marker([p.lat, p.lon], { icon, title: v.name }).addTo(map)
        m.bindPopup(`<b>${v.name}</b><br>${v.verifiedAttrs} of 7 details · ${v.visits} ${v.visits === 1 ? 'visit' : 'visits'}`)
        m.on('click', () => onPick(v))
        bounds.push([p.lat, p.lon])
        setPinned(n => n + 1)
        if (!cancelled) map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 })
        // Be polite to the free geocoder (≈1 request/second); cached names skip this.
        await new Promise(r => setTimeout(r, 1100))
      }
      if (!cancelled) setDone(true)
    }).catch(() => { if (!cancelled) setStatus('error') })

    return () => {
      cancelled = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [venues])

  return (
    <div>
      <div
        ref={ref}
        style={{
          height: 440,
          width: '100%',
          borderRadius: 18,
          overflow: 'hidden',
          border: `1px solid ${COLORS.border}`,
          background: COLORS.white,
        }}
      />
      <div style={{ fontSize: 12, color: COLORS.muted, textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
        {status === 'error'
          ? 'Map could not load — check your connection and try again.'
          : !done
            ? `📍 Placing pins… ${pinned} of ${venues.length} located`
            : `📍 ${pinned} of ${venues.length} places pinned · tap a pin to open it`}
      </div>
    </div>
  )
}
