// api/comfort.js
// Server-side proxy to the Anthropic API. The API key lives only in
// process.env.ANTHROPIC_API_KEY here — it is never sent to the browser,
// and it is never written to logs.
// Runs as a Vercel serverless function in production, and is mounted
// into the Vite dev server (see vite.config.js) for local development.
// Deploy trigger: 2026-07-10

const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 1500
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_TIMEOUT_MS = 30000

const MAX_BODY_BYTES = 10 * 1024 // 10kb
const MAX_FIELD_LENGTH = 2000
// M2: cap how many prior turns a client can send. A real ComfortMap chat is a
// handful of turns; anything longer is either abuse (a forged history to
// jailbreak the system prompt) or accidental bloat. Keep the most recent turns.
const MAX_HISTORY_TURNS = 12

const ALLOWED_ORIGINS = new Set([
  'https://comfortmap.vercel.app',
  'https://comfortmap.app',
  'https://www.comfortmap.app',
  'http://localhost:5173',
])

// Best-effort per-instance limiter: serverless instances are short-lived and
// not shared, so this resets on cold start and isn't consistent across
// concurrent instances. It still blunts bursty abuse from a single instance.
const RATE_LIMIT_MAX = 20 // covers 4 maps + 3 follow-ups each for a legitimate user
const ABUSE_THRESHOLD = 30 // requests past this in a window get flagged as likely abuse
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const rateLimitStore = new Map() // ip -> { count, resetAt, abuseFlagged }

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

  return `You are ComfortMap — a calm, warm, perceptive guide who helps people feel safe and prepared before visiting any real-world place. You are NOT a generic brochure. You listen closely to what each person tells you and hand them something that feels made just for them.

Your mission: eliminate the anxiety of the unknown — and leave the person thinking "wow, I didn't expect that, that's exactly what I needed."

COMFORT FRAMEWORK — read every location on these factors:
• Noise (low/medium/high + detail)
• Crowds (level + best/worst times)
• Lighting (type, brightness, harshness)
• Sensory triggers (smells, visual clutter, echo, temperature)
• Navigation (how to enter, move, exit)
• Parking & arrival (availability, typical cost, free/cheaper options nearby, and how far the walk is to the entrance)
• Social expectations (who will approach, what they'll say, how to respond)
• Predictability (what happens step by step)${sensoryFlags}${whoContext}

MAKE IT PERSONAL — this is what makes ComfortMap memorable. Do it every time:
• Actually read what the person wrote. Open by reflecting THEIR specific situation back — their reason for going, their mood, what they're worried about. Never open with a generic city overview.
• If they gave a sensory profile or named things they especially want to know about (e.g. "I especially want to know about: Noise, Exit options"), make those the HEART of the answer — lead with them and go deeper there than anything else.
• Include at least one specific, non-obvious insight — an insider detail or small move most people wouldn't think of (e.g. "headphones are a universal 'I'm in my own space' signal that people respect"). This is the moment of delight. No obvious filler like "arrive early" or "be yourself."
• Write like a perceptive friend who's actually been there — warm, specific, human. Not a template.

RULES:
• Always respond in the SAME LANGUAGE the person wrote in
• Warm, calm, non-judgmental, specific — never fear-based
• Ground everything in what's typical; be clear what's a general read vs specific to one place. Never invent exact figures, signs, or details you can't know — but always give a genuinely useful read rather than a vague "it depends."
• If VERIFIED COMMUNITY REPORTS are provided below, treat them as ground truth — your answer must agree with them.
• Keep it scannable and short. End with one gentle, relevant follow-up offer.${prepScriptRule}

OUTPUT FORMAT — use this structure:

**Summary**
[Open by reflecting the person's specific situation back, warm and human, in 1-2 sentences. Show them you read what they wrote — never generic.]

**Comfort Factors**
• Noise: [low/medium/high — brief detail]
• Crowds: [level — best and worst times]
• Lighting: [description]
• Sensory: [any triggers to be aware of]
• Navigation: [how easy to move around, where things are]
• Parking: [availability and typical cost; call out free/cheaper parking nearby and roughly how far the walk is. If parking doesn't apply, say so briefly.]
(Give noticeably more depth to whatever the person said matters most to them.)

**What to Expect**
[Numbered list — 4-6 steps of exactly what will happen, framed around this person's situation]

**Tips for a Smoother Visit**
[2-4 specific, practical tips — at least one they genuinely wouldn't have thought of]

**Want to know more?**
[One gentle, relevant offer]${prepScriptSection}`
}

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

// Vercel's edge network is the first proxy hop a request passes through, so
// it sets x-forwarded-for with the real client IP first in the list; any
// further proxies append after it. x-real-ip is a fallback for local/dev
// invocations where that header isn't set.
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    const first = forwarded.split(',')[0].trim()
    if (first) return first
  }
  const realIp = req.headers['x-real-ip']
  if (typeof realIp === 'string' && realIp.trim().length > 0) return realIp.trim()
  return req.socket?.remoteAddress || 'unknown'
}

