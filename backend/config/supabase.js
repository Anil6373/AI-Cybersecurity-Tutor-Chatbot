// ============================================================
//  config/supabase.js
//  Two Supabase clients:
//    - supabaseAnon  : for user-scoped operations (passes user JWT)
//    - supabaseAdmin : for server-side ops (bypasses RLS)
// ============================================================

'use strict';

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL            = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY       = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    '[Supabase] Missing env vars: SUPABASE_URL, SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY'
  );
}

/**
 * Anon client — use when you want RLS enforced.
 * Pass user JWT via supabaseAnon.auth.setSession() or per-request headers.
 */
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Admin client — bypasses RLS entirely.
 * Only use on the server for trusted operations (e.g. trigger-like logic).
 */
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Returns an anon client authenticated as the given user JWT.
 * Use this inside request handlers to honour RLS policies.
 */
function supabaseForUser(accessToken) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });
}

module.exports = { supabaseAnon, supabaseAdmin, supabaseForUser };
