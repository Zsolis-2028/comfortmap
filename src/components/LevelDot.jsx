// LevelDot.jsx
// Colored dot indicator for comfort factor levels.
// green = low, amber = medium, red = high

export default function LevelDot({ level }) {
  const colors = {
    low:    '#22c55e',
    medium: '#f59e0b',
    high:   '#ef4444',
  }

  return (
    <span style={{
      display: 'inline-block',
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: colors[level] || '#d1d5db',
      marginRight: 6,
      flexShrink: 0,
    }} />
  )
}
