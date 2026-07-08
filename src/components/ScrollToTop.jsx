// ScrollToTop.jsx
// React Router doesn't reset scroll position on navigation — without this,
// a screen reached while the previous one was scrolled opens mid-scroll,
// hiding content behind the sticky header.

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
