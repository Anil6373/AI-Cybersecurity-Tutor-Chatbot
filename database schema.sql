-- ==============================================================
--  CYBER TUTOR AI — Production-Ready Supabase Database Schema
-- ==============================================================
--  Author      : Cyber Tutor AI Team
--  Database    : PostgreSQL (Supabase)
--  Description : Full schema for authentication, profiles, chat,
--                quizzes, progress tracking, roadmap, and settings.
--  Safe to re-run: YES — uses IF NOT EXISTS / OR REPLACE guards.
-- ==============================================================


-- ============================================================
--  EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- gen_random_uuid()


-- ============================================================
--  UTILITY: auto-update updated_at timestamp
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ==============================================================
--  TABLE 1: profiles
--  Linked 1-to-1 with Supabase auth.users.
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name      TEXT,
  last_name       TEXT,
  username        TEXT          UNIQUE,
  email           TEXT          UNIQUE NOT NULL,
  phone           TEXT,
  avatar_url      TEXT,
  provider        TEXT          DEFAULT 'email'
                                CHECK (provider IN ('email', 'google', 'phone', 'github')),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);
CREATE INDEX IF NOT EXISTS idx_profiles_email    ON public.profiles (email);

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own"  ON public.profiles;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);


-- ==============================================================
--  TABLE 2: chat_sessions
--  Groups messages into named conversation threads.
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT          NOT NULL DEFAULT 'New Chat',
  model_used  TEXT          DEFAULT 'auto'
                            CHECK (model_used IN ('openai', 'claude', 'gemini', 'deepseek', 'auto')),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id   ON public.chat_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created   ON public.chat_sessions (created_at DESC);

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER trg_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_sessions_select_own"  ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_insert_own"  ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_update_own"  ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_delete_own"  ON public.chat_sessions;

CREATE POLICY "chat_sessions_select_own"
  ON public.chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "chat_sessions_insert_own"
  ON public.chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_sessions_update_own"
  ON public.chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "chat_sessions_delete_own"
  ON public.chat_sessions FOR DELETE
  USING (auth.uid() = user_id);


