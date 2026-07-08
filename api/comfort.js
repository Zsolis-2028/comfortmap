// api/comfort.js
// Server-side proxy to the Anthropic API. The API key lives only in
// process.env.ANTHROPIC_API_KEY here — it is never sent to the browser.
// Runs as a Vercel serverless function in production, and is mounted
// into the Vite dev server (see vite.config.js) for local development.

const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 1200
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'

function buildSystemPrompt({ sensory = [], who = null, lang = 'en' }) {
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

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

async function readJsonBody(req) {
  // Vercel's Node runtime pre-parses the body onto req.body; the Vite
  // dev middleware hands us a raw stream instead, so support both.
  if (req.body && typeof req.body === 'object') return req.body

  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    sendJson(res, 500, { error: 'Server is not configured with an API key.' })
    return
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON body.' })
    return
  }

  const { userMessage, sensory, who, lang, conversationHistory = [] } = body || {}
  if (!userMessage || typeof userMessage !== 'string') {
    sendJson(res, 400, { error: 'userMessage is required.' })
    return
  }

  const systemPrompt = buildSystemPrompt({ sensory, who, lang })
  const messages = [...conversationHistory, { role: 'user', content: userMessage }]

  try {
    const upstream = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages,
      }),
    })

    const data = await upstream.json()

    if (!upstream.ok) {
      sendJson(res, upstream.status, { error: data.error?.message || 'Something went wrong. Please try again.' })
      return
    }

    const text = (data.content || []).map((block) => block.text || '').join('\n')
    sendJson(res, 200, { text })
  } catch {
    sendJson(res, 502, { error: 'Failed to reach the AI service.' })
  }
}
