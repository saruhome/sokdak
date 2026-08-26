# Backend 보안 QA — 격리된 test/staging Supabase 검증 절차

**전제:** 이 문서의 검증은 **운영 프로젝트가 아닌** 별도 test/staging Supabase 프로젝트에서만 수행한다.
현재(2026-08) staging 프로젝트가 아직 없으므로, 이 문서는 프로젝트가 준비되는 시점에 그대로 실행할
수 있는 절차 + 향후 자동화 시 opt-in 구조를 정의한다. **환경이 없다고 조용히 skip하는 자동 테스트를
만들지 않는다** — 자동화가 추가되면 아래 opt-in 규약을 따른다.

## 자동화 opt-in 규약 (integration test를 추가하는 사람이 따를 것)

- 실행 조건: `INTEGRATION_TESTS=true` 환경변수가 있을 때만 테스트가 **존재**하도록 한다
  (`describe.skip` 분기가 아니라 testMatch 자체를 분리 — 기본 `npm run test:ci` 결과에 skipped로도
  나타나지 않게).
- 접속 정보: `SUPABASE_STAGING_URL`, `SUPABASE_STAGING_ANON_KEY`는 CI secret 또는 로컬
  `.env.integration`(`.gitignore` 등재 필수)로만 주입한다. **service role key는 integration test에
  절대 주입하지 않는다** — service role 검증이 필요한 항목(계정 삭제)은 Edge Function 경유로만 호출한다.
- 데이터: 각 테스트는 실행 전에 자신의 fixture 사용자·데이터를 생성하고, 종료 시 반드시 cleanup한다.
  fixture 사용자 email은 `qa-{run-id}@sokdak.test` 형식으로 만들어 잔류물을 식별 가능하게 한다.
- 로그: access token, refresh token, signed URL, 암호문을 로그·리포트에 출력하지 않는다.

## 수동 검증 체크리스트 (staging 프로젝트 준비 후 1회 이상 수행)

사전 준비: staging 프로젝트에 운영과 동일한 migration 전체 적용, 테스트 계정 A/B 생성.

| # | 확인 항목 | 방법 | 기대 결과 | 완료 |
|---|---|---|---|---|
| 1 | 비로그인 공개 조회 범위 | anon key로 REST 직접 호출: `words`, `posts`, `comments`, `profiles` SELECT | 공개 설계 테이블만 읽히고, `support_tickets`·`notifications`·`saved_words` 등 개인 테이블은 0행 | ☐ |
| 2 | A→B 데이터 접근 차단 | A 세션 토큰으로 B의 게시글 UPDATE/DELETE, B의 좋아요/저장/알림/티켓 SELECT·INSERT·UPDATE 시도 | 전부 RLS 거부(0행 또는 오류). 특히 UPDATE가 "조용히 0행"인 경우도 실패로 오인하지 않게 응답 rowcount 확인 | ☐ |
| 3 | Storage prefix 위조 차단 | A 세션으로 `post-images/{B의 uuid}/x.jpg` 업로드·삭제 시도, `profile-avatars/{B uuid}/...` 동일 | 전부 거부 | ☐ |
| 4 | private avatar 경로 비노출 | B가 프로필 사진 업로드 → A가 커뮤니티 목록/상세 조회 | 응답 DTO에 `profile-avatars/` 경로·signed URL이 포함되지 않음 (`isProfileAvatarPath` 필터 동작 확인) | ☐ |
| 5 | 계정 삭제 정리 완전성 | 이미지 여러 장 가진 A 삭제 → Auth 사용자, profiles·posts·comments·likes 행, `post-images/{A}/`, `profile-avatars/{A}/` 확인 | 전부 제거. B의 데이터는 무손상 | ☐ |
| 6 | 계정 삭제 재호출/중간 실패 | 삭제 직후 동일 토큰으로 재호출; (가능하면) Storage 삭제 도중 함수 중단 후 재호출 | 재호출 성공(2xx), 중단 후 재호출 시 남은 객체부터 이어서 완료 | ☐ |

검증 완료 시 이 문서에 날짜·프로젝트 ref(민감정보 제외)·수행자를 기록한다.

## 검증 이력

| 날짜 | staging ref | 수행자 | 결과 |
|---|---|---|---|
| — | — | — | 미수행 (staging 프로젝트 미생성) |
