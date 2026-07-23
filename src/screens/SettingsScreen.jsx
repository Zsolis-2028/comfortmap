// SettingsScreen.jsx
// App settings — language, sensory profile, display, about.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { LANGUAGES, getText } from '../data/languages'
import { WHO_OPTIONS, getWhoLabel } from '../data/sensoryOptions'
import { RADIUS } from '../styles/colors'
import Header from '../components/Header'
import Screen from '../components/Screen'
import NavBar from '../components/NavBar'
import { signOut } from '../lib/auth'
import { startProCheckout } from '../lib/billing'

// Billing is OFF during the free beta. To turn on paid upgrades when you go
// live, set VITE_BILLING_ENABLED=true in Vercel and redeploy.
const BILLING_ENABLED = import.meta.env.VITE_BILLING_ENABLED === 'true'

const TEXT_SIZE_OPTIONS = [
  { value: 'small',  labelKey: 'textSizeSmall',  fallback: 'Small' },
  { value: 'medium', labelKey: 'textSizeMedium', fallback: 'Medium' },
  { value: 'large',  labelKey: 'textSizeLarge',  fallback: 'Large' },
  { value: 'xlarge', labelKey: 'textSizeXLarge', fallback: 'Extra Large' },
]

const DARK_MODE_OPTIONS = [
  { value: 'off',    labelKey: 'toggleOff',    fallback: 'Off' },
  { value: 'on',     labelKey: 'toggleOn',     fallback: 'On' },
  { value: 'system', labelKey: 'toggleSystem', fallback: 'System' },
]

const ACCESSIBILITY_OPTIONS = [
  { value: 'off', labelKey: 'toggleOff', fallback: 'Off' },
  { value: 'on',  labelKey: 'toggleOn',  fallback: 'On' },
]

function SettingsGroup({ title, COLORS, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontSize: 11,
        color: COLORS.muted,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        fontWeight: 700,
        marginBottom: 8,
        paddingLeft: 4,
      }}>
        {title}
      </div>
      <div style={{
        background: COLORS.white,
        border: `1.5px solid ${COLORS.border}`,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  )
}

function SettingsRow({ emoji, label, value, onClick, last = false, COLORS, ariaExpanded }) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }) : undefined}
      aria-label={onClick ? `${label}${value ? `, ${value}` : ''}` : undefined}
      aria-expanded={ariaExpanded}
      style={{
        background: COLORS.white,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 16px',
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: last ? 'none' : `1px solid ${COLORS.border}`,
        transition: onClick ? 'background 0.15s' : undefined,
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = COLORS.soft }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.background = COLORS.white }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 18 }} aria-hidden="true">{emoji}</span>
        <span style={{ fontSize: 15, color: COLORS.text }}>{label}</span>
      </div>
      <span style={{ fontSize: 13, color: COLORS.muted }} aria-hidden="true">
        {value} {onClick ? '›' : ''}
      </span>
    </div>
  )
}

