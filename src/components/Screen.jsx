// Screen.jsx
// Wrapper for all screen content.
// Handles max-width, padding, and bottom space for the nav bar.

export default function Screen({ children, pad = true, style = {} }) {
  return (
    <div style={{
      maxWidth: 480,
      margin: '0 auto',
      padding: pad ? '0 20px 100px' : '0 0 100px',
      minHeight: '100vh',
      ...style,
    }}>
      {children}
    </div>
  )
}
