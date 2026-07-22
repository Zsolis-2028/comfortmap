// src/lib/billing.js
// Kicks off the Stripe Checkout flow for ComfortMap Pro. The server creates the
// session; we just redirect the browser to Stripe's secure hosted page.

import { supabase } from './supabaseClient'

export async function startProCheckout() {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session && session.access_token
  if (!token) throw new Error('Please sign in first to upgrade.')

  const r = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok || !data.url) throw new Error(data.error || 'Could not start checkout. Please try again.')

  window.location.href = data.url
}
