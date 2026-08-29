// ============================================================
//  routes/auth.routes.js
//  POST /api/auth/signup
//  POST /api/auth/login
//  POST /api/auth/google
//  POST /api/auth/logout
//  GET  /api/auth/me
// ============================================================

'use strict';

const express    = require('express');
const { body }   = require('express-validator');
const { requireAuth }      = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { supabaseAnon, supabaseAdmin } = require('../config/supabase');

const router = express.Router();

// ── Signup ────────────────────────────────────────────────
router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Valid email required.').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
    body('first_name').optional().trim().escape(),
    body('last_name').optional().trim().escape(),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { email, password, first_name = '', last_name = '' } = req.body;

      const { data, error } = await supabaseAnon.auth.signUp({
        email,
        password,
        options: {
          data: { first_name, last_name, provider: 'email' },
        },
      });

      if (error) return res.status(400).json({ error: error.message });

      return res.status(201).json({
        message: 'Signup successful. Check your email to confirm your account.',
        user:    data.user,
        session: data.session,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── Login ─────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });

      if (error) return res.status(401).json({ error: error.message });

      return res.json({
        message:      'Login successful.',
        user:         data.user,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at:   data.session.expires_at,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── Google OAuth — exchange code for session ──────────────
router.post(
  '/google',
  [body('access_token').notEmpty().withMessage('Google access_token required.')],
  handleValidation,
  async (req, res, next) => {
    try {
      const { access_token } = req.body;

      // Exchange the provider token (from Supabase client-side OAuth flow) for a session
      const { data, error } = await supabaseAnon.auth.signInWithIdToken({
        provider: 'google',
        token:    access_token,
      });

      if (error) return res.status(401).json({ error: error.message });

      return res.json({
        message:      'Google sign-in successful.',
        user:         data.user,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at:   data.session.expires_at,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── Logout ────────────────────────────────────────────────
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    const { error } = await req.db.auth.signOut();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
});

// ── Me — returns authenticated user's profile ─────────────
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await req.db
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) return res.status(404).json({ error: 'Profile not found.' });

    return res.json({ user: data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
