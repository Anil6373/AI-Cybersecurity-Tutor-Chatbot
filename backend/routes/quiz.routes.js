// ============================================================
//  routes/quiz.routes.js
//  POST /api/quiz/submit
//  GET  /api/quiz/history
// ============================================================

'use strict';

const express  = require('express');
const { body } = require('express-validator');
const { requireAuth }      = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

// ── POST /api/quiz/submit ─────────────────────────────────
router.post(
  '/submit',
  [
    body('topic').notEmpty().trim().withMessage('topic is required.'),
    body('score')
      .isInt({ min: 0 })
      .withMessage('score must be a non-negative integer.'),
    body('total_questions')
      .isInt({ min: 1 })
      .withMessage('total_questions must be at least 1.'),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { topic, score, total_questions } = req.body;
      const percentage = parseFloat(((score / total_questions) * 100).toFixed(2));

      const { data, error } = await req.db
        .from('quiz_attempts')
        .insert({
          user_id:         req.user.id,
          topic,
          score,
          total_questions,
          percentage,
        })
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });

      return res.status(201).json({
        message:    'Quiz result saved.',
        attempt:    data,
        percentage,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/quiz/history ─────────────────────────────────
router.get('/history', async (req, res, next) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit)  || 20, 100);
    const offset = Math.max(parseInt(req.query.offset) || 0,  0);
    const topic  = req.query.topic || null;

    let query = req.db
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (topic) query = query.eq('topic', topic);

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    return res.json({ attempts: data, limit, offset });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
