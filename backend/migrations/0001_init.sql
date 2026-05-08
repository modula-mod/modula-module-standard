-- Phase 5.3 template migration
-- Replace these statements with module-specific persistence schema.

CREATE TABLE IF NOT EXISTS mod_example_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at BIGINT NOT NULL
);
