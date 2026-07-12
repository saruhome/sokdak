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
  mockWords.ts         # ✅ 단어 27개 mock
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
| muhandoejeon | #1A73E8 |
| outdated-slang | #8B7355 |

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
- 홈 화면 오늘의 단어 로직 (날짜 기반 랜덤)
- 앱 아이콘 / 스플래시 스크린 커스텀

---

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

### mock 데이터 위치
- `constants/mockWords.ts` — 단어 (Word 타입)
- `constants/mockPosts.ts` — 게시글 (Post 타입)
- 새 mock 데이터는 이 파일들에 추가

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
