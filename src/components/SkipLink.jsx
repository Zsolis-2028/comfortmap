// SkipLink.jsx
// Hidden-until-focused link that lets keyboard/screen-reader users jump
// straight to the main content, bypassing the header and nav on every
// screen. Targets the #main-content landmark rendered by Screen.jsx.

import { useUser } from '../context/UserContext'
import { getText } from '../data/languages'

export default function SkipLink() {
  const { lang } = useUser()
  const t = getText(lang)
  return (
    <a href="#main-content" className="skip-link">
      {t.skipToContent || 'Skip to main content'}
    </a>
  )
}
