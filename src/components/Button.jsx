// Button.jsx
// Reusable button component with two variants: primary and ghost.
// Use these everywhere — never write inline button styles in screens.

import { RADIUS, BRAND_GRADIENT } from '../styles/colors'
import { useUser } from '../context/UserContext'

export function PrimaryButton({ onClick, children, disabled = false, style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled
          ? '#B9C6E0'
          : BRAND_GRADIENT,
        color: 'white',
        border: 'none',
        borderRadius: RADIUS.lg,
        padding: '15px 24px',
        fontSize: 16,
        fontWeight: 700,
        cursor: disabled ? 'default' : 'pointer',
        width: '100%',
        marginTop: 12,
        letterSpacing: 0.3,
        transition: 'opacity 0.2s',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function GhostButton({ onClick, children, style = {} }) {
  const { COLORS } = useUser()
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        color: COLORS.green,
        border: `1.5px solid ${COLORS.border}`,
        borderRadius: RADIUS.md,
        padding: '12px 20px',
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
        width: '100%',
        marginTop: 10,
        transition: 'background 0.15s',
        ...style,
      }}
      onMouseEnter={e => e.currentTarget.style.background = COLORS.soft}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {children}
    </button>
  )
}

export function IconButton({ onClick, children, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: RADIUS.sm,
      }}
    >
      {children}
    </button>
  )
}
