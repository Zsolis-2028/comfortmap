// src/lib/attributes.js
// The 7 sensory categories, shared by the report (write) side and the
// display (read) side so their labels never drift apart.
// Rating scale: 1 = calmest / easiest, 3 = most intense / hardest.

export const ATTRIBUTES = [
  { key: 'noise',         label: 'Noise',           options: ['Quiet', 'Moderate', 'Loud'] },
  { key: 'crowds',        label: 'Crowds',          options: ['Empty', 'Some', 'Packed'] },
  { key: 'lighting',      label: 'Lighting',        options: ['Dim', 'Normal', 'Bright / harsh'] },
  { key: 'parking',       label: 'Parking',         options: ['Easy', 'Okay', 'Hard'] },
  { key: 'check_in',      label: 'Check-in',        options: ['Simple', 'A few steps', 'Confusing'] },
  { key: 'accessibility', label: 'Accessibility',   options: ['Good', 'Partial', 'Poor'] },
  { key: 'sensory',       label: 'Overall sensory', options: ['Calm', 'Manageable', 'Overwhelming'] },
]

// Turn an average rating (1..3, possibly fractional) into its human label.
export function labelForRating(attr, rating) {
  if (rating == null) return null
  const idx = Math.min(2, Math.max(0, Math.round(rating) - 1))
  return attr.options[idx]
}