-- ==============================================================
--  TABLE 3: chat_messages
--  Stores individual messages within a chat session.
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID          NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id      UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role         TEXT          NOT NULL
                             CHECK (role IN ('user', 'assistant', 'system')),
  content      TEXT          NOT NULL,
  token_count  INT           CHECK (token_count >= 0),   -- optional, populated by backend
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id  ON public.chat_messages (session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id     ON public.chat_messages (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created     ON public.chat_messages (created_at ASC);

-- Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_messages_select_own"  ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert_own"  ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_delete_own"  ON public.chat_messages;

CREATE POLICY "chat_messages_select_own"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "chat_messages_insert_own"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_messages_delete_own"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = user_id);


-- ==============================================================
--  TABLE 4: quiz_attempts
--  Records every quiz attempt a user makes.
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic            TEXT          NOT NULL,
  score            INT           NOT NULL CHECK (score >= 0),
  total_questions  INT           NOT NULL CHECK (total_questions > 0),
  percentage       NUMERIC(5,2)  NOT NULL
                                 CHECK (percentage >= 0 AND percentage <= 100),
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id  ON public.quiz_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_topic    ON public.quiz_attempts (topic);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created  ON public.quiz_attempts (created_at DESC);

-- Row Level Security
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quiz_attempts_select_own"  ON public.quiz_attempts;
DROP POLICY IF EXISTS "quiz_attempts_insert_own"  ON public.quiz_attempts;
DROP POLICY IF EXISTS "quiz_attempts_delete_own"  ON public.quiz_attempts;

CREATE POLICY "quiz_attempts_select_own"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "quiz_attempts_insert_own"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quiz_attempts_delete_own"
  ON public.quiz_attempts FOR DELETE
  USING (auth.uid() = user_id);


-- ==============================================================
--  TABLE 5: user_progress
--  Tracks per-topic lesson completion for each user.
--  One row per (user, topic) pair — UPSERT-friendly.
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.user_progress (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic             TEXT          NOT NULL,
  completed_lessons INT           NOT NULL DEFAULT 0 CHECK (completed_lessons >= 0),
  total_lessons     INT           NOT NULL DEFAULT 0 CHECK (total_lessons >= 0),
  progress_percent  NUMERIC(5,2)  NOT NULL DEFAULT 0
                                  CHECK (progress_percent >= 0 AND progress_percent <= 100),
  last_accessed_at  TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, topic)   -- one progress row per topic per user
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_topic   ON public.user_progress (topic);

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_user_progress_updated_at ON public.user_progress;
CREATE TRIGGER trg_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_progress_select_own"  ON public.user_progress;
DROP POLICY IF EXISTS "user_progress_insert_own"  ON public.user_progress;
DROP POLICY IF EXISTS "user_progress_update_own"  ON public.user_progress;
DROP POLICY IF EXISTS "user_progress_delete_own"  ON public.user_progress;

CREATE POLICY "user_progress_select_own"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_progress_insert_own"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_update_own"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "user_progress_delete_own"
  ON public.user_progress FOR DELETE
  USING (auth.uid() = user_id);


-- ==============================================================
--  TABLE 6: roadmap_progress
--  Tracks where a user is in the cybersecurity learning roadmap.
--  One row per (user, roadmap_level) pair.
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.roadmap_progress (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  roadmap_level    TEXT          NOT NULL
                                 CHECK (roadmap_level IN ('beginner', 'intermediate', 'advanced', 'job_ready')),
  current_step     INT           NOT NULL DEFAULT 1 CHECK (current_step >= 1),
  completed_steps  INT[]         NOT NULL DEFAULT '{}',  -- array of completed step numbers
  status           TEXT          NOT NULL DEFAULT 'in_progress'
                                 CHECK (status IN ('not_started', 'in_progress', 'completed')),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, roadmap_level)   -- one row per level per user
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_roadmap_progress_user_id ON public.roadmap_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_progress_level   ON public.roadmap_progress (roadmap_level);
CREATE INDEX IF NOT EXISTS idx_roadmap_progress_status  ON public.roadmap_progress (status);

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_roadmap_progress_updated_at ON public.roadmap_progress;
CREATE TRIGGER trg_roadmap_progress_updated_at
  BEFORE UPDATE ON public.roadmap_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "roadmap_progress_select_own"  ON public.roadmap_progress;
DROP POLICY IF EXISTS "roadmap_progress_insert_own"  ON public.roadmap_progress;
DROP POLICY IF EXISTS "roadmap_progress_update_own"  ON public.roadmap_progress;
DROP POLICY IF EXISTS "roadmap_progress_delete_own"  ON public.roadmap_progress;

CREATE POLICY "roadmap_progress_select_own"
  ON public.roadmap_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "roadmap_progress_insert_own"
  ON public.roadmap_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "roadmap_progress_update_own"
  ON public.roadmap_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "roadmap_progress_delete_own"
  ON public.roadmap_progress FOR DELETE
  USING (auth.uid() = user_id);


-- ==============================================================
--  TABLE 7: user_settings
--  Per-user application preferences.
--  One row per user — UPSERT-friendly.
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.user_settings (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID          NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_model       TEXT          NOT NULL DEFAULT 'auto'
                                      CHECK (preferred_model IN ('openai', 'claude', 'gemini', 'deepseek', 'auto')),
  theme                 TEXT          NOT NULL DEFAULT 'dark'
                                      CHECK (theme IN ('dark', 'light', 'system')),
  notifications_enabled BOOLEAN       NOT NULL DEFAULT TRUE,
  language              TEXT          NOT NULL DEFAULT 'en',
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings (user_id);

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_settings_select_own"  ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_insert_own"  ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_update_own"  ON public.user_settings;
DROP POLICY IF EXISTS "user_settings_delete_own"  ON public.user_settings;

CREATE POLICY "user_settings_select_own"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_settings_insert_own"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_update_own"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "user_settings_delete_own"
  ON public.user_settings FOR DELETE
  USING (auth.uid() = user_id);


-- ==============================================================
--  BONUS: Auto-create profile + default settings on signup
--  Fires when a new user is inserted into auth.users.
-- ==============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _username TEXT;
BEGIN
  -- Derive a default username from email (before the @)
  _username := LOWER(SPLIT_PART(NEW.email, '@', 1));

  -- Insert profile row
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    username,
    avatar_url,
    provider,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    -- Ensure username uniqueness by appending short uuid suffix if needed
    _username || '_' || SUBSTRING(NEW.id::TEXT, 1, 6),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'provider', 'email'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert default settings row
  INSERT INTO public.user_settings (
    user_id,
    preferred_model,
    theme,
    notifications_enabled,
    language
  )
  VALUES (
    NEW.id,
    'auto',
    'dark',
    TRUE,
    'en'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================
--  SUMMARY: Tables created
-- ==============================================================
--
--  public.profiles           — user identity, linked to auth.users
--  public.chat_sessions      — AI conversation threads
--  public.chat_messages      — individual messages per session
--  public.quiz_attempts      — quiz results per topic
--  public.user_progress      — lesson progress per topic
--  public.roadmap_progress   — roadmap level progress
--  public.user_settings      — per-user app preferences
--
--  Triggers:
--    update_updated_at_column()  — auto-updates updated_at
--    handle_new_user()           — auto-creates profile + settings on signup
--
--  RLS Policies: SELECT / INSERT / UPDATE / DELETE (own rows only)
--  Indexes: all FK columns + high-cardinality filter columns
--
-- ==============================================================
