// ============================================================
//  routes/chat.routes.js
//  GET    /api/chat/sessions
//  POST   /api/chat/session
//  GET    /api/chat/:sessionId/messages
//  POST   /api/chat/:sessionId/message
//  DELETE /api/chat/:sessionId
// ============================================================

'use strict';

const express  = require('express');
const { body, param } = require('express-validator');
const { requireAuth }      = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');

const router = express.Router();

// All chat routes require authentication
router.use(requireAuth);

// ── GET /api/chat/sessions — list all sessions ────────────
router.get('/sessions', async (req, res, next) => {
  try {
    const { data, error } = await req.db
      .from('chat_sessions')
      .select('id, title, model_used, created_at, updated_at')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    return res.json({ sessions: data });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/chat/session — create new session ───────────
router.post(
  '/session',
  [
    body('title')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Title must be under 200 characters.'),
    body('model_used')
      .optional()
      .isIn(['openai', 'claude', 'gemini', 'auto'])
      .withMessage('model_used must be one of: openai, claude, gemini, auto.'),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { title = 'New Chat', model_used = 'auto' } = req.body;

      const { data, error } = await req.db
        .from('chat_sessions')
        .insert({ user_id: req.user.id, title, model_used })
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });

      return res.status(201).json({ message: 'Session created.', session: data });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/chat/:sessionId/messages — fetch messages ────
router.get(
  '/:sessionId/messages',
  [param('sessionId').isUUID().withMessage('sessionId must be a valid UUID.')],
  handleValidation,
  async (req, res, next) => {
    try {
      const { sessionId } = req.params;

      // Verify session belongs to this user
      const { data: session, error: sessErr } = await req.db
        .from('chat_sessions')
        .select('id')
        .eq('id', sessionId)
        .eq('user_id', req.user.id)
        .single();

      if (sessErr || !session) {
        return res.status(404).json({ error: 'Session not found or access denied.' });
      }

      const { data: messages, error } = await req.db
        .from('chat_messages')
        .select('id, role, content, token_count, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) return res.status(500).json({ error: error.message });

      return res.json({ messages });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/chat/:sessionId/message — save a message ───
router.post(
  '/:sessionId/message',
  [
    param('sessionId').isUUID().withMessage('sessionId must be a valid UUID.'),
    body('role')
      .isIn(['user', 'assistant', 'system'])
      .withMessage('role must be: user, assistant, or system.'),
    body('content').notEmpty().trim().withMessage('content is required.'),
    body('token_count').optional().isInt({ min: 0 }),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      const { role, content, token_count } = req.body;

      // Verify session belongs to this user
      const { data: session, error: sessErr } = await req.db
        .from('chat_sessions')
        .select('id')
        .eq('id', sessionId)
        .eq('user_id', req.user.id)
        .single();

      if (sessErr || !session) {
        return res.status(404).json({ error: 'Session not found or access denied.' });
      }

      // Insert message
      const { data: message, error } = await req.db
        .from('chat_messages')
        .insert({
          session_id:  sessionId,
          user_id:     req.user.id,
          role,
          content,
          token_count: token_count ?? null,
        })
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });

      // Bump session updated_at
      await req.db
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      return res.status(201).json({ message: 'Message saved.', data: message });
    } catch (err) {
      next(err);
    }
  }
);

// ── DELETE /api/chat/:sessionId — delete a session ────────
router.delete(
  '/:sessionId',
  [param('sessionId').isUUID().withMessage('sessionId must be a valid UUID.')],
  handleValidation,
  async (req, res, next) => {
    try {
      const { sessionId } = req.params;

      const { error } = await req.db
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', req.user.id);

      if (error) return res.status(500).json({ error: error.message });

      return res.json({ message: 'Session deleted.' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
