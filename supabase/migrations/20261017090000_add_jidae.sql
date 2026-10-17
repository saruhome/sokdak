-- 지대 승격 (2026-10-17, 운영자 승인 "8번 승인", 아침 검수).
--   600 지대 — 2000년대 초 10대 은어('엄청, 매우'). category outdated-slang.
-- 검증: slang_candidates 후보 행 존재, [표준사전: 뜻다름] 판정(표준 '지대' 10건은 전부 한자어 명사·어근).
--       어원 미확정(졸라 대박 축약설 / 至大설) — draft의 origin에 양설을 병기한 그대로 승격한다.
--
-- 데이터 출처: slang_candidates.draft_payload 원본을 그대로 옮긴다(손 전사 없음).
-- ponytail: draft_payload 참조 방식 — 후보 행이 지워지면 insert가 빈다.
--           그때 리터럴 INSERT로 전개할 것(현 운영에선 후보 행을 지우지 않음).
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

begin;

insert into public.words (
  id, word, romanization, category, secondary_category,
  short_desc, short_desc_i18n, pronunciation, meanings,
  origin, origin_i18n, "usage", usage_i18n, related_words, likes, saves, translations
)
select '600',
  p->>'word', p->>'romanization', p->>'category', p->>'secondary_category',
  p->>'short_desc', p->'short_desc_i18n', p->>'pronunciation', p->'meanings',
  p->>'origin', p->'origin_i18n', p->>'usage', p->'usage_i18n',
  coalesce((select array_agg(x) from jsonb_array_elements_text(p->'related_words') x), '{}'::text[]),
  0, 0, p->'translations'
from public.slang_candidates c,
lateral (select c.draft_payload p) q
where c.term = '지대' and c.status = 'native_review_pending'
on conflict (id) do nothing;

update public.slang_candidates
set status = 'published',
    review_note = coalesce(review_note, '') || ' | 승인 2026-10-17 (words id 600 승격)'
where term = '지대' and status = 'native_review_pending';

commit;

-- 적용 후 확인: select count(*) from public.words; → 516
