// Header.jsx
// Sticky top header used on all inner screens.
// Pass onBack to show a back arrow. Pass onRight + rightLabel for a right action.

import { useUser } from '../context/UserContext'

export default function Header({ title, onBack, onRight, rightLabel }) {
  const { COLORS, isDark } = useUser()
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px 12px',
      position: 'sticky',
      top: 0,
      background: isDark ? 'rgba(15,26,20,0.85)' : 'rgba(240,253,244,0.95)',
      backdropFilter: 'blur(8px)',
      borderBottom: `1px solid ${COLORS.border}`,
      zIndex: 50,
    }}>
      {/* Left — back button or spacer */}
      {onBack ? (
        <button
          onClick={onBack}
          aria-label="Go back"
          style={{
            background: 'none',
            border: 'none',
            fontSize: 22,
            cursor: 'pointer',
            color: COLORS.forest,
            padding: '4px 8px',
            lineHeight: 1,
          }}
        >
          ←
        </button>
      ) : (
        <div style={{ width: 44 }} />
      )}

      {/* Center — title */}
      <div style={{
        fontWeight: 700,
        fontSize: 17,
        color: COLORS.forest,
        textAlign: 'center',
        flex: 1,
      }}>
        {title}
      </div>

      {/* Right — action or spacer */}
      {onRight ? (
        <button
          onClick={onRight}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 13,
            cursor: 'pointer',
            color: COLORS.mint,
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {rightLabel}
        </button>
      ) : (
        <div style={{ width: 44 }} />
      )}
    </div>
  )
}
