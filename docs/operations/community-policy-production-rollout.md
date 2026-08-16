# 커뮤니티 운영정책 동의 원장 운영 DB 배포·검증 Runbook

**대상:** SokDak Android 비공개 베타 운영 환경
**목적:** 기존 `profiles.community_guidelines_accepted_at` 참조 불일치를 제거하고, 정책 버전·표시 언어·원문 해시·서버 수락 시각을 보존하는 append-only 동의 원장을 안전하게 운영 DB에 반영한다.
**실행 원칙:** 이 절차는 **계획된 유지보수 창**에서만 실행한다. migration이 완료되고 활성 정책이 게시되기 전까지는 게시글·댓글 작성이 의도적으로 차단된다.

> `community_policy_consents`가 법적·운영 증빙의 기준 원장이다. `account_settings.community_guidelines_accepted_at`와 `current_community_policy_version_id`는 빠른 UI 표시용 캐시일 뿐, 권한 판정에는 사용하지 않는다.

## 1. 배포 전 결정과 준비

| 항목 | 실행 기준 | 완료 조건 |
| --- | --- | --- |
| 정책 원문 확정 | 한국어 원문과 `ko`, `en`, `ja`, `es`, `vi` 전문을 검토·승인한다. | 각 언어 전문의 파일이 변경 불가능한 버전 경로에 고정됨. |
| 공개 URL 고정 | `/policies/community-guidelines/<version>/<locale>`처럼 버전이 URL에 포함된 HTTPS 주소를 사용한다. mutable한 `/guidelines` 단일 주소는 사용하지 않는다. | 모든 URL이 로그인 없이 200 응답, 표시 문서가 최종 승인본과 일치함. |
| 해시 생성 | 사용자가 실제로 보게 될 **정확한 UTF-8 배포 파일**에서 SHA-256을 계산한다. | 64자리 소문자 hex 해시가 각 파일마다 확보됨. |
| 앱 릴리스 조율 | 현재 구버전 앱은 직접 `account_settings`를 수정할 수 있으나, 새 migration은 이를 차단한다. 새 RPC를 호출하는 빌드를 준비하고, 배포 창에는 커뮤니티 쓰기 기능을 숨기거나 안내한다. | 새 Android 베타 빌드가 승인·배포 준비됨. |
| 복구 준비 | 현재 DB 백업·복구 정책을 확인하고, 정책 파일·해시·실행 SQL의 승인본을 별도 보관한다. | 운영자와 실행 시간, 중단 기준이 지정됨. |

다음 명령은 문서 파일을 기준으로 해시를 만들기 위한 예시다. URL 응답이 아닌 배포 전 원본 파일을 해싱해야 CDN 변환, 동적 HTML, 공백 정규화 때문에 값이 달라지는 문제를 피할 수 있다.

```bash
sha256sum community-guidelines-1.0.0-ko.html
sha256sum community-guidelines-1.0.0-en.html
sha256sum community-guidelines-1.0.0-ja.html
sha256sum community-guidelines-1.0.0-es.html
sha256sum community-guidelines-1.0.0-vi.html
```

> `canonical_content_sha256`는 canonical Korean policy의 해시이므로 첫 공개 버전에서는 `ko` 행의 `content_sha256`와 같아야 한다. 언어별 번역문은 각자 다른 해시를 가진다.

## 2. 시드 템플릿 완성 및 사전 검증

`docs/operations/community-policy-seed-template.sql`을 복사해 비밀 저장소 또는 변경관리 티켓에 작업본을 만든다. 원본 템플릿은 `<...>` 값을 그대로 둔 채 실행해서는 안 된다.

| 템플릿 입력값 | 검증 기준 |
| --- | --- |
| `<SEMVER_EG_1.0.0>` | `1.0.0`처럼 `major.minor.patch` 형식. 정책 내용이 변경되면 새 버전을 사용한다. |
| `<EFFECTIVE_AT_ISO8601>` | `2026-08-20T09:00:00+09:00`처럼 UTC offset을 포함한다. 실제 공개 시각보다 미래로 설정하면 해당 시각 전까지는 활성 정책으로 조회되지 않는다. |
| `<SHA256_...>` | `sha256sum` 첫 번째 열의 64자리 소문자 hex만 입력한다. 따옴표, 파일명, `sha256:` 접두사는 넣지 않는다. |
| `<PUBLIC_DOMAIN>` | TLS가 적용된 실제 서비스 도메인. URL에는 버전과 locale을 반드시 포함한다. |
| `1.0.0` URL 세그먼트 | `version` 값을 바꾸면 5개 URL 경로의 `1.0.0`도 같은 값으로 바꾼다. |

실행 전 다음 검사를 수행한다. 첫 명령은 placeholder가 하나라도 남아 있으면 실패해야 하며, 두 번째 명령은 모든 해시가 64자리 소문자 hex인지 확인한다.

