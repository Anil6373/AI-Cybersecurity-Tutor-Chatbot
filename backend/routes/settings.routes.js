// ============================================================
//  routes/settings.routes.js
//  GET /api/settings
//  PUT /api/settings
// ============================================================

'use strict';

const express  = require('express');
const { body } = require('express-validator');
const { requireAuth }      = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

// ── GET /api/settings ─────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await req.db
      .from('user_settings')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) {
      // Auto-create default settings if none exist (safety net)
      const { data: created, error: createErr } = await req.db
        .from('user_settings')
        .insert({ user_id: req.user.id })
        .select()
        .single();

      if (createErr) return res.status(500).json({ error: createErr.message });
      return res.json({ settings: created });
    }

    return res.json({ settings: data });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/settings ─────────────────────────────────────
router.put(
  '/',
  [
    body('preferred_model')
      .optional()
      .isIn(['openai', 'claude', 'gemini', 'auto'])
      .withMessage('preferred_model must be: openai, claude, gemini, or auto.'),
    body('theme')
      .optional()
      .isIn(['dark', 'light', 'system'])
      .withMessage('theme must be: dark, light, or system.'),
    body('notifications_enabled')
      .optional()
      .isBoolean()
      .withMessage('notifications_enabled must be a boolean.'),
    body('language')
      .optional()
      .trim()
      .isLength({ min: 2, max: 10 })
      .withMessage('language must be a valid locale code (e.g. en, fr, hi).'),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const allowed = ['preferred_model', 'theme', 'notifications_enabled', 'language'];
      const updates = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update.' });
      }

      const { data, error } = await req.db
        .from('user_settings')
        .update(updates)
        .eq('user_id', req.user.id)
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });

      return res.json({ message: 'Settings updated.', settings: data });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
