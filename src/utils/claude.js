// claude.js
// The single place where ComfortMap talks to the AI.
// The actual Anthropic call happens server-side in api/comfort.js so the
// API key never reaches the browser — this just calls our own backend.

import { getText } from '../data/languages'

const API_URL = '/api/comfort'

// Main function to get a comfort map
export const getComfortMap = async ({ userMessage, sensory, who, lang, conversationHistory = [] }) => {
  let response
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage, sensory, who, lang, conversationHistory }),
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
