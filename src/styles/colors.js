// ComfortMap Design Tokens
// All colors, spacing, and radius live here.
// Change once — updates everywhere.
//
// COLORS is the light theme (the app's default look). DARK_COLORS mirrors
// the same keys with dark-surface-friendly values — components never
// import either directly; they read the active one from useUser().COLORS,
// which resolves based on the user's Dark Mode setting.

export const COLORS = {
  // Brand
  forest:   '#1b4332',
  green:    '#2d6a4f',
  mint:     '#40916c',
  pale:     '#d8f3dc',
  soft:     '#f0fdf4',

  // UI
  white:    '#ffffff',
  text:     '#1a202c',
  muted:    '#6b7280',
  border:   '#bbf7d0',

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
  // Brand (kept legible on dark surfaces)
  forest:   '#eafbf1',
  green:    '#7cc9a0',
  mint:     '#52c98f',
  pale:     '#1c3327',
  soft:     '#0f1a14',

  // UI
  white:    '#182a20',
  text:     '#e8f5ee',
  muted:    '#93ab9f',
  border:   '#2a4536',

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
export const BRAND_GRADIENT = 'linear-gradient(135deg, #1b4332, #2d6a4f)'

export const RADIUS = {
  sm:  '8px',
  md:  '12px',
  lg:  '14px',
  xl:  '16px',
  pill:'999px',
}

export const SHADOW = {
  card: '0 2px 12px rgba(0,0,0,0.06)',
  header: '0 1px 0 #bbf7d0',
}
