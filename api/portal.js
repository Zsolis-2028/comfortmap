// api/portal.js
// Opens the Stripe Customer Portal so a subscriber can manage or cancel their
// ComfortMap Pro subscription themselves. We find the caller's Stripe customer
// by the email on their account (the same email used at checkout), then create a
// short-lived portal session and hand back its URL. The Stripe secret key lives
// only in process.env.STRIPE_SECRET_KEY (server-side, never in the browser).
//
// One-time setup in Stripe (live mode): Settings -> Billing -> Customer portal ->
// activate it (and allow cancellation). Until that's on, Stripe returns an error
// and we surface a friendly message.

const Stripe = require('stripe')

const ALLOWED_ORIGINS = new Set([
  'https://comfortmap.vercel.app',
  'https://comfortmap.app',
  'https://www.comfortmap.app',
  'http://localhost:5173',
])

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

// Resolve the current user from their Supabase JWT.
async function getUser(req) {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const ANON = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  const auth = req.headers['authorization'] || req.headers['Authorization']
  if (!SUPABASE_URL || !ANON || !auth) return null
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: ANON, Authorization: auth } })
    if (!r.ok) return null
    const u = await r.json()
    return u && u.id ? { id: u.id, email: u.email || undefined } : null
  } catch {
    return null
  }
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    sendJson(res, 403, { error: 'Origin not allowed.' })
    return
  }
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return }
  if (req.method !== 'POST') { sendJson(res, 405, { error: 'Method not allowed' }); return }

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) { sendJson(res, 500, { error: 'Billing is not configured yet.' }); return }

  const user = await getUser(req)
  if (!user) { sendJson(res, 401, { error: 'Please sign in first.' }); return }
  if (!user.email) { sendJson(res, 400, { error: 'No email on file for this account.' }); return }

  const stripe = Stripe(key)
  const base = origin || 'https://comfortmap.app'
  try {
    // Find the Stripe customer created for this account at checkout, by email.
    const customers = await stripe.customers.list({ email: user.email, limit: 1 })
    const customer = customers.data[0]
    if (!customer) {
      sendJson(res, 404, { error: "We couldn't find a subscription for this account." })
      return
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${base}/settings`,
    })
    sendJson(res, 200, { url: portal.url })
  } catch (err) {
    // Log server-side only; a common cause is the Customer Portal not being
    // activated in the Stripe dashboard yet.
    console.error('portal_error', err && err.type, err && err.message)
    sendJson(res, 500, { error: 'Could not open the subscription portal. Please try again or email us.' })
  }
}
