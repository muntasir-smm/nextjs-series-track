-- scripts/schema.sql

-- Series Tracker — full schema (Postgres / Neon)
-- Run once: psql $POSTGRES_URL -f scripts/schema.sql
-- Or paste into Neon SQL editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========== USERS ==========
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password      TEXT NOT NULL,
  role          VARCHAR(32) NOT NULL DEFAULT 'user',
  is_approved   BOOLEAN NOT NULL DEFAULT false,
  is_active     BOOLEAN NOT NULL DEFAULT false,
  is_banned     BOOLEAN NOT NULL DEFAULT false,
  ban_reason    TEXT,
  approved_at   TIMESTAMPTZ,
  approved_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  last_login    TIMESTAMPTZ,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- ========== LIBRARY (movies + TV) ==========
CREATE TABLE IF NOT EXISTS user_series (
  id                SERIAL PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  series_id         VARCHAR(255) NOT NULL,
  media_type        VARCHAR(16) NOT NULL DEFAULT 'tv',
  tmdb_id           INTEGER,
  name              VARCHAR(512) NOT NULL,
  original_name     VARCHAR(512),
  total_seasons     INTEGER DEFAULT 0,
  total_episodes    INTEGER,
  upcoming_seasons  TEXT[] DEFAULT '{}',
  watched_seasons   BOOLEAN[] DEFAULT '{}',
  watched_episodes  JSONB DEFAULT '{}'::jsonb,
  watch_progress    INTEGER DEFAULT 0,
  poster_path       TEXT,
  backdrop_path     TEXT,
  overview          TEXT,
  vote_average      DOUBLE PRECISION,
  vote_count        INTEGER,
  first_air_date    DATE,
  last_air_date     DATE,
  release_date      DATE,
  runtime           INTEGER,
  watched           BOOLEAN DEFAULT false,
  watched_at        TIMESTAMPTZ,
  genres            TEXT[],
  status            VARCHAR(64),
  tagline           TEXT,
  original_language VARCHAR(16),
  popularity        DOUBLE PRECISION,
  in_production     BOOLEAN,
  networks          TEXT[],
  seasons_data      JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, series_id)
);

-- Prefer uniqueness by TMDB id + type when tmdb_id is present
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_series_user_media_tmdb
  ON user_series (user_id, media_type, tmdb_id)
  WHERE tmdb_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_series_user_id ON user_series (user_id);
CREATE INDEX IF NOT EXISTS idx_user_series_media_type ON user_series (media_type);

-- ========== FEATURED ==========
CREATE TABLE IF NOT EXISTS featured_series (
  id           SERIAL PRIMARY KEY,
  series_id    VARCHAR(255) NOT NULL,
  series_name  VARCHAR(512) NOT NULL,
  poster_path  TEXT,
  reason       TEXT,
  media_type   VARCHAR(16) NOT NULL DEFAULT 'tv',
  is_active    BOOLEAN NOT NULL DEFAULT true,
  added_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  added_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_featured_active ON featured_series (is_active);

-- ========== ANNOUNCEMENTS ==========
CREATE TABLE IF NOT EXISTS announcements (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  message     TEXT NOT NULL,
  type        VARCHAR(32) NOT NULL DEFAULT 'info',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ
);

-- ========== ACTIVITY (admin analytics) ==========
CREATE TABLE IF NOT EXISTS user_activity (
  id          SERIAL PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  action      VARCHAR(64),
  meta        JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_created
  ON user_activity (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_user
  ON user_activity (user_id);

-- ========== UPGRADE helpers (safe on existing DBs) ==========
ALTER TABLE featured_series
  ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'tv';

ALTER TABLE user_series
  ADD COLUMN IF NOT EXISTS media_type VARCHAR(16) DEFAULT 'tv',
  ADD COLUMN IF NOT EXISTS tmdb_id INTEGER,
  ADD COLUMN IF NOT EXISTS watched_episodes JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS total_episodes INTEGER,
  ADD COLUMN IF NOT EXISTS release_date DATE,
  ADD COLUMN IF NOT EXISTS runtime INTEGER,
  ADD COLUMN IF NOT EXISTS watched BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS seasons_data JSONB;