// src/lib/supabaseClient.js
// The single connection between the app and the ComfortMap Supabase database.
// Import { supabase } from here anywhere you need to read venues/observations
// or save a new report.
//
// The URL and anon key are safe to ship in the browser: the anon key only
// grants what your Row Level Security policies allow (public read, and inserts
// only for signed-in users). Both come from Supabase → Settings → API.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Helps you catch a missing env var during dev instead of a silent failure.
  console.warn(
    '[ComfortMap] Supabase env vars missing. Set VITE_SUPABASE_URL and ' +
    'VITE_SUPABASE_ANON_KEY in your .env (local) and in Vercel.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