function logEvent(type, req, extra = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    type,
    origin: req.headers.origin || null,
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'] || null,
    ...extra,
  }
  console.error(JSON.stringify(entry))
}

function checkRateLimit(ip) {
  const now = Date.now()
  let entry = rateLimitStore.get(ip)
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS, abuseFlagged: false }
  }
  entry.count += 1

  // Log abuse once per window, the moment an IP first crosses the threshold,
  // rather than on every request after — that would flood the logs since
  // rate-limited requests keep incrementing count even though they're blocked.
  const isNewAbuse = entry.count > ABUSE_THRESHOLD && !entry.abuseFlagged
  if (isNewAbuse) entry.abuseFlagged = true

  rateLimitStore.set(ip, entry)
  return {
    limited: entry.count > RATE_LIMIT_MAX,
    remaining: Math.max(0, RATE_LIMIT_MAX - entry.count),
    resetAt: entry.resetAt,
    count: entry.count,
    isNewAbuse,
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

// Checked before any content is sanitized or sent to Claude: rejects
// malformed shapes outright rather than silently coercing them.
function validateBody(body) {
  if (typeof body.userMessage !== 'string' || body.userMessage.trim().length === 0) {
    return 'userMessage is required.'
  }
  if (body.who !== undefined && body.who !== null && typeof body.who !== 'string') {
    return 'who must be a string.'
  }
  if (body.lang !== undefined && body.lang !== null && typeof body.lang !== 'string') {
    return 'lang must be a string.'
  }
  if (body.sensory !== undefined && !Array.isArray(body.sensory)) {
    return 'sensory must be an array.'
  }
  if (body.conversationHistory !== undefined) {
    if (!Array.isArray(body.conversationHistory)) {
      return 'conversationHistory must be an array.'
    }
    for (const turn of body.conversationHistory) {
      if (!turn || typeof turn !== 'object' || typeof turn.role !== 'string' || typeof turn.content !== 'string') {
        return 'conversationHistory entries must have a string role and content.'
      }
    }
  }
  return null
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

// Server-side monthly quota check. Calls a Supabase SECURITY DEFINER function
// with the caller's own JWT, which reads their plan, counts this month's maps,
// records one if they're under the limit, and reports the result.
// FAIL-OPEN by design: if anything is missing or errors (no token, no env,
// network/timeout, non-OK response), we return null and the caller proceeds —
// this can never block a legitimate map generation.
async function checkMonthlyLimit(req) {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const ANON = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  const auth = req.headers['authorization'] || req.headers['Authorization']
  if (!SUPABASE_URL || !ANON || !auth) return null

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 4000)
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_and_record_map_generation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: auth },
      body: '{}',
      signal: controller.signal,
    })
    if (!r.ok) return null
    return await r.json()
  } catch {
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin

  // H1: require a valid Origin. Our app calls this endpoint same-origin, so a
  // real browser request always carries an allow-listed Origin. Scripts / curl
  // that omit Origin (the #1 cost-abuse vector) used to be waved through — now
  // they're rejected. A determined caller can still forge an Origin header, so
  // this isn't airtight; true enforcement is per-user auth (Phase 11). But it
  // closes the wide-open door, and the $20 spend cap remains the hard backstop.
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    logEvent('cors_rejected', req)
    sendJson(res, 403, { error: 'Origin not allowed.' })
    return
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
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
  if (rate.isNewAbuse) {
    logEvent('abuse_detected', req, { requestCount: rate.count })
  }
  if (rate.limited) {
    logEvent('rate_limited', req, { requestCount: rate.count })
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

  const validationError = validateBody(body)
  if (validationError) {
    logEvent('invalid_request', req, { reason: validationError })
    sendJson(res, 400, { error: validationError })
    return
  }

  if (collectTextFields(body).some(isSuspicious)) {
    // L2: do NOT log the message content. Users often search places tied to
    // anxiety, disability, or a child's needs — that text stays private.
    logEvent('suspicious_input', req)
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
        .slice(-MAX_HISTORY_TURNS) // M2: only keep the most recent turns
    : []

  // Monthly plan limit — only a brand-new map (no prior turns) consumes quota;
  // follow-up questions in an existing conversation are free. Fail-open: a null
  // result (misconfig / error) means "don't block".
  if (conversationHistory.length === 0) {
    const gate = await checkMonthlyLimit(req)
    if (gate && gate.allowed === false) {
      logEvent('limit_reached', req, { plan: gate.plan, used: gate.used, limit: gate.limit })
      sendJson(res, 429, {
        error: `You've used all ${gate.limit} comfort maps on your plan this month. Your limit resets at the start of next month.`,
        limitReached: true,
      })
      return
    }
  }

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
      // L1: log the upstream detail server-side only; never echo it to the
      // client, which could leak internal error specifics.
      logEvent('upstream_error', req, { status: upstream.status, detail: data.error?.message || null })
      sendJson(res, upstream.status, { error: 'Something went wrong. Please try again.' })
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
