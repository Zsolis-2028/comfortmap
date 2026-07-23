// App.jsx
// Root component — sets up routing and wraps everything in UserProvider.
// All screens are defined here with their routes.

import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { UserProvider } from './context/UserContext'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import ScrollToTop from './components/ScrollToTop'
import CookieConsent from './components/CookieConsent'
import SkipLink from './components/SkipLink'
import OfflineScreen from './screens/OfflineScreen'

// Wrap a lazy import so that if a chunk fails to load — almost always because a
// new deploy replaced the old hashed file while this page was still open — we
// reload once to fetch the fresh build instead of surfacing an error. Guarded
// by a timestamp so it can never turn into a reload loop.
function lazyWithRetry(importer) {
  return lazy(() =>
    importer().catch((err) => {
      const last = Number(sessionStorage.getItem('cm_chunk_reload_at') || 0)
      if (Date.now() - last > 10000) {
        sessionStorage.setItem('cm_chunk_reload_at', String(Date.now()))
        window.location.reload()
        return new Promise(() => {}) // never resolves; the page is reloading
      }
      throw err
    })
  )
}

// Screens — lazy-loaded so each route ships its own chunk instead of
// bloating the initial bundle.
const SplashScreen      = lazyWithRetry(() => import('./screens/SplashScreen'))
const LandingScreen     = lazyWithRetry(() => import('./screens/LandingScreen'))
const OnboardingLang     = lazyWithRetry(() => import('./screens/OnboardingLang'))
const OnboardingWho      = lazyWithRetry(() => import('./screens/OnboardingWho'))
const OnboardingSensory  = lazyWithRetry(() => import('./screens/OnboardingSensory'))
const HomeScreen         = lazyWithRetry(() => import('./screens/HomeScreen'))
const InputScreen        = lazyWithRetry(() => import('./screens/InputScreen'))
const ReportScreen       = lazyWithRetry(() => import('./screens/ReportScreen'))
const AuthScreen         = lazyWithRetry(() => import('./screens/AuthScreen'))
const ExploreScreen      = lazyWithRetry(() => import('./screens/ExploreScreen'))
const VenueScreen        = lazyWithRetry(() => import('./screens/VenueScreen'))
const VenuePreviewScreen = lazyWithRetry(() => import('./screens/VenuePreviewScreen'))
const PhotoReviewScreen  = lazyWithRetry(() => import('./screens/PhotoReviewScreen'))
const ResultScreen       = lazyWithRetry(() => import('./screens/ResultScreen'))
const SavedScreen        = lazyWithRetry(() => import('./screens/SavedScreen'))
const SettingsScreen     = lazyWithRetry(() => import('./screens/SettingsScreen'))
const AboutScreen        = lazyWithRetry(() => import('./screens/AboutScreen'))
const PrivacyScreen      = lazyWithRetry(() => import('./screens/PrivacyScreen'))
const TermsScreen        = lazyWithRetry(() => import('./screens/TermsScreen'))
const RefundScreen       = lazyWithRetry(() => import('./screens/RefundScreen'))
const AiDisclosureScreen = lazyWithRetry(() => import('./screens/AiDisclosureScreen'))
const DataRetentionScreen = lazyWithRetry(() => import('./screens/DataRetentionScreen'))
const AccessibilityStatementScreen = lazyWithRetry(() => import('./screens/AccessibilityStatementScreen'))
const NotFoundScreen     = lazyWithRetry(() => import('./screens/NotFoundScreen'))

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
            <Route path="/welcome"               element={<LandingScreen />} />

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
            <Route path="/venue"                 element={<VenueScreen />} />
            <Route path="/preview"               element={<VenuePreviewScreen />} />
            <Route path="/result"                element={<ResultScreen />} />
            <Route path="/saved"                 element={<SavedScreen />} />
            <Route path="/settings"              element={<SettingsScreen />} />
            <Route path="/settings/photos"       element={<PhotoReviewScreen />} />
            <Route path="/settings/about"        element={<AboutScreen />} />
            <Route path="/settings/privacy"      element={<PrivacyScreen />} />
            <Route path="/terms"                 element={<TermsScreen />} />
            <Route path="/settings/refund"       element={<RefundScreen />} />
            <Route path="/settings/ai"           element={<AiDisclosureScreen />} />
            <Route path="/settings/data"         element={<DataRetentionScreen />} />
            <Route path="/settings/accessibility" element={<AccessibilityStatementScreen />} />

            {/* Fallback — custom 404 */}
            <Route path="*"                      element={<NotFoundScreen />} />
          </Routes>
        </Suspense>
      ) : (
        <OfflineScreen />
      )}
      <CookieConsent />
      <Analytics />
    </UserProvider>
  )
}
