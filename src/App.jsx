// App.jsx
// Root component — sets up routing and wraps everything in UserProvider.
// All screens are defined here with their routes.

import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import ScrollToTop from './components/ScrollToTop'
import CookieConsent from './components/CookieConsent'
import SkipLink from './components/SkipLink'
import OfflineScreen from './screens/OfflineScreen'

// Screens — lazy-loaded so each route ships its own chunk instead of
// bloating the initial bundle.
const SplashScreen      = lazy(() => import('./screens/SplashScreen'))
const OnboardingLang     = lazy(() => import('./screens/OnboardingLang'))
const OnboardingWho      = lazy(() => import('./screens/OnboardingWho'))
const OnboardingSensory  = lazy(() => import('./screens/OnboardingSensory'))
const HomeScreen         = lazy(() => import('./screens/HomeScreen'))
const InputScreen        = lazy(() => import('./screens/InputScreen'))
const ReportScreen       = lazy(() => import('./screens/ReportScreen'))
const AuthScreen         = lazy(() => import('./screens/AuthScreen'))
const ExploreScreen      = lazy(() => import('./screens/ExploreScreen'))
const ResultScreen       = lazy(() => import('./screens/ResultScreen'))
const SavedScreen        = lazy(() => import('./screens/SavedScreen'))
const SettingsScreen     = lazy(() => import('./screens/SettingsScreen'))
const AboutScreen        = lazy(() => import('./screens/AboutScreen'))
const PrivacyScreen      = lazy(() => import('./screens/PrivacyScreen'))
const TermsScreen        = lazy(() => import('./screens/TermsScreen'))
const NotFoundScreen     = lazy(() => import('./screens/NotFoundScreen'))

export default function App() {
  const isOnline = useOnlineStatus()

  return (
    <UserProvider>
      <SkipLink />
      <ScrollToTop />
      {isOnline ? (
        <Suspense fallback={null}>
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
            <Route path="/report"                element={<ReportScreen />} />
            <Route path="/auth"                  element={<AuthScreen />} />
            <Route path="/explore"               element={<ExploreScreen />} />
            <Route path="/result"                element={<ResultScreen />} />
            <Route path="/saved"                 element={<SavedScreen />} />
            <Route path="/settings"              element={<SettingsScreen />} />
            <Route path="/settings/about"        element={<AboutScreen />} />
            <Route path="/settings/privacy"      element={<PrivacyScreen />} />
            <Route path="/terms"                 element={<TermsScreen />} />

            {/* Fallback — custom 404 */}
            <Route path="*"                      element={<NotFoundScreen />} />
          </Routes>
        </Suspense>
      ) : (
        <OfflineScreen />
      )}
      <CookieConsent />
    </UserProvider>
  )
}
