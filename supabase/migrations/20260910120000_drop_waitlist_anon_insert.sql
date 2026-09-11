-- Waitlist inserts now go through the landing server with SUPABASE_SECRET_KEY
-- (Vercel env, registered 2026-09-10), so the public INSERT policy is no longer
-- needed. Dropping it closes the direct-REST spam path: the publishable key can
-- no longer insert rows, and the table keeps having no SELECT policy (emails
-- stay sealed). Applied to production via MCP on 2026-09-10.
drop policy "Public can submit waitlist email" on public.waitlist_subscribers;
