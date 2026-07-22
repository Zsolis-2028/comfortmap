// api/stripe-webhook.js
// Receives Stripe subscription events and keeps Supabase profiles.plan in sync:
//   pays  -> plan = 'pro'
//   cancels/ends -> plan = 'free'
// A 'founder' account is never overwritten (the PATCH filters it out).
//
// Needs (Vercel env): STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and a Supabase
// service key (SUPABASE_SERVICE_ROLE_KEY) so it can update any user's profile.

const Stripe = require('stripe')

async function readRawBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

async function setPlan(uid, plan) {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SERVICE || !uid) return
  // Filter neq.founder so a founder account is never downgraded.
  await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}&plan=neq.founder`, {
    method: 'PATCH',
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ plan }),
  })
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.statusCode = 405; res.end('Method not allowed'); return }

  const key = process.env.STRIPE_SECRET_KEY
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!key || !whSecret) { res.statusCode = 500; res.end('Billing not configured'); return }

  const stripe = Stripe(key)
  const sig = req.headers['stripe-signature']

  let event
  try {
    const raw = await readRawBody(req)
    event = stripe.webhooks.constructEvent(raw, sig, whSecret)
  } catch (err) {
    res.statusCode = 400
    res.end('Webhook signature verification failed')
    return
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object
      if (s.client_reference_id) await setPlan(s.client_reference_id, 'pro')
    } else if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object
      const uid = sub.metadata && sub.metadata.supabase_user_id
      const active = ['active', 'trialing'].includes(sub.status)
      if (uid) await setPlan(uid, active ? 'pro' : 'free')
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object
      const uid = sub.metadata && sub.metadata.supabase_user_id
      if (uid) await setPlan(uid, 'free')
    }
  } catch (err) {
    // Swallow — still return 200 so Stripe doesn't retry forever on our bug.
  }

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ received: true }))
}
