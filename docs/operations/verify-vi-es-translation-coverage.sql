SELECT
  count(*) FILTER (WHERE translations @> '[{"lang":"🇻🇳 VI"}]'::jsonb) AS vi_word_count,
  count(*) FILTER (WHERE translations @> '[{"lang":"🇪🇸 ES"}]'::jsonb) AS es_word_count,
  count(*) AS total_word_count
FROM public.words
LIMIT 1;
