// src/lib/captcha.js
// Cloudflare Turnstile — invisible bot protection for auth (anonymous sign-ins,
// signup, login). Safe by design: if VITE_TURNSTILE_SITE_KEY isn't set,
// getCaptchaToken() returns undefined and every auth call behaves exactly as it
// did before. Only once the key is set (and captcha is enabled in Supabase) do
// real tokens get produced. For normal visitors the challenge stays invisible;
// Cloudflare only shows a box if it actually needs a human check.

const SITEKEY = import.meta.env.VITE_TURNSTILE_SITE_KEY
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let scriptPromise
function loadScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.turnstile) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = SCRIPT_SRC
      s.async = true
      s.defer = true
      s.onload = () => resolve()
      s.onerror = reject
      document.head.appendChild(s)
    })
  }
  return scriptPromise
}

// Resolves with a Turnstile token, or undefined if captcha isn't configured or
// anything goes wrong (fail-open, so a hiccup never hard-blocks a real person
// when captcha is off). When captcha is ON in Supabase, undefined means the
// auth call is rejected — which is exactly what we want for bots.
export async function getCaptchaToken() {
  if (!SITEKEY) return undefined
  try {
    await loadScript()
  } catch {
    return undefined
  }
  if (!window.turnstile) return undefined

  return new Promise((resolve) => {
    const holder = document.createElement('div')
    holder.style.position = 'fixed'
    holder.style.left = '50%'
    holder.style.bottom = '16px'
    holder.style.transform = 'translateX(-50%)'
    holder.style.zIndex = '999'
    document.body.appendChild(holder)

    let settled = false
    let widgetId
    const finish = (token) => {
      if (settled) return
      settled = true
      try { window.turnstile.remove(widgetId) } catch { /* ignore */ }
      holder.remove()
      resolve(token)
    }

    try {
      widgetId = window.turnstile.render(holder, {
        sitekey: SITEKEY,
        appearance: 'interaction-only', // invisible unless a human check is needed
        callback: (token) => finish(token),
        'error-callback': () => finish(undefined),
        'timeout-callback': () => finish(undefined),
      })
    } catch {
      finish(undefined)
      return
    }

    // Never let the widget hang an auth call forever.
    setTimeout(() => finish(undefined), 20000)
  })
}
