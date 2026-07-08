// UserContext.jsx
// Global state for the whole app.
// Language, sensory profile, who the app is for — all lives here.
// Any screen can read or update it with useUser().

import { createContext, useContext, useState, useEffect } from 'react'
import { COLORS, DARK_COLORS } from '../styles/colors'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [lang, setLang] = useState(() => {
    // Try to restore from localStorage on first load
    return localStorage.getItem('cm_lang') || 'en'
  })

  const [who, setWho] = useState(() => {
    return localStorage.getItem('cm_who') || null
  })

  const [sensory, setSensory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cm_sensory')) || []
    } catch {
      return []
    }
  })

  const [savedMaps, setSavedMaps] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cm_saved')) || []
    } catch {
      return []
    }
  })

  const [onboardingDone, setOnboardingDone] = useState(() => {
    return localStorage.getItem('cm_onboarded') === 'true'
  })

  // Display settings
  const [textSize, setTextSize] = useState(() => {
    return localStorage.getItem('cm_textSize') || 'medium'
  })

  const [darkMode, setDarkMode] = useState(() => {
    // 'off' | 'on' | 'system'
    return localStorage.getItem('cm_darkMode') || 'system'
  })

  const [accessibility, setAccessibility] = useState(() => {
    return localStorage.getItem('cm_accessibility') === 'true'
  })

  // Tracks the OS/browser color scheme so darkMode:'system' can follow it live
  const [systemPrefersDark, setSystemPrefersDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setSystemPrefersDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const isDark = darkMode === 'on' || (darkMode === 'system' && systemPrefersDark)
  const COLORS_ACTIVE = isDark ? DARK_COLORS : COLORS

  // Persist everything to localStorage whenever it changes
  useEffect(() => { localStorage.setItem('cm_lang', lang) }, [lang])
  useEffect(() => { localStorage.setItem('cm_who', who) }, [who])
  useEffect(() => { localStorage.setItem('cm_sensory', JSON.stringify(sensory)) }, [sensory])
  useEffect(() => { localStorage.setItem('cm_saved', JSON.stringify(savedMaps)) }, [savedMaps])
  useEffect(() => { if (onboardingDone) localStorage.setItem('cm_onboarded', 'true') }, [onboardingDone])
  useEffect(() => { localStorage.setItem('cm_textSize', textSize) }, [textSize])
  useEffect(() => { localStorage.setItem('cm_darkMode', darkMode) }, [darkMode])
  useEffect(() => { localStorage.setItem('cm_accessibility', String(accessibility)) }, [accessibility])

  // Apply the settings that need to live outside React (CSS scale, page
  // background behind the app shell, reduced-motion class)
  useEffect(() => {
    document.documentElement.setAttribute('data-text-size', textSize)
  }, [textSize])

  useEffect(() => {
    document.documentElement.classList.toggle('accessibility-mode', accessibility)
  }, [accessibility])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    document.body.style.background = COLORS_ACTIVE.soft
  }, [isDark])

  const toggleSensory = (key) => {
    setSensory(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const saveMap = (map) => {
    const newMap = { ...map, id: Date.now(), savedAt: new Date().toISOString() }
    setSavedMaps(prev => [newMap, ...prev])
    return newMap.id
  }

  const deleteMap = (id) => {
    setSavedMaps(prev => prev.filter(m => m.id !== id))
  }

  const completeOnboarding = () => setOnboardingDone(true)
  const resetOnboarding = () => {
    setOnboardingDone(false)
    localStorage.removeItem('cm_onboarded')
  }

  return (
    <UserContext.Provider value={{
      lang, setLang,
      who, setWho,
      sensory, setSensory, toggleSensory,
      savedMaps, saveMap, deleteMap,
      onboardingDone, completeOnboarding, resetOnboarding,
      textSize, setTextSize,
      darkMode, setDarkMode,
      accessibility, setAccessibility,
      isDark,
      COLORS: COLORS_ACTIVE,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>')
  return ctx
}
