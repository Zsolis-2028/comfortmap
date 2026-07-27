// ResetPasswordScreen.jsx
// Where the password-reset email link lands. Supabase parses the recovery token
// from the URL and gives the user a temporary session; here they set a new
// password. Reached at /reset-password.

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { RADIUS } from '../styles/colors'
import Header from '../components/Header'
import Screen from '../components/Screen'
import { PrimaryButton } from '../components/Button'
import { updatePassword } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'

export default function ResetPasswordScreen() {
  const navigate = useNavigate()
  const { COLORS } = useUser()
  const [ready, setReady] = useState(false) // recovery session detected?
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle') // idle | working | done | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Arriving from the email link, Supabase parses the URL hash and emits a
    // PASSWORD_RECOVERY event with a temporary session. Also handle the case
    // where a session already exists.
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true) })
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true)
    })
    return () => { sub.subscription.unsubscribe() }
  }, [])

  const canSubmit = password.length >= 8 && status !== 'working' && status !== 'done'

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: RADIUS.lg,
    border: `1.5px solid ${COLORS.border}`,
    padding: '14px 16px',
    fontSize: 15,
    fontFamily: 'inherit',
    outline: 'none',
    background: COLORS.white,
    color: COLORS.text,
    marginBottom: 12,
  }

  const handleSubmit = async () => {
    setStatus('working'); setMessage('')
    try {
      await updatePassword(password)
      setStatus('done')
      setMessage('Password updated! Taking you to the app…')
      setTimeout(() => navigate('/home'), 1600)
    } catch (err) {
      setStatus('error')
      setMessage(err.message || 'Could not update your password. The reset link may have expired — request a new one from the sign-in screen.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.pale }}>
      <Header title="Set a new password" onBack={() => navigate('/auth')} />
      <Screen>
        <p style={{ fontSize: 14, color: COLORS.muted, margin: '16px 0', lineHeight: 1.6 }}>
          Choose a new password for your account. Make it at least 8 characters.
        </p>

        {!ready && status === 'idle' && (
          <div style={{ background: COLORS.warn, color: COLORS.warnText, borderRadius: RADIUS.md, padding: '10px 14px', fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>
            Open this page from the reset link in your email. If you got here another way, request a new link from the sign-in screen.
          </div>
        )}

        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="New password (8+ characters)"
          style={inputStyle}
          onKeyDown={e => { if (e.key === 'Enter' && canSubmit) handleSubmit() }}
        />

        {message && (
          <div style={{
            background: status === 'done' ? COLORS.success : COLORS.error,
            color: status === 'done' ? COLORS.successText : COLORS.errorText,
            borderRadius: RADIUS.md,
            padding: '10px 14px',
            fontSize: 13,
            lineHeight: 1.5,
            marginBottom: 4,
          }}>
            {message}
          </div>
        )}

        <PrimaryButton onClick={handleSubmit} disabled={!canSubmit}>
          {status === 'working' ? 'Updating…' : 'Update password'}
        </PrimaryButton>
      </Screen>
    </div>
  )
}
