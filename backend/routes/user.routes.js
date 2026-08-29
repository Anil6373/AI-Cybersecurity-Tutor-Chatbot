// ============================================================
//  routes/user.routes.js
//  GET /api/user/profile
//  PUT /api/user/profile
// ============================================================

'use strict';

const express  = require('express');
const { body } = require('express-validator');
const { requireAuth }      = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');

const router = express.Router();

// All user routes require authentication
router.use(requireAuth);

// ── GET /api/user/profile ─────────────────────────────────
router.get('/profile', async (req, res, next) => {
  try {
    const { data, error } = await req.db
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) return res.status(404).json({ error: 'Profile not found.' });

    return res.json({ profile: data });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/user/profile ─────────────────────────────────
router.put(
  '/profile',
  [
    body('first_name').optional().trim().isLength({ max: 100 }).escape(),
    body('last_name').optional().trim().isLength({ max: 100 }).escape(),
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username may only contain letters, numbers, and underscores.'),
    body('phone').optional().trim().isMobilePhone().withMessage('Invalid phone number.'),
    body('avatar_url').optional().trim().isURL().withMessage('avatar_url must be a valid URL.'),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const allowed  = ['first_name', 'last_name', 'username', 'phone', 'avatar_url'];
      const updates  = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update.' });
      }

      const { data, error } = await req.db
        .from('profiles')
        .update(updates)
        .eq('id', req.user.id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ message: 'Profile updated.', profile: data });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
