# SOK-DAK (속닥) — Claude Code 인수인계 문서

## 프로젝트 개요
한국어 신조어 특화 모바일 학습 앱. 한국에 거주하는 외국인 중·고급 학습자 타깃.
교과서에 없는 진짜 한국어(신조어·유행어)를 배울 수 있는 플랫폼.

- **저장소**: https://github.com/saruhome/sokdak
- **스택**: Expo SDK + React Native + TypeScript + Expo Router (파일 기반 라우팅)
- **디자인 소스**: Figma — RbDWZdCLT0xXbH0ZW25jPi
- **기기 기준**: iPhone 13 mini (375×812) — Status Bar 44px / TopAppBar 44px / BottomBar 49px

---

## 로컬 실행

```bash
npm install
npx expo start        # Expo Go 앱으로 QR 스캔
npx expo start --ios  # iOS 시뮬레이터
```

---

## 파일 구조

```
app/
  _layout.tsx                  # 루트 Stack (tabs + auth)
  auth/
    _layout.tsx                # 탭바 없는 전체화면 Stack
    login.tsx                  # 로그인 (소셜 3종 + 캐릭터)
    signup.tsx                 # 회원가입 (닉네임·이메일·PW·약관)
  tabs/
    _layout.tsx                # 5탭 BottomBar
    index.tsx                  # 홈
    mypage.tsx                 # 마이페이지 (로그인 전/후 분기)
    dictionary/
      _layout.tsx
      index.tsx                # 단어 목록 (검색·정렬·추천 카드)
      [id].tsx                 # 단어 상세
    category/
      _layout.tsx
      index.tsx                # 카테고리 그리드 (10종 2열)
      [slug].tsx               # 카테고리 상세 (단어 목록)
    community/
      _layout.tsx              # write는 bottom modal
      index.tsx                # 게시글 목록 (화제 스크롤 + FAB)
      [id].tsx                 # 게시글 상세 + 댓글 + 대댓글
      write.tsx                # 글쓰기 폼

constants/
  Colors.ts                    # 디자인 토큰
  categories.ts                # 10개 카테고리 마스터
  mockWords.ts                 # 단어 mock 27개
  mockPosts.ts                 # 게시글 mock 8개
  authStore.ts                 # 세션 인증 스토어
```

---

## 디자인 토큰 (Colors.ts)

```
background:       #F6F2EA  (크림 배경)
navBar:           #52514E  (다크 올리브 — 탭바·버튼)
navBarIconActive: #F6F2EA
navBarIconMuted:  #948E84
textPrimary:      #1E1D1A
textSecondary:    #6B6760
textTertiary:     #9E9A94
surface:          #FFFFFF
border:           #E5E1D8
divider:          #EDE9E0
accent:           #3A6B4A  (초록 강조)
error:            #C04A3A
```

---

## 네비게이션 구조

```
Root Stack
├── tabs/           ← 탭바 항상 표시
│   ├── index               (홈)
│   ├── dictionary/[id]     (단어 상세)
│   ├── category/[slug]     (카테고리 상세)
│   ├── community/[id]      (게시글 상세)
│   ├── community/write     (글쓰기 modal)
│   └── mypage
└── auth/           ← 탭바 없음
    ├── login
    └── signup
```

---

## 인증 스토어 (authStore.ts)

```typescript
authStore.isLoggedIn()    // boolean
authStore.getUser()       // { name, email, emoji } | null
authStore.login(user)     // 로그인
authStore.logout()        // 로그아웃
authStore.subscribe(fn)   // 구독 (cleanup 반환)
```

마이페이지: `useFocusEffect` + `subscribe` 이중 동기화

---

## 구현 완료 화면 (11개)

| 화면 | 경로 |
|---|---|
| 홈 | /tabs/ |
| 단어 목록 | /tabs/dictionary/ |
| 단어 상세 | /tabs/dictionary/[id] |
| 카테고리 그리드 | /tabs/category/ |
| 카테고리 상세 | /tabs/category/[slug] |
| 커뮤니티 목록 | /tabs/community/ |
| 게시글 상세 | /tabs/community/[id] |
| 글쓰기 | /tabs/community/write |
| 마이페이지 | /tabs/mypage |
| 로그인 | /auth/login |
| 회원가입 | /auth/signup |

---

## 다음 작업 후보

- [ ] 이메일 로그인 화면 (auth/email-login.tsx)
- [ ] 단어 저장 기능 (마이페이지 저장한 단어)
- [ ] 검색 플로우 고도화 (Figma: iPhone 13 mini - 9~11)
- [ ] 단어 제안하기 (Figma: 5-3 제안하기)
- [ ] 내 정보 관리 (Figma: 5-2 내 정보 관리)
- [ ] 홈 화면 고도화
- [ ] 앱 아이콘 / 스플래시 커스텀
- [ ] 다국어 지원 (i18n)
- [ ] 실제 API 연동

---

## 개발 컨벤션

- 색상: 반드시 `Colors` 상수 사용 (하드코딩 금지)
- 라우팅: `router.push('/tabs/dictionary/1')` 절대 경로
- 패키지: `npm install --legacy-peer-deps`
- 타입 검사: `npx tsc --noEmit --skipLibCheck`
- mock 데이터: `constants/mock*.ts` 집중 관리

---

## Figma 참조

- 파일키: `RbDWZdCLT0xXbH0ZW25jPi`
- 모바일 규격: 375×812 (iPhone 13 mini)
- 주요 Figma 컴포넌트:
  - Navigation/BottomBar (375×49)
  - Navigation/TopAppBar/Dictionary (375×44)
  - List/Item/Word (327×80)
  - List/Item/Post (327×92)
  - Selection/Card/Category (158×104)
  - Controls/Buttons/Text Button_02 (320×52)
