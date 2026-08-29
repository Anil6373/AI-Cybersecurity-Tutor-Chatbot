# 🛡 Cyber Tutor AI

> **Master Cybersecurity with AI Guidance** — A premium, AI-powered cybersecurity learning platform built for serious learners.

---

## 📁 Project Structure

```
cyber-tutor-ai/
├── index.html                    ← Landing page (root)
├── README.md
├── CLAUDE.md
└── Frontend/
    ├── pages/
    │   ├── chat.html             ← AI Chat interface
    │   ├── quiz.html             ← Quiz mode
    │   └── roadmap.html          ← Career roadmaps
    ├── css/
    │   ├── variables.css         ← Design tokens (colors, spacing, radius, shadows)
    │   ├── base.css              ← Global styles + landing page styles
    │   ├── chat.css              ← Chat interface layout and components
    │   └── quiz-roadmap.css      ← Quiz and roadmap styles
    └── js/
        ├── theme.js              ← Dark/light mode toggle + toast utility
        ├── landing.js            ← Landing page interactions and animations
        ├── chat.js               ← Chat logic + Anthropic API calls
        ├── quiz.js               ← Quiz engine + question bank (25 Qs / 5 topics)
        └── roadmap.js            ← Roadmap data + dynamic renderer
```

---

## 🚀 Getting Started

### Option 1: Open directly
Open `index.html` in your browser. No build tools needed.

### Option 2: Local server (recommended for API calls)
```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .

# Then open: http://localhost:8080
```

> **Note:** Browser-direct API calls to Anthropic may be blocked by CORS in production. Use the proxy setup below.

---

## 🤖 AI Chat Setup

The chat uses the **Anthropic Claude API**. Direct browser calls are for development only.

### Setting up a backend proxy (recommended for production):
```js
// server.js — Simple Express proxy
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.static('.'));

app.post('/api/chat', async (req, res) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(req.body),
  });
  const data = await response.json();
  res.json(data);
});

app.listen(3000, () => console.log('Proxy running on :3000'));
```

Then in `Frontend/js/chat.js`, change the fetch URL from:
```js
'https://api.anthropic.com/v1/messages'
```
to:
```js
'/api/chat'
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 AI Chat | Real conversations with Claude as a cybersecurity tutor |
| 🧠 Quiz Mode | 5 topic banks × 5 questions each with explanations and scoring |
| 🗺️ Roadmaps | 4 career paths with timeline view (Beginner → Job Ready) |
| 🌙 Dark/Light Mode | Persistent theme toggle with smooth transitions |
| 💾 Chat History | Sessions saved to localStorage (last 20 conversations) |
| 📱 Responsive | Optimized for desktop, tablet, and mobile |
| 🔔 Toast Notifications | Success/error feedback on all actions |
| ✏️ Typing Indicator | Animated three-dot typing indicator |
| 🎯 Suggestion Chips | Quick-start prompts for new users |
| ♿ Accessibility | ARIA labels, keyboard navigation, focus states |

---

## 🎨 Design System

### Typography
- **UI Font**: `Inter` — clean, professional, used by Linear, Vercel, Notion
- **Mono Font**: `JetBrains Mono` — code, technical labels, timestamps

### Color Palette (Dark Mode)
| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#080c14` | Page background |
| `--bg-surface` | `#0f1623` | Sidebar, cards |
| `--bg-elevated` | `#161f2e` | Inputs, hover states |
| `--accent-blue` | `#3b82f6` | Primary accent (professional blue) |
| `--accent-emerald` | `#10b981` | Success, active, online status |
| `--accent-red` | `#ef4444` | Errors, wrong answers |
| `--text-primary` | `#f0f6ff` | Body text |
| `--text-secondary` | `#8ba3be` | Subtitles, descriptions |
| `--text-muted` | `#4a6380` | Labels, hints, timestamps |

### Spacing Scale (4px base)
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96px`

### Border Radius
| Usage | Value |
|---|---|
| Cards | `16px` |
| Buttons | `12px` |
| Inputs | `14px` |
| Small elements | `8px` |

---

## 📚 Quiz Topics

- 🌐 **Networking** — OSI, DNS, Ports, Firewalls, VPN
- 🔐 **Web Security** — OWASP Top 10, XSS, SQLi, CSRF, CSP
- 🔑 **Cryptography** — AES, RSA, TLS, Hashing, Digital Signatures
- 🐧 **Linux** — Commands, Permissions, Processes, sudo
- ⚔️ **Ethical Hacking** — Recon, Nmap, CVEs, Metasploit, Zero-days

---

## 🗺️ Roadmap Levels

1. **🌱 Beginner** — Networking basics, Linux, Security concepts, Security+ prep
2. **⚡ Intermediate** — Web app pentesting, Network pentesting, AD attacks, CTFs
3. **🔥 Advanced** — Exploit dev, Malware analysis, Red team ops, Cloud security, OSCP
4. **💼 Job Ready** — Portfolio, Bug bounty, Cert strategy, Interview prep

---

## 🌐 Deployment

The entire project is static — deploy by uploading to any static host:

```bash
# Netlify CLI
netlify deploy --dir=. --prod

# Vercel CLI
vercel .

# GitHub Pages
# Push to a repo, enable Pages from root of main branch

# Local dev
python3 -m http.server 8080
```

---

## 📄 License

MIT — Free to use and modify for educational purposes.
#
