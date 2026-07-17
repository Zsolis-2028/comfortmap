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
