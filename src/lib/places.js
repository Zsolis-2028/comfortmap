// src/lib/places.js
// Client helper for Google place search, via our own /api/places proxy so the
// key stays server-side. Returns [] on any problem, so the report flow always
// still works with a plain typed name.

export async function searchPlaces(query) {
  const q = (query || '').trim()
  if (q.length < 3) return []
  try {
    const r = await fetch(`/api/places?q=${encodeURIComponent(q)}`)
    if (!r.ok) return []
    const data = await r.json()
    return Array.isArray(data.suggestions) ? data.suggestions : []
  } catch {
    return []
  }
}
