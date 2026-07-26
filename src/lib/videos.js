// src/lib/videos.js
// Short visitor video clips — the same truth-engine idea as photos, but moving.
// Every clip is saved as PENDING (approved = false) and does NOT appear anywhere
// until a human (the founder) approves it, so nothing inappropriate can reach a
// family using the app. Mirrors lib/photos.js on purpose.

import { supabase } from './supabaseClient'
import { ensureSignedIn } from './reports'

const BUCKET = 'venue-videos'

// Upload a short clip for a venue and record it as a pending (unapproved) row.
export async function uploadVenueVideo({ venueId, file }) {
  const user = await ensureSignedIn()

  const ext = (file.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4'
  const path = `${venueId}/${user.id}-${Date.now()}.${ext}`

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type })
  if (upErr) throw upErr

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const url = pub?.publicUrl || null

  const { error: insErr } = await supabase.from('venue_videos').insert({
    venue_id: venueId,
    storage_path: path,
    url,
    contributor_id: user.id,
    approved: false, // pending review — will not display until approved
  })
  if (insErr) throw insErr

  return { url }
}

// Fetch only APPROVED clips for a venue (what visitors are allowed to see).
export async function getVenueVideos({ venueId }) {
  if (!venueId) return []
  const { data, error } = await supabase
    .from('venue_videos')
    .select('id, url, created_at')
    .eq('venue_id', venueId)
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(6)
  if (error) throw error
  return data || []
}

// ---- Founder moderation queue ----

// All pending (unapproved) clips, with place name, for review.
export async function getPendingVideos() {
  const { data, error } = await supabase
    .from('venue_videos')
    .select('id, url, storage_path, created_at, venues(name)')
    .eq('approved', false)
    .order('created_at', { ascending: true })
    .limit(50)
  if (error) throw error
  return (data || []).map((v) => ({
    id: v.id,
    url: v.url,
    storagePath: v.storage_path,
    createdAt: v.created_at,
    venueName: (v.venues && v.venues.name) || 'Unknown place',
  }))
}

// Approve a clip so it shows to everyone.
export async function approveVideo(id) {
  const { error } = await supabase.from('venue_videos').update({ approved: true }).eq('id', id)
  if (error) throw error
}

// Reject a clip: delete the row and remove the stored file.
export async function rejectVideo(id, storagePath) {
  const { error } = await supabase.from('venue_videos').delete().eq('id', id)
  if (error) throw error
  if (storagePath) {
    try { await supabase.storage.from(BUCKET).remove([storagePath]) } catch { /* ignore */ }
  }
}
