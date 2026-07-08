// ComfortMap Design Tokens
// All colors, spacing, and radius live here.
// Change once — updates everywhere.
//
// COLORS is the light theme (the app's default look). DARK_COLORS mirrors
// the same keys with dark-surface-friendly values — components never
// import either directly; they read the active one from useUser().COLORS,
// which resolves based on the user's Dark Mode setting.

export const COLORS = {
  // Brand — warm cream & sage
  forest:   '#4A7C59', // dark green — headings, high-emphasis text
  green:    '#4A7C59', // dark green — body-weight brand text/icons (kept legible on cream)
  mint:     '#4A7C59', // dark green — accent labels & bullets (needs contrast on cards)
  pale:     '#E8EDE0', // light sage tint — icon circle backgrounds
  soft:     '#FDFAF5', // warm cream — primary app background

  // UI
  white:    '#F5F0E8', // card surface
  text:     '#1a202c',
  muted:    '#6b7280',
  border:   '#C8D5B9',

  // Status
  warn:     '#fef3c7',
  warnBorder:'#fde68a',
  warnText: '#92400e',
  error:    '#fee2e2',
  errorText:'#991b1b',
  success:  '#dcfce7',
  successText:'#166534',
}

export const DARK_COLORS = {
  // Brand (sage family, kept legible on dark surfaces)
  forest:   '#E8EDE0',
  green:    '#9CB89E',
  mint:     '#9CB89E',
  pale:     '#2A3527',
  soft:     '#1C211A',

  // UI
  white:    '#242A20',
  text:     '#EDEAE0',
  muted:    '#A3A895',
  border:   '#3D4A38',

  // Status
  warn:     '#3a2f12',
  warnBorder:'#6b5518',
  warnText: '#fde68a',
  error:    '#3a1414',
  errorText:'#fca5a5',
  success:  '#123a22',
  successText:'#86efac',
}

// The primary-button / hero-banner gradient is a fixed brand mark — it
// always pairs with white text, so it intentionally does not change
// between light and dark theme.
export const BRAND_GRADIENT = 'linear-gradient(135deg, #4A7C59, #7C9A7E)'

export const RADIUS = {
  sm:  '8px',
  md:  '12px',
  lg:  '14px',
  xl:  '16px',
  pill:'999px',
}

export const SHADOW = {
  card: '0 2px 12px rgba(0,0,0,0.06)',
  header: '0 1px 0 #C8D5B9',
}
