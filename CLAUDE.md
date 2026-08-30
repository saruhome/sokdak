# SOK-DAK (속닥) — Claude Code 전체 구현 가이드

## 프로젝트 개요
한국어 신조어 특화 모바일 학습 앱. 한국 거주 외국인 중·고급 학습자 타깃.
- **저장소**: https://github.com/saruhome/sokdak (private)
- **스택**: Expo SDK + React Native + TypeScript + Expo Router v3
- **디자인**: Figma `RbDWZdCLT0xXbH0ZW25jPi` (node `229:1651`), 단어 상세는 `NF716dQONfz0eDisYWPiTs` (node `683:3679`)
- **출시 타깃**: Google Play Store, Android 우선
- **기기 기준**: 360×800dp (2026년 기준 안드로이드 10~30대 최다 사용 해상도 —
  삼성 갤럭시 A/S 시리즈 중심, 실기기 물리 해상도로는 1080×2400 FHD+ 3x 밀도에 해당.
  출처: StatCounter Global Stats, 모바일 뷰포트 360×800/390×844/393×852가 전체
  트래픽의 60%를 차지하며 그중 360×800이 1위)
  기존 화면들은 iPhone 13 mini(375×812) 기준으로 만들어졌지만 대부분 flex/margin
  기반이라 폭이 좁아져도 깨지지 않음 — 새 화면은 처음부터 360dp 기준으로 작업할 것.
  Status Bar/BottomBar 높이는 SafeAreaView가 플랫폼별로 알아서 처리하므로 하드코딩 금지.
  **웹 프리뷰는 앱 자체가 360×800으로 고정됨** — `app/_layout.tsx`의 `DeviceFrame`이
  브라우저 창 크기와 무관하게 360×800 프레임(다크 배경 중앙 정렬)으로 렌더링.
  화면 폭이 필요하면 `Dimensions.get('window')` 대신 `constants/layout.ts`의
  `SCREEN_WIDTH`를 사용할 것 (웹=360 고정, 네이티브=실기기 폭).

## 로컬 실행

```bash
npm install --legacy-peer-deps   # 패키지 설치 시 항상 이 플래그 사용
npx expo start                   # Expo Go QR 스캔
npx tsc --noEmit --skipLibCheck  # 타입 검사
```

---

## 현재 파일 구조

```
app/
  _layout.tsx          # Root Stack (tabs + auth)
  auth/
    _layout.tsx
    login.tsx          # ✅ 소셜 로그인 (Facebook/Google/Apple)
    email-login.tsx    # ✅ 이메일 로그인 (+ 비밀번호 찾기)
    signup.tsx         # ✅ 회원가입 폼
  tabs/
    _layout.tsx        # ✅ 5탭 BottomBar (#52514E, 49px)
    index.tsx          # ✅ 홈
    mypage/
      _layout.tsx
      index.tsx          # ✅ 마이페이지 (로그인 전/후 분기)
      saved.tsx          # ✅ 저장한 단어
      my-posts.tsx       # ✅ 내 활동 게시물 (쓴 글/댓글 단 글/좋아요 한 글)
      profile.tsx        # ✅ 내 정보 관리
      suggest.tsx        # ✅ 신조어 제안하기
      support.tsx        # ✅ 고객센터
      notifications.tsx  # ✅ 알림설정
    dictionary/
      _layout.tsx
      index.tsx        # ✅ 단어 목록 (검색+정렬)
      [id].tsx         # ✅ 단어 상세
    category/
      _layout.tsx
      index.tsx        # ✅ 카테고리 그리드
      [slug].tsx       # ✅ 카테고리 상세
    community/
      _layout.tsx
      index.tsx        # ✅ 게시글 목록 (FAB)
      [id].tsx         # ✅ 게시글 상세+댓글
      write.tsx        # ✅ 글쓰기 (modal)
  search/
    _layout.tsx
    index.tsx         # ✅ 검색 (빈 상태/자동완성/결과/필터/없음/커뮤니티 결과)

constants/
  Colors.ts            # ✅ 디자인 토큰
  categories.ts        # ✅ 10개 카테고리 마스터
  words.ts             # ✅ 단어 — Supabase `words` 테이블 실데이터 (31개)
  mockPosts.ts         # ✅ 게시글 8개 mock
  authStore.ts         # ✅ 세션 인증 스토어
```

