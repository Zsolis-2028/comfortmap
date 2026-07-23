// AuthScreen.jsx
// Optional email/password login + signup. The app works fine without an
// account; this just lets a user's history and plan follow them across devices.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { RADIUS } from '../styles/colors'
import Header from '../components/Header'
import Screen from '../components/Screen'
import { PrimaryButton, GhostButton } from '../components/Button'
import { signUp, signIn } from '../lib/auth'

export default function AuthScreen() {
  const navigate = useNavigate()
  const { COLORS } = useUser()

  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle') // idle | working | needsConfirm | error
  const [message, setMessage] = useState('')

  const canSubmit = email.trim().length > 3 && password.length >= 8 && status !== 'working'

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
    setStatus('working')
    setMessage('')
    try {
      if (mode === 'signup') {
        const data = await signUp(email.trim(), password)
        if (data?.session) {
          navigate('/home') // instant (email confirmation is off)
        } else {
          setStatus('needsConfirm')
          setMessage('Check your email to confirm your account, then come back and sign in.')
        }
      } else {
        await signIn(email.trim(), password)
        navigate('/home')
      }
    } catch (err) {
      setStatus('error')
      setMessage(err.message || 'Something went wrong. Please try again.')
    }
  }

  const switchMode = () => {
    setMode(mode === 'signup' ? 'signin' : 'signup')
    setMessage('')
    setStatus('idle')
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.soft }}>
      <Header title={mode === 'signup' ? 'Create account' : 'Sign in'} onBack={() => navigate('/home')} />
      <Screen>
        <p style={{ fontSize: 14, color: COLORS.muted, margin: '16px 0', lineHeight: 1.6 }}>
          {mode === 'signup'
            ? 'Create an account so your history and plan follow you across devices. Totally optional — ComfortMap works without one.'
            : 'Welcome back. Sign in to pick up where you left off.'}
        </p>

        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          style={inputStyle}
          onKeyDown={e => { if (e.key === 'Enter' && canSubmit) handleSubmit() }}
        />
        <input
          type="password"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password (8+ characters)"
          style={inputStyle}
          onKeyDown={e => { if (e.key === 'Enter' && canSubmit) handleSubmit() }}
        />

        {message && (
          <div style={{
            background: status === 'needsConfirm' ? COLORS.success : COLORS.error,
            color: status === 'needsConfirm' ? COLORS.successText : COLORS.errorText,
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
          {status === 'working' ? 'Please wait…' : (mode === 'signup' ? 'Create account' : 'Sign in')}
        </PrimaryButton>

        <GhostButton onClick={switchMode}>
          {mode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </GhostButton>

        <button
          onClick={() => navigate('/home')}
          style={{
            display: 'block',
            width: '100%',
            marginTop: 14,
            background: 'none',
            border: 'none',
            color: COLORS.muted,
            fontSize: 13,
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          Continue without an account
        </button>
      </Screen>
    </div>
  )
}
