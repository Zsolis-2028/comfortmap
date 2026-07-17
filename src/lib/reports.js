// src/lib/reports.js
// The write side of the truth engine: turn a visitor's taps into real,
// attributed observations in Supabase.
//
// Every observation saved here is source='user_report', confidence='verified' —
// a real person, really there. This is the data the whole product stands on.

import { supabase } from './supabaseClient'

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

// Find an existing venue by name + city, or create it. Returns the venue id.
export async function findOrCreateVenue({ name, category = 'other', city = 'San Antonio' }) {
  const cleanName = name.trim()

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
    .insert({ name: cleanName, category, city })
    .select('id')
    .single()
  if (createErr) throw createErr
  return created.id
}

// ratings: { noise: 1..3, crowds: 1..3, ... } — only the attributes the
// visitor actually tapped. Writes one observation row per rated attribute.
export async function submitReport({ venueName, category, city, ratings }) {
  const user = await ensureSignedIn()
  const venueId = await findOrCreateVenue({ name: venueName, category, city })

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
    .select('attribute, rating, observed_at')
    .eq('venue_id', venue.id)
    .eq('confidence', 'verified')
    .gte('observed_at', cutoff)
  if (obsErr) throw obsErr

  const byAttr = {}
  for (const o of obs || []) {
    if (o.rating == null) continue
    const a = byAttr[o.attribute] || (byAttr[o.attribute] = { count: 0, sum: 0, dist: { 1: 0, 2: 0, 3: 0 } })
    a.count += 1
    a.sum += o.rating
    a.dist[o.rating] = (a.dist[o.rating] || 0) + 1
  }

  return { venue, byAttr }
}