---

## 디자인 토큰

```typescript
// constants/Colors.ts (절대 하드코딩 금지)
background:       '#F6F2EA'   // 크림 배경
navBar:           '#52514E'   // 탭바/버튼 배경
navBarIconActive: '#F6F2EA'
navBarIconMuted:  '#948E84'
textPrimary:      '#1E1D1A'
textSecondary:    '#6B6760'
textTertiary:     '#9E9A94'
surface:          '#FFFFFF'
border:           '#E5E1D8'
divider:          '#EDE9E0'
accent:           '#3A6B4A'   // 초록 강조
error:            '#C04A3A'
```

### 카테고리 포인트 컬러 (constants/categories.ts 참고)
| slug | 컬러 |
|---|---|
| daily | #E8943A |
| kpop | #9B5DE5 |
| drama | #E84D4D |
| exclamation | #F5A623 |
| reels | #0095F6 |
| new-slang | #3DAA6E |
| frequently-used | #FF6B35 |
| consonant | #52514E |
| outdated-slang | #8B7355 |
| work | #AFC4B0 |

---

## 네비게이션 구조

```
Root Stack
├── tabs/                ← 탭바 항상 표시
│   ├── index            홈
│   ├── dictionary/
│   │   ├── index        단어 목록
│   │   └── [id]         단어 상세
│   ├── category/
│   │   ├── index        카테고리 그리드
│   │   └── [slug]       카테고리 상세
│   ├── community/
│   │   ├── index        게시글 목록
│   │   ├── [id]         게시글 상세
│   │   └── write        글쓰기 (modal)
│   └── mypage
│       ├── (base)       마이페이지
│       ├── saved        저장한 단어 ✅
│       ├── my-posts     내 활동 게시물 ✅
│       ├── profile      내 정보 관리 ✅
│       ├── suggest      신조어 제안하기 ✅
│       ├── support      고객센터 ✅
│       └── notifications 알림설정 ✅
├── auth/                ← 탭바 없음
│   ├── login            소셜 로그인
│   ├── email-login      이메일 로그인 ✅
│   └── signup           회원가입
└── search               전체 검색 ✅
    (app/search/index.tsx — 단일 화면, 입력 상태에 따라 뷰 전환)
```

---

## ✅ 구현 완료 화면 (19개)

| 화면 | 경로 | Figma 프레임 |
|---|---|---|
| 검색 (빈/자동완성/결과/필터/없음/커뮤니티) | /search | 229:2696, 2723, 2750, 2772, 2794, 2808 |
| 홈 | /tabs/ | 229:3706 |
| 단어 목록 | /tabs/dictionary/ | 229:2824 |
| 단어 상세 | /tabs/dictionary/[id] | 229:11206 |
| 카테고리 그리드 | /tabs/category/ | 229:2528 |
| 카테고리 상세 | /tabs/category/[slug] | 229:11360 (K-POP 예시) |
| 커뮤니티 목록 | /tabs/community/ | 229:3383 |
| 게시글 상세 | /tabs/community/[id] | 229:3482 |
| 글쓰기 | /tabs/community/write | 229:3319 |
| 마이페이지 | /tabs/mypage | 229:3149, 229:3175 |
| 저장한 단어 | /tabs/mypage/saved | 229:3738 |
| 내 활동 게시물 | /tabs/mypage/my-posts | 229:3620~3679 |
| 내 정보 관리 | /tabs/mypage/profile | 229:3295 |
| 신조어 제안하기 | /tabs/mypage/suggest | 229:3332, 229:3342 |
| 고객센터 | /tabs/mypage/support | 229:3352 |
| 알림설정 | /tabs/mypage/notifications | 229:3513 |
| 로그인 | /auth/login | 229:3201 |
| 이메일 로그인 | /auth/email-login | (Figma 미접근 — 기존 회원가입 화면 스타일 재사용) |
| 회원가입 | /auth/signup | 229:3251 |

