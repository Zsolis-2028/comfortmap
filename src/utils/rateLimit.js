// rateLimit.js
// Client-side soft cap on comfort-map generations, for instant UX ("X left")
// and to block obviously over-limit calls before they hit the server.
// The real, un-bypassable wall is enforced server-side (api/comfort.js +
// the Supabase check_and_record_map_generation function). This is the friendly
// front-end mirror of that.
//
// Counts per CALENDAR MONTH so it resets on the 1st, matching the plan tiers.
// Free is intentionally generous during beta; tighten when billing launches.

const STORAGE_KEY = 'cm_usage'
export const MONTHLY_MAP_LIMIT = 20

function monthKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}` // e.g. "2026-7"
}

function readUsage() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (stored && stored.month === monthKey()) return stored
  } catch {}
  return { month: monthKey(), count: 0 }
}

export function getRemainingMaps() {
  return Math.max(0, MONTHLY_MAP_LIMIT - readUsage().count)
}

export function hasReachedMonthlyLimit() {
  return readUsage().count >= MONTHLY_MAP_LIMIT
}

export function recordMapGenerated() {
  const usage = readUsage()
  usage.count += 1
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage))
  return usage.count
}