// A settings row that expands in place into a row of selectable pill
// options — used for Text size / Dark mode / Accessibility mode, which
// are simple single-choice settings that don't need their own screen.
function OptionRow({ emoji, label, options, value, onChange, expanded, onToggle, last, COLORS, t }) {
  const current = options.find(o => o.value === value)
  const optionLabel = (opt) => (t[opt.labelKey] || opt.fallback)
  return (
    <>
      <SettingsRow
        emoji={emoji}
        label={label}
        value={current ? optionLabel(current) : ''}
        onClick={onToggle}
        last={!expanded && last}
        COLORS={COLORS}
        ariaExpanded={expanded}
      />
      {expanded && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          padding: '2px 16px 14px',
          borderBottom: last ? 'none' : `1px solid ${COLORS.border}`,
        }}>
          {options.map(opt => {
            const active = opt.value === value
            return (
              <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                aria-pressed={active}
                style={{
                  background: active ? COLORS.pale : 'transparent',
                  border: `1.5px solid ${active ? COLORS.mint : COLORS.border}`,
                  borderRadius: RADIUS.pill,
                  padding: '6px 14px',
                  fontSize: 13,
                  fontWeight: active ? 700 : 400,
                  color: active ? COLORS.forest : COLORS.text,
                  cursor: 'pointer',
                }}
              >
                {optionLabel(opt)}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

export default function SettingsScreen() {
  const navigate = useNavigate()
  const {
    lang, who, sensory, resetOnboarding, COLORS,
    textSize, setTextSize,
    darkMode, setDarkMode,
    accessibility, setAccessibility,
    session, plan, signedIn,
  } = useUser()
  const t = getText(lang)
  const [expandedRow, setExpandedRow] = useState(null)

  const toggleRow = (key) => setExpandedRow(prev => prev === key ? null : key)

  const planLabel = ({
    founder: 'Founder · unlimited',
    pro: 'Pro',
    family: 'Family',
    free: 'Free',
  })[plan] || 'Free'

  const [upgradeBusy, setUpgradeBusy] = useState(false)
  const [upgradeError, setUpgradeError] = useState('')

  const handleSignOut = async () => {
    try { await signOut() } catch {}
    navigate('/home')
  }

  const handleUpgrade = async () => {
    setUpgradeBusy(true); setUpgradeError('')
    try { await startProCheckout() } // redirects to Stripe on success
    catch (e) { setUpgradeError(e.message || 'Could not start checkout.'); setUpgradeBusy(false) }
  }

  const langLabel = LANGUAGES.find(l => l.code === lang)?.label || 'English'
  const whoOption = WHO_OPTIONS.find(w => w.key === who)
  const whoLabel = whoOption ? getWhoLabel(whoOption, lang) : (t.notSet || 'Not set')

  return (
    <div style={{ minHeight: '100vh', background: COLORS.soft }}>
      <Header title={t.settings || 'Settings'} />
      <Screen>
        <div style={{ marginTop: 16 }}>

          <SettingsGroup title={t.account || 'Account'} COLORS={COLORS}>
            {signedIn ? (
              <>
                <SettingsRow
                  emoji="👤"
                  label={(session && session.user && session.user.email) || 'Signed in'}
                  value={planLabel}
                  COLORS={COLORS}
                />
                <SettingsRow
                  emoji="🚪"
                  label={t.signOut || 'Sign out'}
                  value=""
                  onClick={handleSignOut}
                  last
                  COLORS={COLORS}
                />
              </>
            ) : (
              <SettingsRow
                emoji="🔑"
                label={t.signInCreate || 'Sign in / Create account'}
                value=""
                onClick={() => navigate('/auth')}
                last
                COLORS={COLORS}
              />
            )}
          </SettingsGroup>

          {BILLING_ENABLED && signedIn && plan === 'free' && (
            <SettingsGroup title="ComfortMap Pro" COLORS={COLORS}>
              <SettingsRow
                emoji="✨"
                label={upgradeBusy ? 'Opening checkout…' : 'Upgrade to Pro — $5.99/mo'}
                value=""
                onClick={upgradeBusy ? undefined : handleUpgrade}
                last
                COLORS={COLORS}
              />
            </SettingsGroup>
          )}
          {upgradeError && (
            <div style={{ background: COLORS.error, color: COLORS.errorText, borderRadius: RADIUS.md, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
              {upgradeError}
            </div>
          )}

          {plan === 'founder' && (
            <SettingsGroup title="Founder" COLORS={COLORS}>
              <SettingsRow
                emoji="🖼️"
                label="Review photos"
                value=""
                onClick={() => navigate('/settings/photos')}
                last
                COLORS={COLORS}
              />
            </SettingsGroup>
          )}

          <SettingsGroup title={t.profileSection || 'Profile'} COLORS={COLORS}>
            <SettingsRow
              emoji="🌍"
              label={t.language || 'Language'}
              value={langLabel}
              onClick={() => navigate('/onboarding/language')}
              COLORS={COLORS}
            />
            <SettingsRow
              emoji="👤"
              label={t.whoFor || 'Who is this for'}
              value={whoLabel}
              onClick={() => navigate('/onboarding/who')}
              last
              COLORS={COLORS}
            />
          </SettingsGroup>

          <SettingsGroup title={t.sensoryProfile || 'Sensory Profile'} COLORS={COLORS}>
            <SettingsRow
              emoji="🧠"
              label={t.activeSens || 'Active sensitivities'}
              value={sensory.length > 0 ? (t.selectedCount || '{n} selected').replace('{n}', sensory.length) : (t.noneSelected || 'None')}
              COLORS={COLORS}
            />
            <SettingsRow
              emoji="✏️"
              label={t.editSens || 'Edit sensory profile'}
              value=""
              onClick={() => navigate('/onboarding/sensory')}
              last
              COLORS={COLORS}
            />
          </SettingsGroup>

          <SettingsGroup title={t.display || 'Display'} COLORS={COLORS}>
            <OptionRow
              emoji="🔤"
              label={t.textSize || 'Text size'}
              options={TEXT_SIZE_OPTIONS}
              value={textSize}
              onChange={setTextSize}
              expanded={expandedRow === 'textSize'}
              onToggle={() => toggleRow('textSize')}
              COLORS={COLORS}
              t={t}
            />
            <OptionRow
              emoji="🌙"
              label={t.darkMode || 'Dark mode'}
              options={DARK_MODE_OPTIONS}
              value={darkMode}
              onChange={setDarkMode}
              expanded={expandedRow === 'darkMode'}
              onToggle={() => toggleRow('darkMode')}
              COLORS={COLORS}
              t={t}
            />
            <OptionRow
              emoji="♿"
              label={t.accessibility || 'Accessibility mode'}
              options={ACCESSIBILITY_OPTIONS}
              value={accessibility ? 'on' : 'off'}
              onChange={(v) => setAccessibility(v === 'on')}
              expanded={expandedRow === 'accessibility'}
              onToggle={() => toggleRow('accessibility')}
              last
              COLORS={COLORS}
              t={t}
            />
          </SettingsGroup>

          <SettingsGroup title={t.about || 'About'} COLORS={COLORS}>
            <SettingsRow emoji="ℹ️" label={t.aboutApp || 'About ComfortMap'} value="" onClick={() => navigate('/settings/about')} COLORS={COLORS} />
            <SettingsRow emoji="🔒" label={t.privacy || 'Privacy policy'} value="" onClick={() => navigate('/settings/privacy')} COLORS={COLORS} />
            <SettingsRow emoji="📄" label={t.terms || 'Terms of service'} value="" onClick={() => navigate('/terms')} last COLORS={COLORS} />
          </SettingsGroup>

          {/* Dev tool — reset onboarding */}
          {import.meta.env.DEV && (
          <button
            onClick={() => { resetOnboarding(); navigate('/') }}
            style={{
              background: 'none',
              border: 'none',
              color: COLORS.muted,
              fontSize: 12,
              cursor: 'pointer',
              textDecoration: 'underline',
              display: 'block',
              margin: '0 auto',
            }}
          >
            {t.resetOnboardingDev || 'Reset onboarding (dev)'}
          </button>
          )}
        </div>
      </Screen>
      <NavBar />
    </div>
  )
}
