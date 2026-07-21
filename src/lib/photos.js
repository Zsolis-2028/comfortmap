// src/lib/photos.js
// Real photos from real visitors — the same truth-engine idea as reports, but
// visual. Every uploaded photo is saved as PENDING (approved = false) and does
// NOT appear anywhere until it's approved, so nothing inappropriate can reach a
// family using the app.

import { supabase } from './supabaseClient'
import { ensureSignedIn } from './reports'

const BUCKET = 'venue-photos'

// Upload a photo for a venue and record it as a pending (unapproved) row.
export async function uploadVenuePhoto({ venueId, file }) {
  const user = await ensureSignedIn()

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${venueId}/${user.id}-${Date.now()}.${ext}`

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type })
  if (upErr) throw upErr

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const url = pub?.publicUrl || null

  const { error: insErr } = await supabase.from('venue_photos').insert({
    venue_id: venueId,
    storage_path: path,
    url,
    contributor_id: user.id,
    approved: false, // pending review — will not display until approved
  })
  if (insErr) throw insErr

  return { url }
}

// Fetch only APPROVED photos for a venue (what visitors are allowed to see).
export async function getVenuePhotos({ venueId }) {
  if (!venueId) return []
  const { data, error } = await supabase
    .from('venue_photos')
    .select('id, url, created_at')
    .eq('venue_id', venueId)
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(12)
  if (error) throw error
  return data || []
}
