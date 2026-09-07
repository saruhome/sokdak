-- 익속(283) origin에 방송 용례 추가 (2026-09-06, 운영자 제보).
--
-- MBC 드라마 <언더커버 하이스쿨>(2025)에 이 말이 화면 자막 설명과 함께 등장한다
-- ("익속 — SNS 소통 용어, '익명 속마음'의 줄임말"). 지금까지 확보한 출처가 블로그·트렌드
-- 미디어뿐이었는데, 방송사가 직접 뜻풀이를 붙인 용례라 뜻의 근거가 하나 더 생긴 셈이다.
-- 몇 화인지는 확인되지 않아 회차는 적지 않는다.
--
-- 썸네일은 넣지 않았다 — CLAUDE.md의 저작권 판단에 따라 드라마 화면 자체 캡처는 운영자가
-- word-thumbnails 버킷(클라이언트 insert 정책 없음)에 직접 올리는 예외 경로다. 유튜브
-- 공식 클립을 찾으면 video_youtube_id + 유튜브 썸네일 CDN 쪽이 우선이나 해당 장면 클립은
-- 확인되지 않았다.
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

begin;

update public.words
   set origin = origin || ' MBC 드라마 <언더커버 하이스쿨>(2025)에도 이 말이 나오는데, 화면에 ''익속 — SNS 소통 용어, 익명 속마음의 줄임말''이라는 자막 설명이 함께 붙었다.',
       origin_i18n = jsonb_build_object(
         'en', (origin_i18n->>'en') || ' It also turns up in the MBC drama Undercover High School (2025), where the screen carries a caption glossing it: “익속 — an SNS term, short for 익명 속마음.”',
         'ja', (origin_i18n->>'ja') || ' MBCドラマ『アンダーカバー・ハイスクール』(2025)にも登場し、画面には「익속 — SNSの用語、익명 속마음の略」という字幕解説が添えられていた。',
         'es', (origin_i18n->>'es') || ' También aparece en la serie de MBC Undercover High School (2025), donde la pantalla lo glosa con un rótulo: “익속 — término de redes sociales, abreviatura de 익명 속마음”.',
         'vi', (origin_i18n->>'vi') || ' Từ này cũng xuất hiện trong phim MBC Undercover High School (2025), kèm dòng phụ đề giải nghĩa ngay trên màn hình: “익속 — thuật ngữ mạng xã hội, viết tắt của 익명 속마음”.',
         'de', (origin_i18n->>'de') || ' Es taucht auch in der MBC-Serie Undercover High School (2025) auf, wo eine Bildunterschrift es erklärt: „익속 — ein Social-Media-Begriff, kurz für 익명 속마음“.'
       )
 where id = '283';

commit;
