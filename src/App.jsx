// App.jsx
// Root component — sets up routing and wraps everything in UserProvider.
// All screens are defined here with their routes.

import { Routes, Route } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import ScrollToTop from './components/ScrollToTop'
import CookieConsent from './components/CookieConsent'
import SkipLink from './components/SkipLink'

// Screens
import SplashScreen       from './screens/SplashScreen'
import OnboardingLang     from './screens/OnboardingLang'
import OnboardingWho      from './screens/OnboardingWho'
import OnboardingSensory  from './screens/OnboardingSensory'
import HomeScreen         from './screens/HomeScreen'
import InputScreen        from './screens/InputScreen'
import ResultScreen       from './screens/ResultScreen'
import SavedScreen        from './screens/SavedScreen'
import SettingsScreen     from './screens/SettingsScreen'
import AboutScreen        from './screens/AboutScreen'
import PrivacyScreen      from './screens/PrivacyScreen'
import TermsScreen        from './screens/TermsScreen'
import NotFoundScreen     from './screens/NotFoundScreen'
import OfflineScreen      from './screens/OfflineScreen'

export default function App() {
  const isOnline = useOnlineStatus()

  return (
    <UserProvider>
      <SkipLink />
      <ScrollToTop />
      {isOnline ? (
        <Routes>
          {/* Splash */}
          <Route path="/"                      element={<SplashScreen />} />

          {/* Onboarding */}
          <Route path="/onboarding/language"   element={<OnboardingLang />} />
          <Route path="/onboarding/who"        element={<OnboardingWho />} />
          <Route path="/onboarding/sensory"    element={<OnboardingSensory />} />

          {/* Main app */}
          <Route path="/home"                  element={<HomeScreen />} />
          <Route path="/input"                 element={<InputScreen />} />
          <Route path="/result"                element={<ResultScreen />} />
          <Route path="/saved"                 element={<SavedScreen />} />
          <Route path="/settings"              element={<SettingsScreen />} />
          <Route path="/settings/about"        element={<AboutScreen />} />
          <Route path="/settings/privacy"      element={<PrivacyScreen />} />
          <Route path="/terms"                 element={<TermsScreen />} />

          {/* Fallback — custom 404 */}
          <Route path="*"                      element={<NotFoundScreen />} />
        </Routes>
      ) : (
        <OfflineScreen />
      )}
      <CookieConsent />
    </UserProvider>
  )
}
