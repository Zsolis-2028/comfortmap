// src/lib/reports.js
// The write side of the truth engine: turn a visitor's taps into real,
// attributed observations in Supabase.
//
// Every observation saved here is source='user_report', confidence='verified' —
// a real person, really there. This is the data the whole product stands on.

import { supabase } from './supabaseClient'
import { ATTRIBUTES, labelForRating } from './attributes'

// Make sure we have an auth session so Row Level Security lets us write.
// We use anonymous sign-in: the visitor silently gets a real (anonymous)
// account so their reports are attributed, with zero signup friction.
export async function ensureSignedIn() {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) return session.user
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return data.user
}

// Find an existing venue, or create it. Returns the venue id.
// Dedup priority: a Google place_id is a canonical identity, so if we have one
// we match on it first — that's what makes "Back Unturned" and "Back Unturned
// Brewery" resolve to the SAME place. Falls back to a case-insensitive name
// match for places typed in manually (no place_id).
export async function findOrCreateVenue({ name, category = 'other', city = 'San Antonio', placeId = null, address = null }) {
  const cleanName = name.trim()

  if (placeId) {
    const { data: byPlace, error: pErr } = await supabase
      .from('venues')
      .select('id')
      .eq('google_place_id', placeId)
      .limit(1)
    if (pErr) throw pErr
    if (byPlace && byPlace.length) return byPlace[0].id
  }

  const { data: found, error: findErr } = await supabase
    .from('venues')
    .select('id')
    .ilike('name', cleanName)   // case-insensitive match
    .eq('city', city)
    .limit(1)
  if (findErr) throw findErr
  if (found && found.length) return found[0].id

  const { data: created, error: createErr } = await supabase
    .from('venues')
    .insert({ name: cleanName, category, city, google_place_id: placeId, address })
    .select('id')
    .single()
  if (createErr) throw createErr
  return created.id
}

// ratings: { noise: 1..3, crowds: 1..3, ... } — only the attributes the
// visitor actually tapped. Writes one observation row per rated attribute.
export async function submitReport({ venueName, category, city, ratings, note, placeId = null, address = null }) {
  const user = await ensureSignedIn()
  const venueId = await findOrCreateVenue({ name: venueName, category, city, placeId, address })

  const rows = Object.entries(ratings)
    .filter(([, value]) => value != null)
    .map(([attribute, rating]) => ({
      venue_id: venueId,
      attribute,
      rating,
      source: 'user_report',
      confidence: 'verified',
      contributor_id: user.id,
    }))

  // Optional free-text note — the specific "why" the 1–3 taps can't capture
  // (e.g. "smells like grease sometimes", "cold inside"). It rides on the
  // sensory observation: attached to a sensory rating if one was given,
  // otherwise saved as a rating-less sensory row so it never skews an average.
  const cleanNote = typeof note === 'string' ? note.trim().slice(0, 280) : ''
  if (cleanNote) {
    const sensoryRow = rows.find(r => r.attribute === 'sensory')
    if (sensoryRow) {
      sensoryRow.detail = cleanNote
    } else {
      rows.push({
        venue_id: venueId,
        attribute: 'sensory',
        rating: null,
        detail: cleanNote,
        source: 'user_report',
        confidence: 'verified',
        contributor_id: user.id,
      })
    }
  }

  if (rows.length === 0) return { venueId, inserted: 0 }

  const { error } = await supabase.from('observations').insert(rows)
  if (error) throw error
  return { venueId, inserted: rows.length }
}

// ---- READ side ----------------------------------------------------------

// Look up a venue by name + city and return its per-attribute honest state
// (Verified / Estimated / Unknown) from the venue_attribute_state view.
// Returns null if we've never heard of this place — so the UI can stay honest
// about not knowing yet.
// Location/filler words stripped before matching, so "Shake Shack" and
// "shake shack San Antonio, Texas" resolve to the same place.
const LOCATION_STOPWORDS = new Set([
  'san', 'antonio', 'texas', 'tx', 'usa', 'us', 'united', 'states',
  'the', 'a', 'in', 'at', 'on', 'of', 'near',
])

function normalizeVenueName(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(w => w && !LOCATION_STOPWORDS.has(w))
    .join(' ')
    .trim()
}

