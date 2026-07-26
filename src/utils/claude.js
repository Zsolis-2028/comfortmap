// claude.js
// The single place where ComfortMap talks to the AI.
// The actual Anthropic call happens server-side in api/comfort.js so the
// API key never reaches the browser — this just calls our own backend.

import { getText } from '../data/languages'
import { supabase } from '../lib/supabaseClient'
import { getCaptchaToken } from '../lib/captcha'

const API_URL = '/api/comfort'

// Get the current user's Supabase access token so the server can identify them
// for per-account monthly limits. If they have no session yet, sign in
// anonymously (zero friction) so every device is still attributable. Best-effort
// — any failure just means the request goes out without a token, and the server
// falls back to not enforcing (fail-open).
async function getAccessToken() {
  try {
    let { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      const captchaToken = await getCaptchaToken()
      const { data } = await supabase.auth.signInAnonymously(
        captchaToken ? { options: { captchaToken } } : undefined
      )
      session = data?.session || null
    }
    return session?.access_token || null
  } catch {
    return null
  }
}

// Main function to get a comfort map
export const getComfortMap = async ({ userMessage, sensory, who, lang, conversationHistory = [], extraContext = '' }) => {
  const fullMessage = extraContext ? `${userMessage}\n\n${extraContext}` : userMessage
  const headers = { 'Content-Type': 'application/json' }
  const token = await getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`
  let response
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userMessage: fullMessage, sensory, who, lang, conversationHistory }),
    })
  } catch {
    // fetch() itself throws (not an HTTP error response) when there's no
    // network path to the server at all — e.g. the connection dropped
    // mid-request even though navigator.onLine said we were online.
    throw new Error(getText(lang).offlineErrorMessage || 'You appear to be offline. Please check your connection and try again.')
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.')
  }

  return data.text
}

// Follow-up question within the same conversation
export const askFollowUp = async ({ followUp, sensory, who, lang, conversationHistory }) => {
  return getComfortMap({
    userMessage: followUp,
    sensory,
    who,
    lang,
    conversationHistory,
  })
}
