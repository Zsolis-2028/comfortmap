// api/places.js
// Server-side proxy to Google Places Autocomplete (New). Keeps the Google API
// key out of the browser (same posture as the Anthropic key). Returns a small
// list of place suggestions the report flow uses to give every place a
// canonical Google place_id — which is what kills duplicate venues.
//
// FAILS SOFT: if the key is missing, the query is short, or Google errors, it
// returns an empty list (HTTP 200) so the app quietly falls back to plain typed
// names. It can never block a report.

const ALLOWED_ORIGINS = new Set([
  'https://comfortmap.vercel.app',
  'https://comfortmap.app',
  'https://www.comfortmap.app',
  'http://localhost:5173',
])

const GOOGLE_URL = 'https://places.googleapis.com/v1/places:autocomplete'
const TIMEOUT_MS = 6000

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin
  // Same-origin GET requests don't send an Origin header, so only reject a
  // request from a KNOWN different origin. Cost is capped by the Google quota +
  // budget alert, so an occasional direct call is harmless.
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    sendJson(res, 403, { error: 'Origin not allowed.' })
    return
  }
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return }
  if (req.method !== 'GET') { sendJson(res, 405, { error: 'Method not allowed' }); return }

  const url = new URL(req.url, 'http://localhost')
  const q = (url.searchParams.get('q') || '').trim()
  const debug = url.searchParams.get('debug') === '1'
  if (q.length < 3) { sendJson(res, 200, { suggestions: [] }); return }

  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) {
    sendJson(res, 200, { suggestions: [], ...(debug ? { _debug: 'NO_KEY_IN_ENV' } : {}) })
    return
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const r = await fetch(GOOGLE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key },
      body: JSON.stringify({
        input: q,
        includedRegionCodes: ['us'],
        // Bias toward San Antonio so local places surface first.
        locationBias: {
          circle: { center: { latitude: 29.4241, longitude: -98.4936 }, radius: 50000.0 },
        },
      }),
      signal: controller.signal,
    })
    const data = await r.json()
    if (!r.ok) {
      // fail soft — but if ?debug=1, surface Google's actual error so we can see why.
      sendJson(res, 200, { suggestions: [], ...(debug ? { _debug: { status: r.status, error: data.error || data } } : {}) })
      return
    }

    const suggestions = (data.suggestions || [])
      .map((s) => s.placePrediction)
      .filter(Boolean)
      .map((p) => ({
        placeId: p.placeId,
        name: (p.structuredFormat && p.structuredFormat.mainText && p.structuredFormat.mainText.text)
          || (p.text && p.text.text) || '',
        address: (p.structuredFormat && p.structuredFormat.secondaryText && p.structuredFormat.secondaryText.text) || '',
      }))
      .filter((s) => s.placeId && s.name)

    sendJson(res, 200, { suggestions, ...(debug ? { _debug: { status: 200, rawCount: (data.suggestions || []).length } } : {}) })
  } catch (err) {
    sendJson(res, 200, { suggestions: [], ...(debug ? { _debug: { thrown: String(err && err.message || err) } } : {}) })
  } finally {
    clearTimeout(timeoutId)
  }
}