---

## 🔨 미구현 화면 목록 (우선순위 순)

### ✅ Phase 1 — 검색 플로우 (완료: app/search/index.tsx)
Root Stack에 push 방식으로 올리는 단일 화면으로 구현 (탭바 없음, `router.push('/search')`).
6개 Figma 프레임을 별도 라우트로 나누지 않고, 입력 상태(query/submittedQuery)에 따라
같은 화면 안에서 뷰가 전환되는 방식으로 통합 — 빈 상태 → 자동완성 → 결과(단어/커뮤니티 탭 +
카테고리 필터) → 결과 없음. 구현 시점에 Figma Dev Mode MCP에 접근할 수 없어(데스크탑 앱 필요)
노드별 픽셀 스펙 대신 기존 사전/커뮤니티 화면의 검증된 스타일(리스트 아이템, 필터 칩, 뱃지)을
그대로 재사용함 — 추후 Figma 접근 가능 시 229:2696/2723/2750/2772/2794/2808과 대조해
세부 스펙(간격·타이포) 보정 권장.
아직 다른 화면(사전/카테고리)의 검색바에서 `/search`로 진입하는 연결은 되어 있지 않음 — 필요 시 추가.

### ✅ Phase 2 — 마이페이지 서브 화면 (완료: app/tabs/mypage/*)
mypage.tsx를 mypage/index.tsx + Stack(_layout.tsx)으로 전환하고 6개 서브 화면 추가.
- **저장한 단어 / 내 활동 게시물(좋아요 탭)**: 실제 동작하려면 세션 동안 유지되는 데이터가 필요해
  `constants/authStore.ts`에 `savedWords`/`likedPosts` 세션 상태를 확장(로그아웃 시 초기화).
  기존 완성 화면인 단어 상세(`dictionary/[id].tsx`)와 게시글 상세(`community/[id].tsx`)의
  저장·좋아요 버튼도 이 스토어에 연결해 마이페이지와 데이터가 실시간으로 동기화되도록 최소 범위로 수정.
- **내 활동 게시물 - 내가 쓴 글 / 댓글 단 글 탭**: 게시글 작성(`write.tsx`)이 실제로는 mock 데이터에
  저장되지 않고 Alert만 띄우는 구조라 "내가 쓴 글" 데이터 자체가 없음 — 가짜 데이터를 지어내는 대신
  정직하게 빈 상태(글쓰기/커뮤니티 CTA 포함)로 표시. 실제 글 작성 저장 로직이 생기면 연결 필요.
- **내 정보 관리**: 이미지 업로드 라이브러리(예: expo-image-picker)가 설치돼 있지 않아 실제 사진 업로드
  대신 앱 전반의 이모지 아바타 컨벤션에 맞춰 이모지 선택형 프로필 아이콘으로 구현.
- Figma Dev Mode MCP 미접근으로 Phase 1과 동일하게 기존 화면 스타일을 재사용 — 노드 스펙 대조 권장.

| 화면 | Figma 노드 | 경로 |
|---|---|---|
| 저장한 단어 | 229:3738 | /tabs/mypage/saved |
| 내 활동 게시물 | 229:3620~3679 | /tabs/mypage/my-posts |
| 내 정보 관리 | 229:3295 | /tabs/mypage/profile |
| 제안하기 | 229:3332, 229:3342 | /tabs/mypage/suggest |
| 고객센터 | 229:3352 | /tabs/mypage/support |
| 알림설정 | 229:3513 | /tabs/mypage/notifications |

### ✅ Phase 3 — 이메일 로그인 (완료: app/auth/email-login.tsx)
이메일+비밀번호 입력 폼과 비밀번호 찾기(재설정 메일 발송 mock) 플로우를 한 화면에서
`mode: 'login' | 'forgot'` 상태로 전환하며 구현. `auth/signup.tsx`의 `FormField` 컴포넌트/
검증 패턴을 그대로 재사용(공유 컴포넌트 파일은 없고 각 auth 화면이 자체 보유하는 기존 컨벤션을 따름).
로그인 성공 시 다른 화면들처럼 mock 유저로 `authStore.login()` 호출 후 `router.back()`.
`auth/login.tsx`의 "이메일로 로그인" 버튼이 기존엔 '준비 중' Alert만 띄웠는데, 이 화면으로
이동하도록 연결함.

