// claude.js
// The single place where ComfortMap talks to the AI.
// The actual Anthropic call happens server-side in api/comfort.js so the
// API key never reaches the browser — this just calls our own backend.

const API_URL = '/api/comfort'

// Main function to get a comfort map
export const getComfortMap = async ({ userMessage, sensory, who, lang, conversationHistory = [] }) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userMessage, sensory, who, lang, conversationHistory }),
  })

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
