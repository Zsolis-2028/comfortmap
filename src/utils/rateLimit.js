// rateLimit.js
// Caps comfort-map generations per user per day using localStorage.
// "Day" is the user's local calendar day, so the count resets at their midnight.

const STORAGE_KEY = 'cm_usage'
export const DAILY_MAP_LIMIT = 4

function todayKey() {
  return new Date().toDateString()
}

function readUsage() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (stored && stored.date === todayKey()) return stored
  } catch {}
  return { date: todayKey(), count: 0 }
}

export function getRemainingMaps() {
  return Math.max(0, DAILY_MAP_LIMIT - readUsage().count)
}

export function hasReachedDailyLimit() {
  return readUsage().count >= DAILY_MAP_LIMIT
}

export function recordMapGenerated() {
  const usage = readUsage()
  usage.count += 1
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage))
  return usage.count
}
