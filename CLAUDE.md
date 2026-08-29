# CLAUDE.md — Cyber Tutor AI

> This file provides context and instructions for Claude (or any AI assistant / developer)
> working on the **Cyber Tutor AI** codebase.

---

## Project Overview

**Cyber Tutor AI** is a static frontend web application — an AI-powered cybersecurity learning platform with a landing page, chat interface (Anthropic Claude API), MCQ quiz engine, and career roadmaps.

- **Stack:** Vanilla HTML + CSS + JavaScript (no build tools, no frameworks)
- **AI Backend:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Storage:** `localStorage` for chat history and theme preference
- **Fonts:** Inter (UI) + JetBrains Mono (code/mono) via Google Fonts

---

## Folder Structure

```
cyber-tutor-ai/
├── index.html                    # Landing page (at root)
├── README.md
├── CLAUDE.md                     # This file
└── Frontend/
    ├── pages/
    │   ├── chat.html             # Chat interface
    │   ├── quiz.html             # Quiz mode
    │   └── roadmap.html          # Career roadmaps
    ├── css/
    │   ├── variables.css         # Design tokens: all colors, spacing, radius, shadows, fonts
    │   ├── base.css              # Global resets, buttons, navbar, toast, footer, landing styles
    │   ├── chat.css              # Chat layout: sidebar, bubbles, input, typing indicator
    │   └── quiz-roadmap.css      # Quiz card/options/results + roadmap timeline/tabs
    └── js/
        ├── theme.js              # Dark/light toggle (runs before DOM, prevents FOUC)
        ├── landing.js            # Landing: topic card nav, terminal animation, scroll effects
        ├── chat.js               # Chat state, Anthropic API, history, rendering
        ├── quiz.js               # Quiz engine + question bank (25 Qs / 5 topics)
        └── roadmap.js            # Roadmap data + dynamic timeline renderer
```

---

## Path Rules

| File | CSS paths | JS paths | Links to pages |
|---|---|---|---|
| `index.html` | `Frontend/css/...` | `Frontend/js/...` | `Frontend/pages/...` |
| `Frontend/pages/*.html` | `../css/...` | `../js/...` | `../../index.html` (home), `chat.html` (sibling) |
| `Frontend/js/landing.js` | — | — | `Frontend/pages/chat.html?topic=X` (relative to root) |

> `theme.js` must be loaded in `<head>` (not `<body>`) on all pages to prevent flash of unstyled content.

---

## Architecture

### Why no framework?
Pure HTML/CSS/JS for zero-dependency simplicity, instant load, and easy deployment to any static host.

### CSS Architecture
- All design tokens in `variables.css` as CSS custom properties
- Dark/light theme toggled via `data-theme` attribute on `<html>`
- `base.css` is shared across ALL pages and includes landing page styles (no separate `landing.css`)
- Each app page has its own page-specific CSS file
- No CSS preprocessor — plain CSS with custom properties

### JavaScript Architecture
- No module bundler; each file is a plain `<script>`
- `theme.js` must load first (in `<head>`) — sets theme before paint
- Global functions (`startQuiz()`, `openTopic()`, etc.) are attached to `window`
- State is in module-scoped variables (no store/context)

---

## Design System

### Typography
| Role | Font | Weights |
|---|---|---|
| All UI (headings, body, buttons) | Inter | 400, 500, 600, 700, 800 |
| Code, mono, labels, timestamps | JetBrains Mono | 400, 500 |

### Colors (Dark theme defaults)
| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#080c14` | Page background |
| `--bg-surface` | `#0f1623` | Sidebar, card backgrounds |
| `--bg-elevated` | `#161f2e` | Inputs, hover states, tooltips |
| `--accent-blue` | `#3b82f6` | Primary CTA, active states, borders |
| `--accent-blue-light` | `#60a5fa` | Text links, gradient accents |
| `--accent-emerald` | `#10b981` | Success, online status, done items |
| `--accent-red` | `#ef4444` | Errors, wrong answers, danger |
| `--text-primary` | `#f0f6ff` | Main body text |
| `--text-secondary` | `#8ba3be` | Descriptions, subtitles |
| `--text-muted` | `#4a6380` | Labels, hints, timestamps |
| `--border-subtle` | `#1e2d42` | Card/section dividers |
| `--border-accent` | `rgba(59,130,246,.2)` | Focused/active borders |

### Spacing Scale
```
--sp-1: 4px   --sp-2: 8px   --sp-3: 12px  --sp-4: 16px
--sp-5: 24px  --sp-6: 32px  --sp-7: 48px  --sp-8: 64px  --sp-9: 96px
```

### Border Radius
```
--radius-xs: 4px   --radius-sm: 8px    --radius-md: 12px (buttons)
--radius-input: 14px (inputs)          --radius-lg: 16px (cards)
--radius-xl: 20px  --radius-2xl: 24px  --radius-full: 9999px
```

