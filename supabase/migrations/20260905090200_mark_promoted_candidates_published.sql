-- 승격된 9건의 검수 상태를 published로 내린다 (20260905090000에서 words로 옮긴 뒤 후속 처리).
-- 나머지 후보(미쳤다·얼렁뚱땡이·뉴아르·갑통알·못해솔로·김풍스럽다·익속)는 운영자 지시대로 보류 —
-- status는 native_review_pending 그대로 두어 다음 아침 검수에 다시 올라온다.
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

update public.slang_candidates
   set status = 'published'
 where term in ('만반잘부','오운완','팩폭','찐텐','억텐','마상','재질','취존','슬세권')
   and status = 'native_review_pending';