```bash
# 작업본 경로를 실제 파일명으로 바꾼다.
grep -nE '<[A-Z0-9_]+>' community-policy-seed-production.sql && exit 1 || true

grep -oE "'[a-f0-9]{64}'" community-policy-seed-production.sql | wc -l
# 결과는 canonical 1개 + locale 5개, 즉 6이어야 한다.
```

정책 페이지 URL은 별도로 브라우저의 비로그인 창에서 열어, 언어·버전·전문 내용이 파일 승인본과 동일한지 확인한다. 해시는 **원문 파일 보관본**, URL은 **사용자 표시본**으로 서로 교차 확인한다.

## 3. 권장 운영 배포 순서

새 migration은 기존 게시글·댓글 트리거를 교체하며, 활성 정책이 없으면 쓰기를 거부한다. 따라서 데이터베이스 migration과 정책 게시를 분리된 날짜에 실행하지 말고, 짧은 단일 유지보수 창에 연속 배치한다.

| 순서 | 실행 | 성공 판단 | 중단·수정 기준 |
| --- | --- | --- | --- |
| 1 | 커뮤니티 탭의 작성·댓글 진입을 일시 안내 화면으로 전환하거나 배포 공지를 활성화한다. | 사용자가 정책 전환 중 쓰기를 시도하지 않음. | 쓰기가 노출된 채로 진행하지 않는다. |
| 2 | 운영 Supabase의 SQL Editor 또는 승인된 migration 배포 경로에서 `20260816130000_community_policy_consent_ledger.sql`을 실행한다. | 오류 없이 commit, 세 테이블·두 RPC·두 게시 트리거 생성. | 오류 시 migration 출력 전문을 보관하고, 원인을 수정하기 전 재실행하지 않는다. |
| 3 | 검증을 마친 **완성 시드 SQL**을 즉시 실행한다. | `community_guidelines`의 active 행 1개와 published locale 5개 생성. | 시드가 실패하면 커뮤니티를 읽기 전용으로 유지한다. |
| 4 | 아래 SQL 검증 쿼리를 실행한다. | 활성 정책, 5개 locale, RLS, RPC 권한이 모두 기대값과 일치. | 한 항목이라도 불일치하면 앱 기능을 재개하지 않는다. |
| 5 | 새 RPC 호출 코드가 포함된 Android 비공개 베타 빌드를 배포하고, 테스트 계정으로 E2E 확인을 한다. | 동의 전 거부·동의 후 작성 성공 확인. | 구버전 클라이언트 오류가 발생하면 업데이트 안내를 유지한다. |
| 6 | 쓰기 기능을 재개하고 24시간 동안 RPC 오류·동의 실패·게시 거부를 모니터링한다. | 오류율과 사용자 문의가 정상 범위. | 오류가 재현되면 즉시 읽기 전용으로 되돌리고 원인을 분석한다. |

## 4. 운영 DB 검증 SQL

다음 쿼리는 시드 직후 SQL Editor에서 수행한다. 읽기 전용 확인 쿼리이므로 데이터 변경을 하지 않는다.

### 4.1 활성 정책과 번역본 완전성

```sql
select
  policy.version,
  policy.status,
  policy.effective_at,
  policy.default_locale,
  policy.canonical_content_sha256,
  array_agg(locale.locale order by locale.locale) filter (
    where locale.translation_status = 'published'
  ) as published_locales,
  count(*) filter (where locale.translation_status = 'published') as published_locale_count
from public.community_policy_versions policy
left join public.community_policy_locales locale
  on locale.policy_version_id = policy.id
where policy.policy_key = 'community_guidelines'
  and policy.status = 'active'
  and policy.effective_at <= now()
group by policy.id;
```

**통과 기준:** 결과가 정확히 1행이고, `published_locale_count = 5`, `published_locales = {en,es,ja,ko,vi}`이며 `default_locale = ko`이다. 한국어 `content_sha256`와 `canonical_content_sha256`가 같다는 점도 다음 쿼리로 확인한다.

```sql
select
  policy.version,
  policy.canonical_content_sha256 = locale.content_sha256 as canonical_hash_matches_korean,
  locale.content_url
from public.community_policy_versions policy
join public.community_policy_locales locale
  on locale.policy_version_id = policy.id
where policy.policy_key = 'community_guidelines'
  and policy.status = 'active'
  and locale.locale = 'ko';
```

### 4.2 스키마, RLS 및 RPC 권한

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'community_policy_versions',
    'community_policy_locales',
    'community_policy_consents'
  )
order by tablename;

select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename in (
    'community_policy_versions',
    'community_policy_locales',
    'community_policy_consents'
  )
order by tablename, policyname;

