// ============================================================
//  routes/progress.routes.js
//  GET  /api/progress
//  POST /api/progress/update
// ============================================================

'use strict';

const express  = require('express');
const { body } = require('express-validator');
const { requireAuth }      = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

// ── GET /api/progress — all topics + roadmap progress ─────
router.get('/', async (req, res, next) => {
  try {
    const [topicRes, roadmapRes] = await Promise.all([
      req.db
        .from('user_progress')
        .select('*')
        .eq('user_id', req.user.id)
        .order('last_accessed_at', { ascending: false }),
      req.db
        .from('roadmap_progress')
        .select('*')
        .eq('user_id', req.user.id)
        .order('updated_at', { ascending: false }),
    ]);

    if (topicRes.error)   return res.status(500).json({ error: topicRes.error.message });
    if (roadmapRes.error) return res.status(500).json({ error: roadmapRes.error.message });

    return res.json({
      topic_progress:   topicRes.data,
      roadmap_progress: roadmapRes.data,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/progress/update — upsert a topic's progress ─
router.post(
  '/update',
  [
    body('topic').notEmpty().trim().withMessage('topic is required.'),
    body('completed_lessons')
      .isInt({ min: 0 })
      .withMessage('completed_lessons must be a non-negative integer.'),
    body('total_lessons')
      .isInt({ min: 0 })
      .withMessage('total_lessons must be a non-negative integer.'),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { topic, completed_lessons, total_lessons } = req.body;
      const progress_percent =
        total_lessons > 0
          ? parseFloat(((completed_lessons / total_lessons) * 100).toFixed(2))
          : 0;

      const { data, error } = await req.db
        .from('user_progress')
        .upsert(
          {
            user_id:          req.user.id,
            topic,
            completed_lessons,
            total_lessons,
            progress_percent,
            last_accessed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,topic' }
        )
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });

      return res.json({ message: 'Progress updated.', progress: data });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/progress/roadmap — upsert roadmap level progress
router.post(
  '/roadmap',
  [
    body('roadmap_level')
      .isIn(['beginner', 'intermediate', 'advanced', 'job_ready'])
      .withMessage('roadmap_level must be: beginner, intermediate, advanced, or job_ready.'),
    body('current_step').isInt({ min: 1 }).withMessage('current_step must be >= 1.'),
    body('completed_steps').isArray().withMessage('completed_steps must be an array.'),
    body('status')
      .isIn(['not_started', 'in_progress', 'completed'])
      .withMessage('status must be: not_started, in_progress, or completed.'),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { roadmap_level, current_step, completed_steps, status } = req.body;

      const { data, error } = await req.db
        .from('roadmap_progress')
        .upsert(
          {
            user_id:         req.user.id,
            roadmap_level,
            current_step,
            completed_steps,
            status,
          },
          { onConflict: 'user_id,roadmap_level' }
        )
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });

      return res.json({ message: 'Roadmap progress updated.', roadmap: data });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