### Phase 4 — 기능 완성
- ✅ (부분) 단어 저장 상태 — `authStore`에 세션 동안 유지 (Phase 2에서 구현). AsyncStorage로
  앱 재시작 후에도 유지되도록 하는 것은 아직 미구현.
- ✅ (부분) 게시글 좋아요 상태 — 위와 동일, 세션 동안만 유지.
- ✅ 홈 화면 오늘의 단어 로직 (날짜 기반 랜덤) — `app/tabs/index.tsx`의 `pickDaily`(제네릭,
  원래 이름 `pickDailyWords`에서 오늘의 실전 표현과 공유하도록 일반화),
  날짜 문자열을 시드로 결정적 난수 선택(같은 날엔 항상 같은 결과, 자정 지나면 갱신).
- ✅ 앱 아이콘 / 스플래시 스크린 커스텀 — `assets/icon.png`(호랭이 마스코트) +
  `app/_layout.tsx`의 커스텀 페이드 스플래시로 이미 구현되어 있었음(문서만 안 갱신됨).
- ✅ 알림(댓글·좋아요) 실제 백엔드 — `notifications` 테이블 + DB 트리거
  (`notify_on_comment`/`notify_on_like`, 자기 자신에게는 알림 안 감)로 실제 생성.
  `constants/notifications.ts`에서 조회/읽음 처리, 홈 배지·`app/notifications/index.tsx`
  둘 다 연결. `constants/mockNotifications.ts`는 삭제.
- ✅ 알림설정(`app/tabs/mypage/notifications.tsx`) 실제 백엔드 — 이전엔 토글이 로컬
  `useState`만 바꾸고 아무 데도 저장되지 않는 순수 UI 스텁이었음. `profiles.notification_prefs`
  jsonb 컬럼 추가 후 `notify_on_comment`/`notify_on_like` 트리거가 좋아요/댓글 알림 생성 전에
  수신자의 해당 설정을 확인하도록 수정(`authStore.fetchNotificationPrefs`/`updateNotificationPrefs`).
  단, newSlang/popularSlang/popularPost 3개는 그 알림 자체를 만드는 백엔드가 아직 없어 값만 저장됨.
- 새로운 신조어 mock 데이터 5개로 보강(`new-slang` 카테고리, `constants/mockWords.ts`) —
  실제 신조어 개수가 늘면 계속 추가 권장.
- ✅ 사전 단어 mock → 실제 백엔드 전환 — Supabase `words` 테이블은 이미 존재했지만(mockWords.ts를
  그대로 미러링, romanization 컬럼 누락 + 최신 3개 신조어 누락) 어떤 화면도 실제로 쓰지 않고
  있었음. 컬럼 추가 + 전체 31개 재동기화 후, `constants/words.ts`(`fetchWords`/`fetchWordById`)로
  홈/사전/카테고리/저장한 단어/검색 5개 화면 전부 실데이터로 전환. `constants/mockWords.ts` 삭제.
- ✅ 앱 언어 5개로 확장(한/영/일/베트남/스페인어) — `languageStore.ts` 전체 문자열 + 로컬
  `Record<Language>` 콘텐츠 블록 전부 번역, `constants/categories.ts`에 nameJa/nameVi/nameEs 추가.
- ✅ 게시글 저장(Bookmark) 완성 — 저장 버튼은 있었지만 저장한 글을 보여주는 화면이 없던 미완료
  기능. `my-posts.tsx`에 '저장' 탭 추가(단어 즐겨찾기와 동일하게 비로그인도 허용).
- ✅ 글쓰기 사진 첨부 버그 수정 — Supabase에 `post-images` 스토리지 버킷 자체가 없어 업로드가
  항상 실패했음. 버킷 생성 + RLS(공개 읽기, 본인 폴더 업로드/삭제) 추가.
