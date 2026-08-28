-- [미적용 초안 — 승인 후 apply_migration으로 실행할 것]
--
-- is_premium 잠금 중복 정리.
-- 배경: 2026-08-28에 MCP로 직접 적용된 migration `block_client_premium_write`(GitHub에
-- 파일 없음 — provenance drift)가, 이미 20260814140000_split_private_account_settings.sql이
-- 만들어 둔 canonical 잠금(prevent_client_premium_write, SECURITY INVOKER +
-- search_path 고정)과 같은 테이블에 두 번째 트리거를 얹었다.
-- 8/28 함수는 SECURITY DEFINER + mutable search_path라 Supabase 보안 린트 WARN 3건의
-- 원인이기도 하다. canonical 쪽 하나만 남긴다.
--
-- 유지되는 동작: is_premium 변경은 service_role(결제 웹훅)만 허용.
-- account_settings의 notification_prefs/last_seen_reply_at/streak_count/phone/timezone
-- 본인 행 UPDATE는 트리거 조건이 is_premium 변경만 검사하므로 그대로 통과한다.

-- 1) 8/28 중복 트리거·함수 제거 (canonical 트리거가 동일 검사를 계속 수행)
drop trigger if exists account_settings_block_client_premium_write on public.account_settings;
drop function if exists public.block_client_premium_write();

-- 2) canonical 트리거 함수의 직접 EXECUTE 제거 — 트리거 실행에는 caller의 EXECUTE 권한이
--    필요 없어 REST /rpc 노출만 닫힌다. service_role grant는 무해하므로 함께 정리.
revoke execute on function public.prevent_client_premium_write() from public, anon, authenticated;

-- 3) staging 검증 절차(적용 전 staging에서 실행, 전부 통과해야 production 승인):
--
--    a. 트리거가 하나만 남았는지:
--       select tgname from pg_trigger
--       where tgrelid='public.account_settings'::regclass and not tgisinternal;
--       → account_settings_prevent_client_premium_write 하나만.
--
--    b. authenticated의 is_premium 변경 거부 (테스트 유저 세션으로):
--       set role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','<test-user-uuid>','role','authenticated')::text, true);
--       update public.account_settings set is_premium = true where user_id = '<test-user-uuid>';
--       → ERROR: is_premium may only be changed by the trusted billing service
--
--    c. 같은 세션에서 비-premium 컬럼 본인 행 UPDATE 허용:
--       update public.account_settings
--       set notification_prefs = notification_prefs, streak_count = streak_count,
--           last_seen_reply_at = now(), phone = phone, timezone = timezone
--       where user_id = '<test-user-uuid>';
--       → UPDATE 1 (에러 없음)
--
--    d. service_role의 is_premium 변경 허용:
--       reset role; set role service_role;
--       select set_config('request.jwt.claims',
--         json_build_object('role','service_role')::text, true);
--       update public.account_settings set is_premium = false where user_id = '<test-user-uuid>';
--       → UPDATE 1
--       ※ 실제 billing webhook은 아직 없다 — 이 검증은 service_role DB 경로만 확인하는 것이고,
--         웹훅 구현 시 그 경로로 재검증해야 한다.
--
--    e. REST /rpc 직접 호출 차단 (revoke 확인):
--       set role anon;
--       select public.prevent_client_premium_write();
--       → ERROR: permission denied for function
--       (트리거 함수라 직접 호출은 원래 "trigger functions can only be called as triggers"로도
--        막히지만, revoke 후엔 permission denied가 먼저 뜬다 — 어느 쪽이든 실행 불가면 통과)
