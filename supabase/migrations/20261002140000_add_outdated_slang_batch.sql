-- 옛 유행어 4건 승격 (2026-10-02, 운영자 승인): 우왕ㅋ굳ㅋ(593) · 일촌(594) · 종결자(595) · 즐감(596)
-- 검증: 네 건 모두 review_note에 [표준사전: 없음/뜻다름] 판정 있음.
--   593 우왕ㅋ굳ㅋ — 2007 언론 기사 3건 + 리브레위키·나무위키, 디시 설문 1위. 검증 최상.
--   594 일촌 — 표준사전 一村(한 마을)과 뜻 다름. 작명 경위(촌수)는 단정하지 않고 "설명된다" 수준으로 서술.
--   595 종결자 — 유행 정점 2010 vs 2011 출처 갈림, 초안은 2010~2011년으로 표기.
--   596 즐감 — 뜻은 3개 출처 일치, 어원·최초 사용자는 미확정.
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
from (values ('593','우왕ㅋ굳ㅋ'),('594','일촌'),('595','종결자'),('596','즐감')) v(id, term)
join public.slang_candidates c on c.term = v.term,
lateral (select c.draft_payload p) q
on conflict (id) do nothing;

update public.slang_candidates
set status = 'published',
    review_note = coalesce(review_note, '') || ' | 승인 2026-10-02 (words id 승격)'
where term in ('우왕ㅋ굳ㅋ','일촌','종결자','즐감') and status = 'native_review_pending';

commit;

-- 적용 후 확인: select count(*) from public.words; → 512
