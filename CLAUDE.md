# SOK-DAK (속닥) — Claude Code 전체 구현 가이드

## 프로젝트 개요
한국어 신조어 특화 모바일 학습 앱. 한국 거주 외국인 중·고급 학습자 타깃.
- **저장소**: https://github.com/saruhome/sokdak (private)
- **스택**: Expo SDK + React Native + TypeScript + Expo Router v3
- **디자인**: Figma `RbDWZdCLT0xXbH0ZW25jPi` (node `229:1651`)
- **기기 기준**: iPhone 13 mini 375×812 (Status Bar 44 / TopAppBar 44 / BottomBar 49)

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
    signup.tsx         # ✅ 회원가입 폼
  tabs/
    _layout.tsx        # ✅ 5탭 BottomBar (#52514E, 49px)
    index.tsx          # ✅ 홈
    mypage.tsx         # ✅ 마이페이지 (로그인 전/후 분기)
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
│       ├── saved        저장한 단어 ← 미구현
│       ├── my-posts     내 활동 게시물 ← 미구현
│       ├── profile      내 정보 관리 ← 미구현
│       ├── suggest      제안하기 ← 미구현
│       ├── support      고객센터 ← 미구현
│       └── notifications 알림설정 ← 미구현
├── auth/                ← 탭바 없음
│   ├── login            소셜 로그인
│   ├── email-login      이메일 로그인 ← 미구현
│   └── signup           회원가입
└── search               전체 검색 ← 미구현
    (app/search/ 또는 app/tabs/search/)
```

---

## ✅ 구현 완료 화면 (11개)

| 화면 | 경로 | Figma 프레임 |
|---|---|---|
| 홈 | /tabs/ | 229:3706 |
| 단어 목록 | /tabs/dictionary/ | 229:2824 |
| 단어 상세 | /tabs/dictionary/[id] | 229:11206 |
| 카테고리 그리드 | /tabs/category/ | 229:2528 |
| 카테고리 상세 | /tabs/category/[slug] | 229:11360 (K-POP 예시) |
| 커뮤니티 목록 | /tabs/community/ | 229:3383 |
| 게시글 상세 | /tabs/community/[id] | 229:3482 |
| 글쓰기 | /tabs/community/write | 229:3319 |
| 마이페이지 | /tabs/mypage | 229:3149, 229:3175 |
| 로그인 | /auth/login | 229:3201 |
| 회원가입 | /auth/signup | 229:3251 |

---

## 🔨 미구현 화면 목록 (우선순위 순)

### Phase 1 — 검색 플로우 (app/search/ 디렉터리)
탭바 안에 검색 탭을 추가하거나 Root Stack에 modal로 올리는 방식 중 선택.
Figma에서는 사전/카테고리 화면의 검색바를 탭했을 때 전체화면 검색으로 진입하는 플로우.

| 화면 | Figma 노드 | 설명 |
|---|---|---|
| 검색 - 빈 상태 | 229:2696 (iPhone 13 mini - 9) | 검색바 포커스, 최근 검색어, 인기 검색어 |
| 검색 - 입력 중 | 229:2723 (iPhone 13 mini - 32) | 자동완성 제안 리스트 |
| 검색 - 결과 (단어) | 229:2750 (iPhone 13 mini - 33) | 단어 검색 결과 리스트 |
| 검색 - 결과 (필터 적용) | 229:2772 (iPhone 13 mini - 30) | 카테고리 필터 적용된 결과 |
| 검색 - 단어 없음 | 229:2794 (iPhone 13 mini - 10) | 결과 없음 상태 |
| 검색 - 커뮤니티 결과 | 229:2808 (iPhone 13 mini - 11) | 게시글 검색 결과 |

### Phase 2 — 마이페이지 서브 화면 (app/tabs/mypage/ 디렉터리로 전환)
mypage.tsx를 mypage/index.tsx로 변경하고 Stack 추가.

| 화면 | Figma 노드 | 설명 |
|---|---|---|
| 저장한 단어 | 229:3738 | 북마크된 단어 목록, 삭제 가능 |
| 내 활동 게시물 | 229:3620~3679 | 내가 쓴 글 / 댓글 단 글 / 좋아요 한 글 3탭 |
| 내 정보 관리 | 229:3295 | 닉네임·이메일·프로필 이미지 수정 |
| 제안하기 | 229:3332, 229:3342 | 신조어 제안 폼 (입력 전/후) |
| 고객센터 | 229:3352 | FAQ 아코디언 + 문의하기 |
| 알림설정 | 229:3513 | 알림 토글 목록 |

### Phase 3 — 이메일 로그인 (auth/email-login.tsx)
| 화면 | 설명 |
|---|---|
| 이메일 로그인 | 이메일+비밀번호 입력, 비밀번호 찾기 링크 |

### Phase 4 — 기능 완성
- 단어 저장 상태 지속 (AsyncStorage 또는 authStore 확장)
- 게시글 좋아요 상태 지속
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
authStore.isLoggedIn()       // boolean
authStore.getUser()          // { name, email, emoji } | null
authStore.login(user)
authStore.logout()
authStore.subscribe(fn)      // cleanup 함수 반환
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