select routine_name, privilege_type, grantee
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name in (
    'accept_current_community_policy',
    'has_accepted_current_community_policy'
  )
order by routine_name, grantee;
```

**통과 기준:** 세 테이블 모두 `rowsecurity = true`여야 한다. `community_policy_consents`에는 사용자 자신의 행만 읽는 SELECT 정책만 있어야 하며, `authenticated`에게만 두 RPC의 `EXECUTE` 권한이 있어야 한다. `anon` 또는 `public`에 `accept_current_community_policy` 실행 권한이 있으면 안 된다.

### 4.3 실제 사용자 E2E 검증

SQL Editor에서 서비스 역할로 직접 insert하지 않는다. 반드시 새 Android 비공개 베타 빌드와 신규 테스트 계정을 사용한다.

| 시나리오 | 기대 결과 |
| --- | --- |
| 로그인 후 커뮤니티 진입, 동의 전 게시글 작성 | 서버가 `42501` / `Current community policy acceptance is required before posting`으로 거부. |
| `en` UI에서 전문 확인·체크·동의 | RPC가 `community_guidelines`, `1.0.0`, `en`, 서버 수락 시각을 반환. |
| 동일 계정에서 같은 정책에 재동의 | `community_policy_consents` 행은 1개 유지. 수락 시각도 최초 증빙 시각을 반환. |
| 동의 후 게시글·댓글 작성 | 정상 저장. |
| `ja`, `es`, `vi`에서 동의 | 해당 locale별 별도 사용자 동의 원장에 정확한 `policy_locale`과 locale hash가 저장. |
| 비로그인 사용자의 동의 호출 | 인증 필요 오류. |
| 존재하지 않는 locale (`zh`, `ar`) 호출 | published translation 부재 오류. 앱은 이 언어를 지원하기 전 해당 locale의 reviewed·published 행을 먼저 추가해야 함. |

운영자는 테스트 완료 후 아래 쿼리로 원장에 서로 다른 언어의 증빙이 쌓였는지 확인할 수 있다. 사용자 식별 정보가 필요한 운영 권한에서만 조회하며, 결과를 외부 문서로 내보낼 때는 `user_id`를 마스킹한다.

```sql
select
  policy_version,
  policy_locale,
  localized_content_sha256,
  source,
  accepted_at,
  platform,
  app_version
from public.community_policy_consents
where policy_key = 'community_guidelines'
order by accepted_at desc
limit 50;
```

> 현재 앱 호출부는 `locale`과 `source`를 전달한다. `platform`과 `app_version`은 schema에서 수집 가능하지만 현재는 `NULL`일 수 있다. 운영 증빙에 해당 값이 반드시 필요하다면 다음 앱 릴리스에서 Expo 앱 버전과 Android 플랫폼 값을 명시적으로 전달한다.

## 5. 장애 대응과 정책 개정

이 migration은 과거 동의 원장을 삭제하지 않는다. 긴급 상황에서 단순히 새 트리거를 꺼서 게시를 허용하면 운영정책 강제가 사라지므로 이를 정상적인 rollback으로 사용하지 않는다. 앱에서 작성 UI를 숨기고 커뮤니티를 읽기 전용으로 유지한 뒤 원인을 수정하는 것이 안전하다.

새 정책을 공개할 때는 기존 행이나 동의 행을 수정·삭제하지 않는다. 새 버전을 `scheduled` 상태로 삽입하고, 모든 locale을 reviewed/published로 준비한 뒤 하나의 제어된 트랜잭션에서 기존 active를 `retired`, 새 버전을 `active`로 바꾼다. 그 직후부터 기존 사용자는 새 버전에 동의하기 전 게시·댓글을 작성할 수 없으며, 과거 동의 증빙은 그대로 남는다.

```sql
begin;

update public.community_policy_versions
set status = 'retired', retired_at = now()
where policy_key = 'community_guidelines'
  and status = 'active';

update public.community_policy_versions
set status = 'active', published_at = coalesce(published_at, now())
where policy_key = 'community_guidelines'
  and version = '<NEW_VERSION>'
  and status = 'scheduled';

commit;
```

**배포 후 관찰 지표:** RPC 오류 수, `42501` 게시 거부 수, 언어별 동의 완료율, `No published community policy translation` 오류, 정책 링크 4xx/5xx 응답을 24시간 이상 확인한다.

## 6. 변경관리 증빙 보관

릴리스 티켓에는 migration 파일의 commit SHA, 실행자·시간, 정책 원문 승인본, 5개 언어 파일의 SHA-256, 시드 SQL, 위 검증 쿼리 결과, E2E 테스트 계정을 마스킹한 증적을 함께 보관한다. 이 세트가 "어느 정책의 어떤 언어 원문에 언제 동의했는가"를 나중에 설명할 수 있는 운영 증빙이 된다.
