-- related_words 정리 (2026-09-08, 운영자 승인 "참조에서 제외" + "제안한대로 진행").
--
-- related_words는 외래키가 아니라 자유 텍스트 배열이라 존재하지 않는 표제어를 적어도 DB가 받아준다.
-- 화면에서는 app/tabs/dictionary/[id].tsx 가 allWords.find(w => w.word === rw) 로 찾고, 못 찾으면
-- disabled + opacity 0.5 칩을 그린다 — 눌러도 아무 일이 없는 흐릿한 버튼이 된다. 앱이 죽지는 않아
-- 지금까지 아무도 눈치채지 못했고, 전수 조사에서 648개 참조 중 94개(단어 316개 중 75개)가 이 상태였다.
--
-- 처리 방침:
--   ① 표제어로 존재 → 그대로 둔다.
--   ② 다른 단어의 alias와 일치 → 그 단어의 표제어로 바꾼다. 링크를 살리는 쪽이 지우는 것보다 낫다.
--      사바사의 '티엠아이'를 'TMI'로, 인생 맛집의 'JMT'를 '존맛탱'으로. (2건)
--   ③ 자기 자신의 alias를 가리킴 → 뺀다. 존맛탱의 'JMT'가 그렇다 — JMT는 존맛탱의 alias라
--      검색은 이미 되고 있고, 자기 항목으로 가는 버튼은 의미가 없다. (1건)
--   ④ 아무 데도 없음 → 뺀다. 대부분 '감사'·'진짜'·'완벽'처럼 표준국어대사전에 있는 말이라
--      수집 범위 밖이고 앞으로도 표제어가 되지 않는다. (91건)
--
-- ②로 살린 두 건을 빼면 92개가 빠져 참조는 720 → 628이 되고 죽은 참조는 0이 된다.
-- 배열 순서는 유지하고, ②의 교체로 중복이 생기면 먼저 나온 것만 남긴다.
--
-- 남는 문제: 이 정리로 related_words가 빈 단어가 32개 생긴다(존맛탱 포함). 그 단어의 상세 화면에서는
-- '관련 단어' 섹션 자체가 사라진다. 죽은 칩보다는 낫지만, 채워 넣을 짝을 따로 정해 주는 편이 좋다.
--
-- 재발 방지: related_words에 외래키를 걸 수 없는 구조(표제어 문자열 참조)이므로, 이 대조 쿼리를
-- 스카우트 적재 단계나 CI에 넣어야 한다.
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

begin;

with expanded as (
  select w.id, e.ref, e.ord
  from public.words w
  cross join lateral unnest(w.related_words) with ordinality as e(ref, ord)
),
mapped as (
  select x.id, x.ord,
         case
           when t.id is not null then x.ref                       -- ① 표제어로 존재
           when a.id is not null and a.id <> x.id then a.word     -- ② 남의 alias → 표제어로 교체
           else null                                              -- ③④ 자기참조·미존재 → 제거
         end as ref
  from expanded x
  left join public.words t on t.word = x.ref
  left join public.words a on x.ref = any(a.aliases)
),
deduped as (
  select id, ref, min(ord) as ord
  from mapped where ref is not null
  group by id, ref
),
rebuilt as (
  select id, array_agg(ref order by ord) as refs
  from deduped group by id
)
update public.words w
set related_words = coalesce(r.refs, '{}'::text[])
from (select w2.id, r2.refs from public.words w2 left join rebuilt r2 on r2.id = w2.id) r
where r.id = w.id
  and w.related_words is distinct from coalesce(r.refs, '{}'::text[]);

commit;

-- 적용 후 확인:
--   with rw as (select word, unnest(related_words) as ref from words)
--   select count(*) from rw left join words t on t.word = rw.ref where t.id is null;  → 0
