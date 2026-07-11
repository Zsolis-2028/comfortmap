// ComfortMap Design Tokens
// All colors, spacing, and radius live here.
// Change once — updates everywhere.
//
// COLORS is the light theme (the app's default look). DARK_COLORS mirrors
// the same keys with dark-surface-friendly values — components never
// import either directly; they read the active one from useUser().COLORS,
// which resolves based on the user's Dark Mode setting.

export const COLORS = {
  // Brand — blue, purple & teal (matches the ComfortMap pin logo)
  forest:   '#1a1a2e', // headings, high-emphasis text
  green:    '#1a1a2e', // body-weight brand text/icons
  mint:     '#2EC4B6', // teal — accent labels & bullets (needs contrast on cards)
  pale:     '#E4EEFC', // light blue tint — icon circle backgrounds
  soft:     '#FFFFFF', // primary app background

  // UI
  white:    '#FFFFFF', // card surface
  text:     '#1a1a2e',
  muted:    '#6b7280',
  border:   '#D2E3F6',

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
  // Brand (blue/purple/teal family, kept legible on dark surfaces)
  forest:   '#E8E8F5',
  green:    '#C7CEEA',
  mint:     '#3DDBC9',
  pale:     '#22283F',
  soft:     '#15162B',

  // UI
  white:    '#1E2038',
  text:     '#EDEAF0',
  muted:    '#A3A8C0',
  border:   '#3A3F5C',

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
export const BRAND_GRADIENT = 'linear-gradient(135deg, #4A90D9, #7B68EE)'

export const RADIUS = {
  sm:  '8px',
  md:  '12px',
  lg:  '14px',
  xl:  '16px',
  pill:'999px',
}

export const SHADOW = {
  card: '0 2px 12px rgba(0,0,0,0.06)',
  header: '0 1px 0 #D2E3F6',
}
