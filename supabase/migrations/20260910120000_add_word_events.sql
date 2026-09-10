-- Word-level usage analytics: per-word view/click events and per-search impressions.
-- Operator-approved design (2026-09-10): one insert per word-detail open (word_views)
-- and one insert per executed search (search_events, shown word ids as an array so
-- impressions don't explode into per-word rows). Clients get INSERT only; reading is
-- for the operator via Supabase Studio / service_role through the word_stats view.
-- No FK to words on purpose: analytics rows must never block word deletion.
-- Applied to production via MCP apply_migration; this file is the provenance record.

create table word_views (
  id bigint generated always as identity primary key,
  word_id text not null,
  source text not null default 'other'
    check (source in ('search', 'home', 'category', 'dictionary', 'related', 'other')),
  created_at timestamptz not null default now()
);

create table search_events (
  id bigint generated always as identity primary key,
  query text not null,
  result_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table word_views enable row level security;
alter table search_events enable row level security;

create policy word_views_insert_all on word_views
  for insert to anon, authenticated with check (true);
create policy search_events_insert_all on search_events
  for insert to anon, authenticated with check (true);

-- No SELECT/UPDATE/DELETE policies: clients can only append.
revoke select, update, delete on word_views from anon, authenticated;
revoke select, update, delete on search_events from anon, authenticated;

-- Operator-facing aggregate (query from Studio; not exposed to app roles).
create view word_stats as
select
  w.id,
  w.word,
  count(v.*) as total_views,
  count(v.*) filter (where v.source = 'search') as search_clicks,
  (select count(*) from search_events s where w.id = any (s.result_ids)) as search_impressions
from words w
left join word_views v on v.word_id = w.id
group by w.id, w.word;

revoke all on word_stats from anon, authenticated;