- ✅ Freemium/프리미엄 구조 도입 — 안드로이드 앱스토어 출시 및 수익화를 위한 최소 범위 구현.
  `profiles.is_premium`/`streak_count`/`last_active_date` 컬럼 추가, `authStore.setPremiumStatus`/
  `isPremium`/`canSaveMoreWords`(무료 15개 저장 한도)/`getStreakCount`. 마이페이지 프리미엄
  업그레이드 행 + 스트릭 칩, `app/tabs/mypage/premium.tsx`(체험 시작/종료 토글 — 실결제 SDK 없이
  테스트 가능, 나중에 Stripe/Google Play 웹훅이 같은 `is_premium` 컬럼을 갱신하도록 교체 가능한
  구조), 홈 화면 "오늘의 실전 표현" 카드(상황별 표현 12개, ko/en만 — 사전 콘텐츠와 동일 컨벤션)
  + 비프리미엄 사용자에게만 보이는 티저, 사전 화면 상단 프리미엄 배너, 단어 저장 시 무료 한도
  도달하면 알림 후 차단(해제는 항상 허용). **알려진 보안 갭**: `profiles`의 기존 UPDATE RLS가
  본인 행 전체를 허용해서 로그인한 사용자가 클라이언트에서 직접 `is_premium`을 켤 수 있음 —
  테스트 목적상 의도적으로 남겨둔 것이며, 실제 결제 연동 전에 컬럼 단위 RLS 또는 트리거로
  서버(웹훅)만 쓸 수 있게 반드시 잠가야 함. 스킵한 항목(요청 목록 중 이번엔 구현 안 함): 푸시
  리마인더, 퀴즈/챌린지 엔진, 개인화 추천 엔진, 오프라인 사전 다운로드, "광고 없음"(광고 시스템
  자체가 없음), `community/[id].tsx` 변경(요청 기능 중 해당 화면에 구체적으로 매핑되는 게 없음).

**✅ 잠금은 2026-08-14부터 이미 존재** — 위 "알려진 보안 갭"은 migration
`20260814140000_split_private_account_settings.sql`이 닫았다: `is_premium`을 `profiles`에서
`account_settings`로 옮기면서 canonical 트리거 `account_settings_prevent_client_premium_write`
(함수 `prevent_client_premium_write`, SECURITY INVOKER + `SET search_path = public`)로
`is_premium` 변경을 `service_role`(결제 웹훅)에게만 허용. notification_prefs/
last_seen_reply_at/streak/phone/timezone 본인 행 UPDATE는 그대로 통과한다.
`premium.tsx`는 체험 토글 없는 안내 전용 화면이고 클라이언트 코드에 is_premium 쓰기
경로는 없다(읽기 전용).
2026-08-28에 이 canonical 잠금을 놓치고 중복 트리거(`block_client_premium_write`,
SECURITY DEFINER + mutable search_path)를 MCP로 production에 직접 적용했다 — repo에
migration 파일이 없는 provenance drift이며 보안 린트 WARN 3건의 원인이었다.
**중복 정리 완료** (2026-08-28, production version `20260828201350`):
`supabase/migrations/20260829000000_dedupe_premium_write_lock.sql`을 staging 검증
(롤백 트랜잭션 5개 체크 전부 PASS) 후 승인 받아 적용 — 중복 트리거/함수 제거, canonical
함수의 anon/authenticated EXECUTE revoke(REST `/rpc` 노출 차단, service_role은 유지).
premium 관련 보안 린트 WARN 3건 해소, 남은 WARN은 Leaked Password Protection(Pro 플랜
전용 — 무료 플랜에선 켤 수 없어 Pro 전환 전까지 WARN이 남는 게 정상, 출시 시 결정)뿐. 파일명 timestamp와 production version이 다른 것은 repo 전체의 기존 관행
(MCP 적용 시각이 version이 됨) — 파일 헤더 주석 참고.
- ✅ 고객센터 인앱 문의함 — 유저가 운영진에게 문의를 보내고 답변을 받는 흐름을 별도 헬프데스크
  SaaS 없이 구현(비용 $0, 기존 Supabase 프로젝트 안에서 해결). `support_tickets` 테이블
  (message/status/reply/replied_at) + RLS는 로그인 유저의 INSERT/SELECT만 허용하고 UPDATE
  정책은 아예 없음 — 운영진은 Supabase Studio에서 `service_role`로 직접 `reply`를 채우고
  RLS를 우회해 저장(별도 관리자 앱 불필요). 클라이언트가 API를 직접 호출해 자기 답변을 조작
  시도해도 UPDATE 정책이 없어 조용히 0행 처리됨(`is_premium`과 달리 이번엔 처음부터 갭 없이
  설계). `constants/support.ts`(`fetchMyTickets`/`submitTicket`), `app/tabs/mypage/support.tsx`
  에 문의 폼 + 내 문의 내역(답변 대기/답변 완료 pill) 추가 — 로그인 유저 전용이며, 비로그인은
  기존 `mailto:` 카드 그대로 폴백.