export async function getVenueState({ name, city = 'San Antonio' }) {
  const normSearch = normalizeVenueName(name)
  if (!normSearch) return null
  const collapse = (v) => v.replace(/ /g, '')
  const cs = collapse(normSearch)

  const { data: venues, error } = await supabase
    .from('venues')
    .select('id, name, category, city')
    .eq('city', city)
    .limit(500)
  if (error) throw error
  if (!venues || venues.length === 0) return null

  // Match on normalized names, tolerating extra location/filler words and
  // spacing differences on either side.
  const venue = venues.find((v) => {
    const n = normalizeVenueName(v.name)
    if (!n) return false
    const cn = collapse(n)
    return n === normSearch || n.includes(normSearch) || normSearch.includes(n)
      || cn === cs || cn.includes(cs) || cs.includes(cn)
  })
  if (!venue) return null

  // Pull raw verified reports from the last ~18 months and summarize per
  // attribute: how many, the running total (for the average), and the spread
  // of answers (so the UI can flag "Mixed" when people disagree).
  const cutoff = new Date(Date.now() - 548 * 24 * 60 * 60 * 1000).toISOString()
  const { data: obs, error: obsErr } = await supabase
    .from('observations')
    .select('attribute, rating, detail, observed_at')
    .eq('venue_id', venue.id)
    .eq('confidence', 'verified')
    .gte('observed_at', cutoff)
  if (obsErr) throw obsErr

  const byAttr = {}
  const notes = []
  for (const o of obs || []) {
    // Collect any free-text note first, regardless of whether this row carries
    // a rating (a note-only row has rating = null).
    if (o.detail && o.detail.trim()) notes.push({ text: o.detail.trim(), at: o.observed_at })
    if (o.rating == null) continue
    const a = byAttr[o.attribute] || (byAttr[o.attribute] = { count: 0, sum: 0, dist: { 1: 0, 2: 0, 3: 0 } })
    a.count += 1
    a.sum += o.rating
    a.dist[o.rating] = (a.dist[o.rating] || 0) + 1
  }
  notes.sort((a, b) => (b.at || '').localeCompare(a.at || '')) // newest first

  return { venue, byAttr, notes }
}


// Turn a venue's verified reports into a compact ground-truth block for the AI,
// so the generated map defers to real data instead of guessing over it.
// Returns null when there are no verified reports (AI then estimates freely).
export function verifiedContextFromState(state) {
  if (!state || !state.byAttr) return null
  const lines = []
  for (const attr of ATTRIBUTES) {
    const s = state.byAttr[attr.key]
    if (s && s.count > 0) {
      const label = labelForRating(attr, s.sum / s.count)
      lines.push(`- ${attr.label}: ${label} (${s.count} report${s.count > 1 ? 's' : ''})`)
    }
  }
  if (lines.length === 0) return null
  return (
    'VERIFIED COMMUNITY REPORTS for this exact place, from real visitors. ' +
    'Treat these as ground truth: your Comfort Factors MUST agree with them and ' +
    'must not contradict them. Use general knowledge only for details not listed here.\n' +
    lines.join('\n')
  )
}

// List venues in a city that have at least one verified report, with counts —
// powers the Explore screen so real data becomes visible.
export async function getMappedVenues({ city = 'San Antonio' } = {}) {
  const { data: venues, error } = await supabase
    .from('venues')
    .select('id, name, category, city')
    .eq('city', city)
    .limit(500)
  if (error) throw error
  if (!venues || venues.length === 0) return []

  const ids = venues.map(v => v.id)
  const cutoff = new Date(Date.now() - 548 * 24 * 60 * 60 * 1000).toISOString()
  const { data: obs, error: obsErr } = await supabase
    .from('observations')
    .select('venue_id, attribute, rating, contributor_id')
    .in('venue_id', ids)
    .eq('confidence', 'verified')
    .gte('observed_at', cutoff)
  if (obsErr) throw obsErr

  const stats = {}
  for (const o of obs || []) {
    const s = stats[o.venue_id] || (stats[o.venue_id] = { attrs: new Set(), people: new Set() })
    // Only rated observations count toward "X of 7 details"; note-only rows
    // (rating = null) still count the person as a visit but don't inflate it.
    if (o.rating != null) s.attrs.add(o.attribute)
    if (o.contributor_id) s.people.add(o.contributor_id)
  }

  return venues
    .map(v => ({
      ...v,
      verifiedAttrs: (stats[v.id] && stats[v.id].attrs.size) || 0,
      visits: (stats[v.id] && stats[v.id].people.size) || 0,
    }))
    .filter(v => v.verifiedAttrs > 0)
    .sort((a, b) => b.verifiedAttrs - a.verifiedAttrs || b.visits - a.visits)
}
