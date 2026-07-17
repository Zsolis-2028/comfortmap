// src/lib/auth.js
// Thin wrapper around Supabase email/password auth. Accounts are optional —
// the app works anonymously; signing in just lets your history and plan
// follow you across devices.

import { supabase } from './supabaseClient'

// Current session (or null if signed out / anonymous-only).
export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// Subscribe to auth changes; returns an unsubscribe function.
export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}

// Create a new account with email + password.
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

// Sign in to an existing account.
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

// Sign out (returns the app to anonymous browsing).
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