- ✅ 답변 도착 알림 — `notifications` 테이블(actor_id/post_id NOT NULL이라 운영진 답변엔
  안 맞음)을 재사용하지 않고, `constants/support.ts`에 `hasUnseenReply`/`markRepliesSeen` 추가.
  마이페이지 "고객센터" 행에 답변 미확인 시 빨간 점(`app/tabs/mypage/index.tsx`), 문의 화면
  진입 시 확인 처리.
  "마지막으로 확인한 시각"은 처음엔 기기 로컬(AsyncStorage)에 저장했다가, 여러 기기 동기화가
  필요해져서 `profiles.last_seen_reply_at` 컬럼(서버 저장)으로 바로 교체함 — `profiles`는
  이미 본인 행 UPDATE가 허용돼 있어(닉네임 수정 등에 쓰던 것과 동일 경로) 새 RLS 정책 없이
  그대로 재사용. `is_premium`처럼 클라이언트가 함부로 켜면 안 되는 민감한 값이 아니라서
  is_premium 전용 트리거로 막을 필요는 없음 — 저장 시각을 스스로 미래로 조작해도 자기
  배지가 일찍 사라지는 것 말고는 영향이 없는 값이라 위험이 없다고 판단.
- ✅ 단어 상세 영상 + 홈 썸네일 — 처음 제안된 스펙(별도 `/clip` 라우트, 네이티브에서 유튜브 앱으로
  자동 이탈)은 이미 있던 `words.video_url` + `WordVideo` 인앱 재생 파이프라인과 연결이 안 되고
  UX도 후퇴시켜서 채택하지 않음. 대신 `WordVideo`를 확장해 기존 자리(단어 상세 상단)에 그대로
  통합: `video_url`(보유 클립, 기존 동작 그대로) → `video_youtube_id`(제3자 유튜브, 웹은 iframe
  임베드/네이티브는 탭하면 유튜브로 이동) → `thumbnail_url`만 있는 정지 이미지 → 빈 상태 순으로
  폴백. 홈 히어로 카드·새로운 신조어 카드에도 같은 썸네일을 배경으로 표시(`app/tabs/index.tsx`).
  `words` 테이블에 `video_youtube_id`/`video_start_sec`/`video_end_sec`/`thumbnail_url` 컬럼
  추가, 파싱은 `constants/youtube.ts`(`extractYoutubeId`/`parseTimeToSeconds`/`youtubeThumbnailUrl`).
  **저작권/초상권 판단**: 자체 캡처 이미지를 우리 서버에 올리는 대신 유튜브 공식 썸네일 CDN
  (`img.youtube.com/vi/{id}/hqdefault.jpg`)을 그대로 참조 — 복제본을 만들지 않아 iframe 임베드와
  같은 성격(유튜브 자체 서버에서 서빙)이라 자체 호스팅보다 노출이 적음. 영상이 없는 신조어만
  운영자가 직접 캡처해 `word-thumbnails` 버킷(공개 읽기, client insert 정책 없음 — Supabase
  Studio에서 운영진이 직접 업로드)에 올리는 예외 경로로 남김 — 이 경우는 실제 복제라 별개 위험.
  **정책**: 단어 상세 영상/썸네일은 프리미엄 유료벽 뒤에 두지 않음(유튜브 임베드는 애초에
  유료화 불가 — TOS 위반 소지).

