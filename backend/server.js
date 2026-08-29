// ============================================================
//  server.js — Cyber Tutor AI Backend
//  Entry point: Express app with all security middleware,
//  routes, and global error handling.
// ============================================================

'use strict';

// Load env FIRST before anything else
require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');

const { errorHandler } = require('./middleware/errorHandler');

// ── Routes ────────────────────────────────────────────────
const authRoutes     = require('./routes/auth.routes');
const userRoutes     = require('./routes/user.routes');
const chatRoutes     = require('./routes/chat.routes');
const quizRoutes     = require('./routes/quiz.routes');
const progressRoutes = require('./routes/progress.routes');
const settingsRoutes = require('./routes/settings.routes');
const aiRoutes       = require('./routes/ai.routes');

// ─────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security: Helmet ──────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:5500',   // VS Code Live Server
  'http://127.0.0.1:5500',
  'http://localhost:8080',   // Python http.server
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server (no origin) or whitelisted origins
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed.`));
      }
    },
    methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ── Body parsers ──────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── HTTP request logger ───────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Global rate limiter ───────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max:      200,               // 200 requests per window per IP
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many requests. Please try again in 15 minutes.' },
});
app.use(globalLimiter);

// ── Stricter limiter for auth endpoints ───────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many auth attempts. Please try again in 15 minutes.' },
});

// ── Stricter limiter for AI (expensive calls) ─────────────
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute window
  max:      30,               // 30 AI calls per minute per IP
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'AI rate limit reached. Please wait a moment.' },
});

// ── Health check ──────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({
    status: 'ok',
    service: 'Cyber Tutor AI Backend',
    env:    process.env.NODE_ENV,
    time:   new Date().toISOString(),
  })
);

// ── Mount API routes ──────────────────────────────────────
app.use('/api/auth',     authLimiter, authRoutes);
app.use('/api/user',     userRoutes);
app.use('/api/chat',     chatRoutes);
app.use('/api/quiz',     quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai',       aiLimiter, aiRoutes);

// ── 404 handler ───────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ error: 'Route not found.' })
);

// ── Global error handler ──────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║       Cyber Tutor AI — Backend API        ║');
  console.log('╠═══════════════════════════════════════════╣');
  console.log(`║  URL  : http://localhost:${PORT}             ║`);
  console.log(`║  Mode : ${(process.env.NODE_ENV || 'development').padEnd(32)}║`);
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');
});

module.exports = app; // for testing
