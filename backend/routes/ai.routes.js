// ============================================================
//  routes/ai.routes.js
//  POST /api/ai/chat
//
//  Body: { message, model?, session_id? }
//  - Calls the appropriate AI provider
//  - Optionally saves both user message + AI reply to DB
// ============================================================

'use strict';

const express  = require('express');
const { body } = require('express-validator');
const { requireAuth }      = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { getAIResponse }    = require('../services/ai.service');

const router = express.Router();

router.use(requireAuth);

// ── POST /api/ai/chat ─────────────────────────────────────
router.post(
  '/chat',
  [
    body('message').notEmpty().trim().isLength({ max: 10000 }).withMessage('message is required (max 10,000 chars).'),
    body('model')
      .optional()
      .isIn(['openai', 'claude', 'gemini', 'deepseek', 'openrouter', 'auto'])
      .withMessage('model must be: openai, claude, gemini, deepseek, openrouter, or auto.'),
    body('session_id').optional().isString().trim(),
  ],
  handleValidation,
  async (req, res, next) => {
    const startTime = Date.now();
    try {
      const { message, model = 'auto', session_id } = req.body;
      
      console.log(`\n[Backend Flow] Route /api/ai/chat hit.`);
      console.log(`[Backend Flow] Incoming model param: '${model}'`);
      console.log(`[Backend Flow] Request body keys: ${Object.keys(req.body).join(', ')}`);

      // ── Persist to DB BEFORE AI Request ────────────────
      if (session_id) {
        try {
          // 1. Check if session exists
          let { data: session } = await req.db
            .from('chat_sessions')
            .select('id')
            .eq('id', session_id)
            .eq('user_id', req.user.id)
            .single();

          if (!session) {
            // 2. Create session if it doesn't exist
            const title = message.substring(0, 50) + (message.length > 50 ? '…' : '');
            const { error: insertErr } = await req.db
              .from('chat_sessions')
              .insert({
                id: session_id,
                user_id: req.user.id,
                title: title,
                model_used: model,
              });
              
            if (insertErr) throw insertErr;
            console.log(`[ChatSession] created: ${session_id}`);
            session = { id: session_id };
          } else {
            console.log(`[ChatSession] reused: ${session_id}`);
          }

          // 3. Save user message immediately
          const { error: msgErr } = await req.db.from('chat_messages').insert({
            session_id,
            user_id: req.user.id,
            role: 'user',
            content: message,
            token_count: null,
          });
          
          if (msgErr) throw msgErr;
        } catch (err) {
          console.error(`[ChatSession] failed:`, err.message);
          // Do not throw; we still want to provide an AI response even if DB logging fails
        }
      }

      // ── Call AI provider ──────────────────────────────
      const aiResult = await getAIResponse(message, model);

      if (process.env.NODE_ENV === 'development') {
        const duration = Date.now() - startTime;
        console.log(`[AI Request] Requested: ${model} -> Provider: ${aiResult.model_used} | Duration: ${duration}ms | Status: Success`);
      }

      // ── Persist AI response ───────────────────────────
      if (session_id) {
        try {
          // Save assistant reply
          await req.db.from('chat_messages').insert({
            session_id,
            user_id: req.user.id,
            role: 'assistant',
            content: aiResult.content,
            token_count: aiResult.token_count,
          });

          // Update model_used on session + bump updated_at
          await req.db
            .from('chat_sessions')
            .update({
              model_used: aiResult.model_used,
              updated_at: new Date().toISOString(),
            })
            .eq('id', session_id);
        } catch (err) {
          console.error(`[ChatSession] failed to save assistant reply:`, err.message);
        }
      }

      return res.json({
        reply:       aiResult.content,
        model_used:  aiResult.model_used,
        token_count: aiResult.token_count,
      });
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        const duration = Date.now() - startTime;
        console.log(`[AI Request] Requested: ${req.body?.model || 'auto'} | Duration: ${duration}ms | Status: Failed - ${err.message}`);
      }

      // Surface AI provider errors as 503 rather than 500
      if (
        err.message?.includes('API key') ||
        err.message?.includes('quota') ||
        err.message?.includes('provider') ||
        err.message?.toLowerCase().includes('timeout') ||
        err.status === 401 ||
        err.status === 403 ||
        err.status === 429
      ) {
        return res.status(503).json({ error: err.message });
      }
      
      // Send raw message to frontend in development
      if (process.env.NODE_ENV === 'development') {
        return res.status(500).json({ error: `Backend Error: ${err.message}` });
      }
      
      next(err);
    }
  }
);

module.exports = router;