## 개발 컨벤션

### 파일 규칙
- 신규 서브 화면은 해당 탭 디렉터리 안 Stack에 추가
- 예: 마이페이지 서브 화면 → `app/tabs/mypage/[screen].tsx`
- 색상은 반드시 `Colors` 상수, 하드코딩 금지

### 패키지 설치
```bash
npm install --legacy-peer-deps [패키지명]
```

### 타입 검사 (푸시 전 반드시 통과)
```bash
npx tsc --noEmit --skipLibCheck
```

### 라우팅
```typescript
router.push('/tabs/dictionary/1')     // 단어 상세
router.push('/tabs/mypage/saved')     // 저장한 단어
router.push('/auth/email-login')      // 이메일 로그인
router.push('/search')                // 검색
```

### 단어 데이터
- `constants/words.ts` — Supabase `words` 테이블 실데이터 접근 계층(`fetchWords`/`fetchWordById`).
  단어 추가/수정은 Supabase 대시보드에서 직접(word_suggestions 검토 후 반영도 동일).
- `constants/mockPosts.ts` — 게시글 (Post 타입, 아직 mock)

### 인증 스토어
```typescript
import { authStore } from '@/constants/authStore';
authStore.isLoggedIn()             // boolean
authStore.getUser()                // { name, email, emoji } | null
authStore.login(user)
authStore.logout()                 // savedWords/likedPosts도 함께 초기화됨
authStore.updateUser(patch)        // 닉네임/이메일/이모지 부분 수정
authStore.subscribe(fn)            // 로그인 상태 변경 구독, cleanup 함수 반환

// 저장한 단어 / 좋아요 한 게시글 (세션 동안만 유지, 로그아웃 시 초기화)
authStore.isWordSaved(id) / toggleWordSaved(id) / getSavedWordIds()
authStore.isPostLiked(id) / togglePostLiked(id) / getLikedPostIds()
authStore.subscribeBookmarks(fn)   // 위 4개 토글 변경 구독, cleanup 함수 반환
```

### 마이페이지 패턴 (useFocusEffect + subscribe 이중 동기화)
```typescript
const [loggedIn, setLoggedIn] = useState(authStore.isLoggedIn());
useFocusEffect(useCallback(() => { setLoggedIn(authStore.isLoggedIn()); }, []));
useEffect(() => { const unsub = authStore.subscribe(setLoggedIn); return () => unsub(); }, []);
```

---

## Figma 접근 방법

Figma MCP가 연결되어 있으면:
```typescript
// 특정 화면 구조 파악
get_metadata(fileKey: 'RbDWZdCLT0xXbH0ZW25jPi', nodeId: '229:3738')
```

Dev Mode MCP (Figma 데스크탑 앱 필요):
```typescript
get_design_context(fileKey: 'RbDWZdCLT0xXbH0ZW25jPi', nodeId: '229:3738')
```

**주요 미구현 화면 Figma 노드 ID**
```
검색 빈 화면:     229:2696
검색 입력 중:     229:2723
검색 결과:        229:2750
저장한 단어:      229:3738
내 정보 관리:     229:3295
제안하기:         229:3332
고객센터:         229:3352
알림설정:         229:3513
내 활동 게시물:   229:3620
```

---

## 현재 앱 실행 순서

1. `npm install --legacy-peer-deps`
2. `npx expo start`
3. Expo Go 앱으로 QR 스캔 또는 iOS 시뮬레이터

---

## 주의사항

- `create-expo-app`은 자체 `.git`을 초기화하므로 새 스캐폴딩 시 `.git` 제거 후 복사
- GitHub API 한글 설명은 영어로 작성 (JSON 인코딩 이슈)
- `backgroundColor` prop은 Expo StatusBar에 없음 → style 속성만 사용
- `useFocusEffect` callback에서 cleanup 함수 반환 시 타입 에러 → `useEffect` + subscribe로 처리

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
