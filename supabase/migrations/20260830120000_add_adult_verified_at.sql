-- 성인 확인 시각 (2026-08-30). slang(속어) 카테고리 단어는 프리미엄 + 성인 확인을
-- 모두 통과해야 볼 수 있다 — 이 컬럼은 앱 내 자기확인(만 19세 이상 확인 대화상자)의
-- 서버 기록이다. 본인 행 UPDATE 정책으로 클라이언트가 직접 기록한다(자기확인이라
-- is_premium 같은 서버 전용 잠금은 불필요).
-- ponytail: 자기확인 방식 — 실결제/법적 요건 발생 시 통신사 본인인증(KYC) + RLS 강제로 승격.

alter table public.account_settings
  add column if not exists adult_verified_at timestamptz;