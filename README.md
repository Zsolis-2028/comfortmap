# 🗺️ ComfortMap

> Know before you go. Calm, sensory-aware navigation for every place on earth.

---

## What it is

ComfortMap is an AI-powered app that helps people feel safe, confident, and prepared before entering any real-world environment. It provides comfort-based navigation — not directions — focused on noise, crowds, lighting, sensory triggers, social expectations, and predictability.

Built for people with anxiety, autism, sensory sensitivities, PTSD, and anyone who wants to feel ready before walking through any door.

---

## Tech stack

- **React 18** + **Vite** — fast, modern frontend
- **React Router v6** — screen navigation
- **Claude API** (claude-sonnet-4-6) — the AI brain
- **localStorage** — saves user profile and maps between sessions

---

## Project structure

```
comfortmap/
├── public/                   Static assets
├── src/
│   ├── components/           Reusable UI pieces
│   │   ├── Button.jsx        PrimaryButton, GhostButton, IconButton
│   │   ├── Header.jsx        Sticky top bar with back/action
│   │   ├── NavBar.jsx        Fixed bottom nav (Explore / Saved / Settings)
│   │   ├── Screen.jsx        Page wrapper with padding
│   │   └── LevelDot.jsx      Color dot for noise/crowd levels
│   ├── screens/              One file per screen
│   │   ├── SplashScreen.jsx
│   │   ├── OnboardingLang.jsx
│   │   ├── OnboardingWho.jsx
│   │   ├── OnboardingSensory.jsx
│   │   ├── HomeScreen.jsx
│   │   ├── InputScreen.jsx
│   │   ├── ResultScreen.jsx
│   │   ├── SavedScreen.jsx
│   │   └── SettingsScreen.jsx
│   ├── data/                 All content and config
│   │   ├── languages.js      10 supported languages + UI strings
│   │   ├── venues.js         16 venue types with labels + hints
│   │   └── sensoryOptions.js 8 sensory flags + who options
│   ├── context/
│   │   └── UserContext.jsx   Global state (lang, profile, saved maps)
│   ├── utils/
│   │   └── claude.js         All AI logic — prompts + API calls
│   ├── styles/
│   │   ├── global.css        Base styles + animations
│   │   └── colors.js         Design tokens (all colors + spacing)
│   ├── App.jsx               Router + screen definitions
│   └── main.jsx              App entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Getting started

### 1. Install dependencies
```bash
npm install
```

### 2. Start the dev server
```bash
npm run dev
```

### 3. Open in browser
```
http://localhost:5173
```

---

## Adding a new language

Open `src/data/languages.js` and add to:
1. The `LANGUAGES` array — code, flag, label, dir
2. The `UI_TEXT` object — copy the `en` block and translate

The AI responds in whatever language the user writes in automatically.

---

## Adding a new venue type

Open `src/data/venues.js` and add an object to the `VENUES` array:
```js
{
  key: 'laundromat',
  emoji: '🧺',
  label: { en: 'Laundromat', es: '...', ... },
  defaultNoise: 'medium',
  defaultCrowd: 'low',
  placeholderHint: 'e.g. First time using a laundromat, not sure how it works',
}
```

It will appear automatically on the home screen.

---

## Updating the AI prompt

All AI logic lives in `src/utils/claude.js`. The `buildSystemPrompt()` function constructs the system prompt dynamically from the user's sensory profile and who the app is for. Edit it there — it affects every comfort map.

---

## Build for production

```bash
npm run build
```

Output goes to `/dist`. Deploy to Vercel, Netlify, or any static host.

---

## Roadmap

- [ ] Prep scripts for parents (printable, read-aloud friendly)
- [ ] Offline mode with cached comfort profiles
- [ ] Share a comfort map (link)
- [ ] Professional mode (therapist / teacher dashboard)
- [ ] Native iOS + Android (React Native)
- [ ] Partner integrations (transit authorities, hospitals, schools)

---

Built by Zachary. Powered by Claude.
