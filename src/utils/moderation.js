// moderation.js
// First-line content filter for anything a visitor types (report notes, place
// names). ComfortMap is a family app used by kids and anxious parents, so we
// keep submissions clean: profanity, slurs, and sexual/vulgar terms are blocked.
//
// This is intentionally a *blocklist of whole words* (token match), not a
// substring search — so it won't wrongly flag innocent words (e.g. "class",
// "cucumber"). It's a first line of defense, not bulletproof; expand BLOCKED as
// needed. Mild words people use to describe a place ("loud", "damn loud") are
// deliberately NOT blocked so honest reports still read naturally.

const BLOCKED = [
  // strong profanity
  'fuck', 'fucking', 'fucked', 'motherfucker', 'shit', 'bullshit', 'bitch',
  'asshole', 'cunt', 'cock', 'pussy', 'slut', 'whore', 'prick', 'wanker',
  'bastard',
  // slurs — racial / homophobic / ableist (blocked outright)
  'nigger', 'nigga', 'faggot', 'fag', 'retard', 'retarded', 'spic', 'chink',
  'kike', 'tranny', 'dyke', 'coon',
  // sexual / vulgar
  'porn', 'nude', 'nudes', 'rape', 'cum', 'boner', 'horny', 'xxx', 'blowjob',
  'handjob', 'dildo', 'jizz', 'dick', 'dicks', 'dickhead', 'twat', 'tits',
  'titties', 'boobs', 'penis', 'vagina', 'ballsack', 'jackoff', 'jerkoff',
]

const BLOCKED_SET = new Set(BLOCKED)

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // drop punctuation so "f*ck" / "f.ck" split out
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
}

// Returns true if the text contains a blocked word (as a whole word).
export function containsProfanity(text) {
  const tokens = tokenize(text)
  return tokens.some((t) => BLOCKED_SET.has(t))
}

// Friendly, non-scolding message to show when something is blocked.
export const PROFANITY_MESSAGE =
  "Let's keep reports kind and helpful for families — please remove any offensive language and try again."
