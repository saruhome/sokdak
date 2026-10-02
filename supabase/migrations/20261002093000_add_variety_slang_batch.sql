-- 예능 신조어 4건 승격 (2026-10-02, 운영자 승인): 악마의 편집(589) · 복불복(590) · 그잡채(591) · 머선129(592)
-- 검증: 네 건 모두 review_note에 [표준사전: 없음/뜻다름] 판정 있음.
--   589 악마의 편집 — 뜻은 나무위키·한국일보·엑스포츠뉴스 일치. '원조=2010 슈스케2'는 나무위키 단독이라 완화 서술.
--   590 복불복 — 표준사전 福不福(운수)과 뜻 다름. <1박 2일>이 최초는 아니고 대중화 계기(상상플러스 선행설).
--   591 그잡채 — 국립국어원 온라인가나다 답변·아시아에이·나무위키 일치. 2015 이른 용례는 위키 단독, 2022 확산은 기사 확인.
--   592 머선129 — 구조·강호동 억양 연결은 머니투데이·엑스포츠뉴스 일치. 최초 확산 경로(난닝구/랄로)는 언론 미확인.
-- 같은 run의 느낌 아니까 · 사장님 나빠요 · 나야 들기름은 "개그 밈" 사유로 반려(failed_validation).
--
-- 데이터 출처: slang_candidates.draft_payload 원본을 그대로 옮긴다 (손으로 전사하지 않아 오류 없음).
-- ponytail: draft_payload 참조 방식 — 후보 행이 지워지면 이 파일은 빈 insert가 된다.
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
select v.id,
  p->>'word', p->>'romanization', p->>'category', p->>'secondary_category',
  p->>'short_desc', p->'short_desc_i18n', p->>'pronunciation', p->'meanings',
  p->>'origin', p->'origin_i18n', p->>'usage', p->'usage_i18n',
  coalesce((select array_agg(x) from jsonb_array_elements_text(p->'related_words') x), '{}'::text[]),
  0, 0, p->'translations'
from (values ('589','악마의 편집'),('590','복불복'),('591','그잡채'),('592','머선129')) v(id, term)
join public.slang_candidates c on c.term = v.term,
lateral (select c.draft_payload p) q
on conflict (id) do nothing;

update public.slang_candidates
set status = 'published',
    review_note = coalesce(review_note, '') || ' | 승인 2026-10-02 (words id 승격)'
where term in ('악마의 편집','복불복','그잡채','머선129') and status = 'native_review_pending';

update public.slang_candidates
set status = 'failed_validation',
    review_note = coalesce(review_note, '') || ' | [반려: 개그 밈 2026-10-02 검수]'
where term in ('느낌 아니까','사장님 나빠요','나야 들기름') and status = 'native_review_pending';

commit;

-- 적용 후 확인: select count(*) from public.words; → 508
