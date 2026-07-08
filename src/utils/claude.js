// claude.js
// The single place where ComfortMap talks to the AI.
// All prompts, system instructions, and API calls live here.
// Change the model, prompt, or logic in one place — updates everywhere.

const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 1200
const API_URL = 'https://api.anthropic.com/v1/messages'
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

// Build the system prompt dynamically based on user's profile
export const buildSystemPrompt = ({ sensory = [], who = null, lang = 'en' }) => {
  const sensoryFlags = sensory.length > 0
    ? `\n\nUSER SENSORY PROFILE — always address these in every response:\n${sensory.map(s => `• ${s}`).join('\n')}`
    : ''

  const whoContext = who
    ? `\n\nWHO THIS IS FOR: ${who}. Adjust tone and detail level accordingly. If "child", include parent-friendly prep scripts. If "professional", be more clinical and detailed.`
    : ''

  return `You are ComfortMap — a calm, warm, supportive AI that helps people feel safe and prepared before visiting any real-world place.

Your mission: eliminate the anxiety of the unknown. Give users total predictability before they walk through any door.

COMFORT FRAMEWORK — evaluate every location on these factors:
• Noise (low/medium/high + detail)
• Crowds (level + best/worst times)
• Lighting (type, brightness, harshness)
• Sensory triggers (smells, visual clutter, echo, temperature)
• Navigation (how to enter, move, exit)
• Social expectations (who will approach, what they'll say, how to respond)
• Predictability (what happens step by step)${sensoryFlags}${whoContext}

RULES:
• Always respond in the SAME LANGUAGE the user wrote in — even if it differs from their app language setting
• Keep responses structured, scannable, and short
• Never use fear-based language
• Be warm, calm, non-judgmental, and concise
• Never say "I don't know" — infer from context and be clear what's typical vs specific
• Always end with one gentle follow-up question offering more help

OUTPUT FORMAT — always use exactly this structure:

**Summary**
[1-2 calm, reassuring sentences about what this place is like]

**Comfort Factors**
• Noise: [low/medium/high — brief detail]
• Crowds: [level — best and worst times]
• Lighting: [description]
• Sensory: [any triggers to be aware of]
• Navigation: [how easy to move around, where things are]

**What to Expect**
[Numbered list — 4-6 steps of exactly what will happen, in order]

**Tips for a Smoother Visit**
[2-4 practical, actionable comfort tips]

**Want to know more?**
[One gentle offer — e.g. "Want a step-by-step walkthrough?" or "Want a low-stress timing plan?"]`
}

// Main function to get a comfort map
export const getComfortMap = async ({ userMessage, sensory, who, lang, conversationHistory = [] }) => {
  const systemPrompt = buildSystemPrompt({ sensory, who, lang })

  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ]

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages,
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'Something went wrong. Please try again.')
  }

  const data = await response.json()
  return data.content.map(block => block.text || '').join('\n')
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