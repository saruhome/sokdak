-- Store the landing page UI language at signup so launch emails can be sent per-locale.
-- Applied to production via Supabase MCP on 2026-09-05 (version may differ from filename
-- timestamp — repo convention, see other migration headers).
ALTER TABLE waitlist_subscribers ADD COLUMN locale text NOT NULL DEFAULT 'en';
