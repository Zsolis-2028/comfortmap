// api/checkout.js
// Creates a Stripe Checkout session for the ComfortMap Pro subscription, tied to
// the signed-in Supabase user. The Stripe secret key lives only in
// process.env.STRIPE_SECRET_KEY (server-side, never in the browser).

const Stripe = require('stripe')

const ALLOWED_ORIGINS = new Set([
  'https://comfortmap.vercel.app',
  'https://comfortmap.app',
  'https://www.comfortmap.app',
  'http://localhost:5173',
])

// Falls back to the known test price; override with STRIPE_PRICE_PRO for live.
const PRICE_PRO = process.env.STRIPE_PRICE_PRO || 'price_1TrhLk2Ngk1JT2cczFMmo1kJ'

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
  if (!user) { sendJson(res, 401, { error: 'Please sign in to upgrade.' }); return }

  const stripe = Stripe(key)
  const base = origin || 'https://comfortmap.app'
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: PRICE_PRO, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: user.id,
      subscription_data: { metadata: { supabase_user_id: user.id } },
      allow_promotion_codes: true,
      success_url: `${base}/settings?upgraded=1`,
      cancel_url: `${base}/settings`,
    })
    sendJson(res, 200, { url: session.url })
  } catch (err) {
    // Never leak Stripe internals to the client.
    sendJson(res, 500, { error: 'Could not start checkout. Please try again.' })
  }
}
