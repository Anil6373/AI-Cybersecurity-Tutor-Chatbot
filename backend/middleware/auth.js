// ============================================================
//  middleware/auth.js
//  Verifies the Supabase JWT sent in the Authorization header.
//  Attaches { user, accessToken, db } to req for downstream use.
// ============================================================

'use strict';

const { supabaseAdmin, supabaseForUser } = require('../config/supabase');

/**
 * requireAuth — Express middleware.
 * Expects:  Authorization: Bearer <supabase_access_token>
 * On success: populates req.user, req.accessToken, req.db
 * On failure: 401
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      console.error(`[Auth] 401 Failed: Missing or malformed Authorization header. Header value: '${authHeader}'`);
      return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      console.error(`[Auth] 401 Failed: Access token is empty.`);
      return res.status(401).json({ error: 'Access token is empty.' });
    }

    // Verify the token against Supabase
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      console.error(`[Auth] 401 Failed: Invalid or expired access token. Supabase error:`, error?.message);
      return res.status(401).json({ error: 'Invalid or expired access token.' });
    }

    req.user        = data.user;          // Supabase auth user object
    req.accessToken = token;              // raw JWT
    req.db          = supabaseForUser(token); // RLS-aware client for this user

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth };
