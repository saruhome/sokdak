-- 신조어 아침 검수 승격 (2026-09-05, 운영자 승인 9건).
--    만반잘부 오운완 팩폭 찐텐 억텐 마상 재질 취존 슬세권
-- slang_candidates.draft_payload를 SQL로 그대로 옮겨 초안 내용이 한 글자도 바뀌지 않게 했다.
-- '-세권' 계열 일괄 등재는 다음 마이그레이션(20260905090100)에서 이어진다.
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

begin;

-- 1부: 검수 승인 9건 — slang_candidates.draft_payload를 그대로 옮긴다(사람 손으로 다시 옮겨 적지 않아
-- 초안 내용이 한 글자도 바뀌지 않음을 보장한다).
insert into public.words (id, word, romanization, category, short_desc, short_desc_i18n, pronunciation,
                          meanings, origin, origin_i18n, usage, usage_i18n, related_words, likes, saves, translations)
select m.id,
       c.draft_payload->>'word',
       c.draft_payload->>'romanization',
       c.draft_payload->>'category',
       c.draft_payload->>'short_desc',
       c.draft_payload->'short_desc_i18n',
       c.draft_payload->>'pronunciation',
       c.draft_payload->'meanings',
       c.draft_payload->>'origin',
       c.draft_payload->'origin_i18n',
       c.draft_payload->>'usage',
       c.draft_payload->'usage_i18n',
       coalesce(array(select jsonb_array_elements_text(c.draft_payload->'related_words')), '{}'::text[]),
       0, 0,
       c.draft_payload->'translations'
from (values ('250','만반잘부'),('251','오운완'),('252','팩폭'),('253','찐텐'),('254','억텐'),('255','마상'),('256','재질'),('257','취존'),('258','슬세권')) as m(id, term)
join public.slang_candidates c
  on c.term = m.term and c.status = 'native_review_pending';

-- 승격된 9건이 모두 들어갔는지 확인(하나라도 빠지면 트랜잭션 중단)
do $$
begin
  if (select count(*) from public.words where id in ('250','251','252','253','254','255','256','257','258')) <> 9 then
    raise exception '승인 9건 중 일부가 등재되지 않았습니다';
  end if;
end $$;

commit;

-- 적용 후 확인: select count(*) from public.words; → 184
