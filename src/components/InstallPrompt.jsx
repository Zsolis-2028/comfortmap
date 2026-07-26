// InstallPrompt.jsx
// Gentle "add to home screen" nudge — turns mobile visitors into installs.
// Android/Chrome: uses the real beforeinstallprompt event + an Install button.
// iOS Safari (no such event): shows the manual Share → Add to Home Screen hint.
// Never shows if already installed, and remembers a dismissal so it won't nag.

import { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { BRAND_GRADIENT } from '../styles/colors'

const DISMISS_KEY = 'cm_install_dismissed'

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

const isIOS = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream

export default function InstallPrompt() {
  const { COLORS } = useUser()
  const [deferred, setDeferred] = useState(null)
  const [show, setShow] = useState(false)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    try { if (localStorage.getItem(DISMISS_KEY)) return } catch { /* ignore */ }

    if (isIOS()) {
      setIos(true)
      const t = setTimeout(() => setShow(true), 3500)
      return () => clearTimeout(t)
    }

    const onBIP = (e) => {
      e.preventDefault()
      setDeferred(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onBIP)
    return () => window.removeEventListener('beforeinstallprompt', onBIP)
  }, [])

  const dismiss = () => {
    setShow(false)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
  }

  const install = async () => {
    if (!deferred) return
    deferred.prompt()
    try { await deferred.userChoice } catch { /* ignore */ }
    setDeferred(null)
    dismiss()
  }

  if (!show) return null

  return (
    <div style={{ position: 'fixed', left: 12, right: 12, bottom: 88, zIndex: 250, display: 'flex', justifyContent: 'center' }}>
      <div style={{
        background: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        boxShadow: '0 8px 28px rgba(20,30,60,0.18)',
        borderRadius: 18,
        padding: '14px 16px',
        maxWidth: 440,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <img src="/icons/icon-192.png" alt="" width={40} height={40} style={{ borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.forest }}>Add ComfortMap to your phone</div>
          <div style={{ fontSize: 12.5, color: COLORS.muted, lineHeight: 1.5, marginTop: 2 }}>
            {ios
              ? <>Tap <span style={{ fontWeight: 700 }}>Share</span> <span aria-hidden="true">⬆️</span>, then <span style={{ fontWeight: 700 }}>“Add to Home Screen.”</span></>
              : 'Open it like an app — one tap from your home screen.'}
          </div>
        </div>
        {ios ? (
          <button onClick={dismiss} aria-label="Dismiss" style={{ background: 'none', border: 'none', color: COLORS.muted, fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 4 }}>×</button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={install} style={{ background: BRAND_GRADIENT, color: '#fff', border: 'none', borderRadius: 10, padding: '9px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Install</button>
            <button onClick={dismiss} aria-label="Dismiss" style={{ background: 'none', border: 'none', color: COLORS.muted, fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 4 }}>×</button>
          </div>
        )}
      </div>
    </div>
  )
}