### Shadows
Real-world depth shadows, not neon glow:
- `--shadow-sm` — subtle card lift
- `--shadow-md` — quiz cards, dropdowns
- `--shadow-lg` — modals, toasts
- `--shadow-blue` — focus ring: `0 0 0 3px rgba(59,130,246,.25)`

---

## Key Components

### Chat (`Frontend/js/chat.js`)

| Function | Purpose |
|---|---|
| `startNewChat()` | Resets state, clears messages, shows empty state |
| `sendMessage(text)` | Appends user bubble, calls API, appends bot reply |
| `callCyberTutorAI(msg)` | Sends request to Anthropic API, returns reply text |
| `appendMessage(role, text)` | Creates message bubble with avatar and timestamp |
| `appendTyping()` | Shows three-dot typing indicator |
| `saveSession(firstMsg)` | Persists current session to `localStorage` |
| `renderHistory()` | Renders past sessions in sidebar |
| `loadSession(session)` | Restores a past session's messages |
| `formatText(text)` | Converts `**bold**` and backtick code to HTML |

### Quiz (`Frontend/js/quiz.js`)

- Question bank in `QUIZ_DATA` object, keyed by topic
- Each question: `{ q, options[], answer (index), explanation }`
- `startQuiz()` → shuffles questions, renders first card
- `selectAnswer(i, btn)` → marks correct/wrong, shows explanation, updates ARIA
- `nextQuestion()` → advances or shows result screen
- `restartQuiz()` → resets to topic selector
- To add questions: append objects to any array in `QUIZ_DATA`

### Roadmap (`Frontend/js/roadmap.js`)

- All data in `ROADMAPS` object, keyed by level
- `renderRoadmap(level)` rebuilds `#roadmapContent` entirely
- Tab clicks trigger `renderRoadmap()` with corresponding level key
- To add a level: add a key to `ROADMAPS` + matching tab button in `roadmap.html`

---

## API Integration

### Endpoint
```
POST https://api.anthropic.com/v1/messages
```

### Model
```
claude-sonnet-4-20250514
```

### Called from
`Frontend/js/chat.js` → `callCyberTutorAI(userMessage)`

### System Prompt
The system prompt defines Claude as a cybersecurity educator. It is embedded directly in `chat.js`.
To modify the tutor's personality or scope, edit the `system:` field in `callCyberTutorAI()`.

### ⚠️ Security Warning
Direct browser-to-Anthropic API calls are for **development only**.
For production, use a backend proxy — see `README.md` for the Express proxy example.

---

## Common Tasks

### Add a quiz topic
1. Add a key + array of questions to `QUIZ_DATA` in `Frontend/js/quiz.js`
2. Add a `<button class="topic-btn" data-topic="yourkey">` in `Frontend/pages/quiz.html`

### Add a roadmap level
1. Add an entry to `ROADMAPS` in `Frontend/js/roadmap.js`
2. Add a `<button class="roadmap-tab" data-level="yourkey">` in `Frontend/pages/roadmap.html`

### Change the AI model
In `Frontend/js/chat.js`:
```js
model: 'claude-sonnet-4-20250514',
```

### Change the system prompt
In `Frontend/js/chat.js`, edit the `system:` string inside `callCyberTutorAI()`.

### Modify colors
Edit `Frontend/css/variables.css` — all colors cascade from there for both themes.

### Add a new page
1. Create `Frontend/pages/yourpage.html`
2. Link `../css/variables.css`, `../css/base.css`, page-specific CSS
3. Load `../js/theme.js` first in `<head>` (not `<body>`)
4. Link back to home with `../../index.html`
5. Add nav links in all page navbars

---

## Deployment

```bash
# Netlify CLI
netlify deploy --dir=. --prod

# Vercel CLI
vercel .

# GitHub Pages
# Push to repo, enable Pages from root of main branch

# Local dev
python3 -m http.server 8080
```

---

## Known Limitations

1. **No API key management** — Browser-side API calls are dev-only. Use a server-side proxy for production.
2. **No authentication** — Chat history is per-browser via `localStorage`.
3. **No streaming** — Full response is waited before rendering. Use Anthropic streaming API + `ReadableStream` for real-time output.
4. **Static quiz bank** — Questions are hardcoded in `quiz.js`. Can be loaded from JSON or generated via API.

---

## Contributing

- Follow existing CSS variable naming convention (`--token-name`)
- Keep JS functions small and clearly named
- Always test both dark and light themes when adding UI components
- Mobile-first: test at 375px viewport width
- All interactive elements need visible focus states (`:focus-visible`)
- Use semantic HTML — headings hierarchy, ARIA roles where helpful
