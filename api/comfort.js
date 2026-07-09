// api/comfort.js
// Server-side proxy to the Anthropic API. The API key lives only in
// process.env.ANTHROPIC_API_KEY here — it is never sent to the browser,
// and it is never written to logs.
// Runs as a Vercel serverless function in production, and is mounted
// into the Vite dev server (see vite.config.js) for local development.

const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 1500
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_TIMEOUT_MS = 30000

const MAX_BODY_BYTES = 10 * 1024 // 10kb
const MAX_FIELD_LENGTH = 2000

const ALLOWED_ORIGINS = new Set(['https://comfortmap.vercel.app', 'http://localhost:5173'])

// Best-effort per-instance limiter: serverless instances are short-lived and
// not shared, so this resets on cold start and isn't consistent across
// concurrent instances. It still blunts bursty abuse from a single instance.
const RATE_LIMIT_MAX = 20
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const rateLimitStore = new Map() // ip -> { count, resetAt }

const SUSPICIOUS_REGEXES = [
  /javascript\s*:/i,
  /<\s*script\b/i,
  /eval\s*\(/i,
  /drop\s+table/i,
]

function buildSystemPrompt({ sensory = [], who = null, lang = 'en' }) {
  const sensoryFlags = sensory.length > 0
    ? `\n\nUSER SENSORY PROFILE — always address these in every response:\n${sensory.map(s => `• ${s}`).join('\n')}`
    : ''

  const whoContext = who
    ? `\n\nWHO THIS IS FOR: ${who}. Adjust tone and detail level accordingly. If "professional", be more clinical and detailed.`
    : ''

  const prepScriptSection = who === 'child'
    ? `

**Prep Script for Parents**
["Word-for-word script, 4-6 short sentences, wrapped in quotation marks exactly as the parent should read it aloud to their child the night before the visit. Use simple words a young child understands. Name the place, give one calm reassurance, describe one concrete thing they'll see or do, and offer one comforting thing they can do if it feels like too much. End on an encouraging note."]`
    : ''

  const prepScriptRule = who === 'child'
    ? `\n• The "WHO THIS IS FOR" is a child, so you MUST end every response — including follow-up answers — with the "Prep Script for Parents" section exactly as shown in OUTPUT FORMAT, after the "Want to know more?" section.`
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
• Always end with one gentle follow-up question offering more help${prepScriptRule}

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
[One gentle offer — e.g. "Want a step-by-step walkthrough?" or "Want a low-stress timing plan?"]${prepScriptSection}`
}

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

function logEvent(type, req, extra = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    type,
    origin: req.headers.origin || null,
    ip: getClientIp(req),
    ...extra,
  }
  console.error(JSON.stringify(entry))
}

function previewOf(value, length = 60) {
  if (typeof value !== 'string') return null
  const flat = value.replace(/\s+/g, ' ').trim()
  return flat.length > length ? `${flat.slice(0, length)}…` : flat
}

function checkRateLimit(ip) {
  const now = Date.now()
  let entry = rateLimitStore.get(ip)
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS }
  }
  entry.count += 1
  rateLimitStore.set(ip, entry)
  return {
    limited: entry.count > RATE_LIMIT_MAX,
    remaining: Math.max(0, RATE_LIMIT_MAX - entry.count),
    resetAt: entry.resetAt,
  }
}

function setRateLimitHeaders(res, rate) {
  res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT_MAX))
  res.setHeader('X-RateLimit-Remaining', String(rate.remaining))
  res.setHeader('X-RateLimit-Reset', String(Math.floor(rate.resetAt / 1000)))
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
}

function decodeAttempts(str) {
  const attempts = new Set([str, decodeHtmlEntities(str)])
  try {
    attempts.add(decodeURIComponent(str))
  } catch {}
  try {
    attempts.add(decodeHtmlEntities(decodeURIComponent(str)))
  } catch {}
  return [...attempts]
}

function isSuspicious(value) {
  if (typeof value !== 'string') return false
  return decodeAttempts(value).some((variant) =>
    SUSPICIOUS_REGEXES.some((re) => re.test(variant))
  )
}

function collectTextFields(body) {
  const texts = []
  if (typeof body.userMessage === 'string') texts.push(body.userMessage)
  if (typeof body.who === 'string') texts.push(body.who)
  if (typeof body.lang === 'string') texts.push(body.lang)
  if (Array.isArray(body.sensory)) {
    for (const s of body.sensory) if (typeof s === 'string') texts.push(s)
  }
  if (Array.isArray(body.conversationHistory)) {
    for (const turn of body.conversationHistory) {
      if (turn && typeof turn.content === 'string') texts.push(turn.content)
    }
  }
  return texts
}

function sanitizeText(value) {
  let text = String(value).trim()
  text = text.replace(/<[^>]*>/g, '') // HTML tags
  text = text.replace(/javascript\s*:/gi, '')
  text = text.replace(/eval\s*\(/gi, '')
  text = text.replace(/--|\/\*|\*\//g, '') // SQL comment tokens
  text = text.replace(/\b(union\s+select|drop\s+table|insert\s+into|delete\s+from|update\s+\S+\s+set)\b/gi, '')
  text = text.trim()
  if (text.length > MAX_FIELD_LENGTH) text = text.slice(0, MAX_FIELD_LENGTH).trim()
  return text
}

async function readJsonBody(req, maxBytes) {
  // Vercel's Node runtime pre-parses the body onto req.body; the Vite
  // dev middleware hands us a raw stream instead, so support both.
  if (req.body && typeof req.body === 'object') return req.body

  let size = 0
  const chunks = []
  for await (const chunk of req) {
    size += chunk.length
    if (size > maxBytes) {
      const err = new Error('Payload too large')
      err.code = 'PAYLOAD_TOO_LARGE'
      throw err
    }
    chunks.push(chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin

  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    logEvent('cors_rejected', req)
    sendJson(res, 403, { error: 'Origin not allowed.' })
    return
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  const ip = getClientIp(req)
  const rate = checkRateLimit(ip)
  setRateLimitHeaders(res, rate)
  if (rate.limited) {
    logEvent('rate_limited', req)
    res.setHeader('Retry-After', String(Math.ceil((rate.resetAt - Date.now()) / 1000)))
    sendJson(res, 429, { error: 'Too many requests. Please try again later.' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    sendJson(res, 500, { error: 'Server is not configured with an API key.' })
    return
  }

  const contentLength = Number(req.headers['content-length'])
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    logEvent('payload_too_large', req, { contentLength })
    sendJson(res, 413, { error: 'Request body too large.' })
    return
  }

  let body
  try {
    body = await readJsonBody(req, MAX_BODY_BYTES)
  } catch (err) {
    if (err.code === 'PAYLOAD_TOO_LARGE') {
      logEvent('payload_too_large', req)
      sendJson(res, 413, { error: 'Request body too large.' })
      return
    }
    logEvent('invalid_json', req)
    sendJson(res, 400, { error: 'Invalid JSON body.' })
    return
  }

  body = body || {}
  if (Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_BODY_BYTES) {
    logEvent('payload_too_large', req)
    sendJson(res, 413, { error: 'Request body too large.' })
    return
  }

  if (collectTextFields(body).some(isSuspicious)) {
    logEvent('suspicious_input', req, { inputPreview: previewOf(body.userMessage) })
    sendJson(res, 400, { error: 'Input contains disallowed content.' })
    return
  }

  const userMessage = typeof body.userMessage === 'string' ? sanitizeText(body.userMessage) : ''
  if (!userMessage) {
    sendJson(res, 400, { error: 'userMessage is required.' })
    return
  }

  const who = typeof body.who === 'string' ? sanitizeText(body.who) || null : null
  const lang = typeof body.lang === 'string' ? sanitizeText(body.lang) : undefined
  const sensory = Array.isArray(body.sensory)
    ? body.sensory.filter((s) => typeof s === 'string').map(sanitizeText).filter(Boolean)
    : []
  const conversationHistory = Array.isArray(body.conversationHistory)
    ? body.conversationHistory
        .filter((turn) => turn && typeof turn.role === 'string' && typeof turn.content === 'string')
        .map((turn) => ({ role: turn.role, content: sanitizeText(turn.content) }))
        .filter((turn) => turn.content)
    : []

  const systemPrompt = buildSystemPrompt({ sensory, who, lang })
  const messages = [...conversationHistory, { role: 'user', content: userMessage }]

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), ANTHROPIC_TIMEOUT_MS)

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
      signal: controller.signal,
    })

    const data = await upstream.json()

    if (!upstream.ok) {
      logEvent('upstream_error', req, { status: upstream.status })
      sendJson(res, upstream.status, { error: data.error?.message || 'Something went wrong. Please try again.' })
      return
    }

    const text = (data.content || []).map((block) => block.text || '').join('\n')
    sendJson(res, 200, { text })
  } catch (err) {
    if (err.name === 'AbortError') {
      logEvent('upstream_timeout', req)
      sendJson(res, 504, { error: 'The AI service took too long to respond. Please try again.' })
      return
    }
    logEvent('unexpected_error', req, { message: err.message })
    sendJson(res, 502, { error: 'Failed to reach the AI service.' })
  } finally {
    clearTimeout(timeoutId)
  }
}
