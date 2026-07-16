# 속닥 디자인 가이드 (컴포넌트 라이브러리)

**출처**: [Figma — 속닥 Sokdak](https://www.figma.com/design/NF716dQONfz0eDisYWPiTs/%EC%86%8D%EB%8B%A5-Sokdak?node-id=735-4626) (node `735:4626`, "Component" 프레임, 파일키 `NF716dQONfz0eDisYWPiTs`)

이 문서는 위 Figma 노드에 있는 재사용 컴포넌트 라이브러리(디자인 시스템)를 코드 작업 시 참고하기 위한 인덱스입니다. `get_metadata`로 전체 구조를 확보해서 아래 표에 실제 컴포넌트명·노드ID를 그대로 정리했습니다 — 화면을 만들거나 다듬을 때 해당 컴포넌트를 찾아 노드ID로 바로 `get_design_context`/`get_screenshot`을 호출해 정확한 색상·간격·타이포를 뽑아 쓰면 됩니다.

## 전역 스페이싱 규칙 (디자인 시스템 참고 섹션, node `619:3012`에 텍스트로 명시)

> 좌우 여백: **24px** · 제목과 컨텐츠 사이: **16px** (단어카드만 예외 **8px**) · 컨텐츠 간 간격: **32px** · 아이콘: **24×24** · radius: **10**

기존 화면들의 `paddingHorizontal: 24`, `borderRadius`류 값이 대체로 이 규칙과 일치합니다 — 새 화면도 이 기준을 기본값으로 삼을 것.

## 최상위 섹션 & 컴포넌트 전체 목록

### Navigation (`689:3783`)
| 컴포넌트 | 노드ID | 비고 |
|---|---|---|
| `Navigation/TopAppBar/Back` | `677:2916` | 서브 화면 공통 헤더 — 이미 대부분의 화면이 이 패턴 사용 |
| `Navigation/TopAppBar/Dictionary` | `682:3633` | |
| `Navigation/TopAppBar/Default/Default` | `645:3307` | |
| `Navigation/TopAppBar/Home` — state=default | `626:3288` | **2가지 상태 존재** |
| `Navigation/TopAppBar/Home` — state=search | `1288:16927` | 검색 아이콘 탭 시 인풋으로 전환되는 상태로 추정. 현재 `app/tabs/index.tsx` 홈 헤더에 이 두 상태가 반영돼 있는지 확인 필요 |
| `Navigation/TopAppBar/Write` — 작성 전/완료 | `724:4219` / `705:3889` | 글쓰기 모달 헤더 |
| `Navigation/TopAppBar/Write with Title` — 작성 전/완료 | `724:4247` / `724:3910` | |
| `Navigation/TopAppBar/Post : 다른 사람 게시물` | `710:4873` | 커뮤니티 게시글 상세 헤더(타인 글 — 드롭다운 있음) |
| `Navigation/TopAppBar/Post : 내 게시물` | `736:6169` | 커뮤니티 게시글 상세 헤더(내 글 — 수정/삭제 드롭다운) |
| `Navigation/BottomBar` (5 상태: 홈/단어/카테고리/커뮤니티/마이페이지) | `932:33890` | `app/tabs/_layout.tsx`에 이미 구현됨 |

### Selection — Chip & Card (`683:3780`)
| 컴포넌트 | 노드ID | 비고 |
|---|---|---|
| `Selection/Chip/고객센터` (7색: black/red/orange/yellow/green/Selection/white) | `727:4454` | 범용 칩 컬러 팔레트 — `Colors.ts`에 없는 색이면 추가 검토 |
| `Selection/Chip/Search/Removable` | `677:3069` | 검색 최근검색어 칩(X 삭제 가능) — `app/search/index.tsx`, `app/tabs/category/search.tsx` 최근검색과 비교 대상 |
| `Selection/Chip/Category Filter` (10개 카테고리 × Default/click) | `773:3977` | 필터 바텀시트 등에서 사용 |
| `Selection/Chip/카테고리 취소` | `816:5194` | |
| `Selection/Chip/Search_Recommend` (11개 추천어 칩) | `863:6587` | 검색 추천 카테고리와 유사 — `category/search.tsx`의 추천 칩과 비교 |
| `Selection/Chip/ㄱㄴㄷ순` (click/default) | `1017:17140` | 정렬 칩 |
| `Selection/Chip/Dictionary/Combined` | `683:3679` | **이미 구현됨** — 단어 상세 멀티 카테고리 탭(`dictionary/[id].tsx`) |
| `Selection/Card/Category Base` (dark/light) | `648:2913` | |
| `Selection/Card/Category` (10개 카테고리 각각) | `907:7870` | **이미 구현됨** — `app/tabs/category/index.tsx` 그리드 카드와 비교 필요 (#17 작업 시) |
| `Selection/Tab/01`, `Selection/Tab/02`(게시물/댓글/좋아요) | `732:3361` | 마이페이지 활동 탭과 비교 대상 (`my-posts.tsx`) |

### Card (`683:3779`)
| 컴포넌트 | 노드ID | 비고 |
|---|---|---|
| `Card/Word` (light/dark) | `648:2923` | |
| `Card/Recommend` (light/dark + state3~6, 총 6 variant) | `637:3565` | 홈 화면 추천 카드로 추정 |
| `Card/Post/Preview` | `699:3608` | 커뮤니티 카드 |
| `Card/Recommend2`, `Card/Recommend2_dark` (Default/Variant2/Variant3) | `1026:14795` 하위 | Recommend와 별개의 변형 세트 — 어디에 쓰이는지 확인 필요 |

### Callout Card (`683:3778`)
| 컴포넌트 | 노드ID |
|---|---|
| `Callout Card/No Result` | `677:2930` |
| `Callout Card/내 활동_짹이ver` | `723:3486` |
| `Callout Card/내 활동_호랭ver` | `723:3473` |
| `Callout Card/Recommend_호랭` | `645:3539` |
| `Callout Card/Recommend_짹이` | `810:4738` |
| `Callout Card/Bubble_호랭` | `645:3513` |
| `Callout Card/Bubble_짹이` | `810:4706` |

→ `app/tabs/category/index.tsx`의 `recommendCard`("이번 주 인기 카테고리")가 이 계열과 대응되는지 확인 대상.

### Character (`647:2833`)
| 컴포넌트 | 노드ID |
|---|---|
| `Character/호랭/클로즈업` | `647:2832` |
| `Character/호랭/Default` | `645:3556` |
| `Character/호랭/Profile` | `683:3208` |
| `Character/짹이/Default` | `647:2829` |
| `Character/짹이/흐린 버전` | `677:2924` |
| `Character/짹이/Profile` | `683:3209` |

→ 실물 SVG는 이미 `assets/`에 있음(`첫페이지_짹이.svg`, `첫페이지_호랭이.svg`, `짹이_물음표.svg`, `icon.svg`), `components/icons/JjaekiQuestion.tsx`로 인라인 완료. "Profile"/"흐린 버전" variant는 아직 코드에 없음 — 프로필 아바타 등에 필요해지면 추출 대상.

### Controls — Buttons/Switches (`683:3777`)
| 컴포넌트 | 노드ID |
|---|---|
| `Controls/Switches` (off/on) | `727:4330` |
| `Controls/Buttons/Text Button_01` (Default/Click) | `1085:16521` |
| `Controls/Buttons/Text Button_02` (Default/Pressed) | `1085:16512` |
| `Controls/Buttons/Ghost` | `1085:16536` |

→ `components/Toggle.tsx`가 `Controls/Switches`를 이미 반영(다크 트랙+화이트 놉). Text Button 01/02/Ghost는 버튼 스타일 통일 작업 시 참고.

### Control — Icons (`683:3775`)
24×24 또는 44×44 아이콘 다수. 주요 목록: Cancel, Sound, Star, write, save, Back, Under, right, up, Picture, Icon, Share, Menu, Icon Group, Search, Heart, Notification(badge off/on) `624:3249`, Home, Community, Word, Category, MyPage, Book.

→ `Controls/Icon/Home·Word·Category·Community·MyPage`가 `components/icons/TabIcon.tsx`와 대응 — 최근 추출한 `BottomBar.svg` 기반 아이콘과 일치하는지 1회 대조 권장.

### icon (`626:3294`) — 소형(24×24) 아이콘 세트
Alarm, Voice Search, search, Star(unlike/like/unlike_2), Mike, Filter, back, under, right, up, Sound, light(사용 X), Messeage, Eye, picture, Share, Menu, Trash, Stop, Pencil, Siren, Heart(click/default) `785:4237`, Check, Focus `810:3441`, Cancel, Emoji, Home/Community/Category/Word/MyPage(default), Trashcan.

→ `components/icons/FocusIcon.tsx`, `PlayIcon.tsx`가 이 세트 일부(`Icon/Focus` 등)와 대응됨.

### Display (`732:3362`)
| 컴포넌트 | 노드ID | 비고 |
|---|---|---|
| `Display/Chip_단어 카테고리` (10개 카테고리 배지) | `871:6735` | `getReadableTextColor` 로직으로 이미 구현한 멀티 카테고리 배지와 비교 |
| `Display/게시판 종류` (7색) | `629:2868` | |
| `Display/Community/Post_게시판 종류` (7색) | `735:3429` | `constants/mockPosts.ts`의 `BOARD_COLORS`와 대조 |
| `Display/Community/게시판 종류` (3색: black/white/color7) | `705:3768` | |
| `Display/UserProfile` | `715:5124` | 마이페이지 프로필 행과 비교 |
| `Display/Account` | `715:5389` | |
| `Display/Text`, `Section Header`, `List Header`, `Meta`, `UserInfo` | 각각 | 리스트/섹션 공통 타이포 요소 |

### Feedback (`732:3363`)
| 컴포넌트 | 노드ID |
|---|---|
| `Feedback/Accordion` (close/open) | `736:5225` |

→ `app/tabs/mypage/support.tsx`의 FAQ 아코디언과 비교 대상.

### Filter (`689:3781`)
정렬/카테고리 필터 바텀시트 세트: `Filter/Sort/Bar`, `Filter/Combined/Bar`, `Controls/Dropdown`(인기순/최신순/ㄱㄴㄷ순), `Filter/Category/Trigger`, `Filter/Category/Bottom sheet/Default·일상 선택·일상&초성 선택`.

→ `app/tabs/dictionary/index.tsx`의 정렬 UI, `app/search/index.tsx`의 카테고리 필터와 비교 대상. 검색 화면(#22) 마무리 시 우선 확인.

### Form (`734:3370`)
`Form/Panel`, `Form/Profile`, `Form/Panel_접수 후` — 신조어 제안하기(`suggest.tsx`) 폼과 비교 대상.

### TextField (`732:3360`)
`Controls/Text Field/Title`, `Title_02`(제목 입력 전/후), `Context`, `Comment`, `Comment/대댓글 O·X`, `Community_Post` — 글쓰기(`community/write.tsx`), 댓글 입력과 비교 대상.

### List (`732:3364`)
`List/Item/Post`(picture on/off), `List/Item/Word`, `List/Item/Community_Post`(picture×heart×댓글 조합 다수), `List/Item/언어 설정`, `List/Item/시간대`, `List/Switch_01·02·03`, `List/Item/Log up`.

→ 사전 목록·커뮤니티 목록의 리스트 아이템과 비교 대상. "홈화면, 커뮤니티에서 사용되는 리스트" / "내 활동에서 사용되는 리스트"라는 주석이 원본에 달려 있어 용도가 명확히 구분됨.

### Bars (`683:3776`)
`Bars` state=입력 전/입력 후 — 검색 입력 바 진행 상태로 추정. 세부 미확인.

### line (`732:3359`)
`Line/01` — 단일 디바이더. `Colors.divider` (#EDE9E0)와 일치하는지 확인 권장.

### System / iOS (`689:3782`)
`System/iOS/Status Bar`, `Keyboard(KR)`, `HomeIndicator` — 순수 iOS 시스템 UI 목업(직접 구현 대상 아님, SafeAreaView가 대신 처리).

### 사용 금지 섹션
- **"사용 X (컴포넌트 속 컴포넌트)"** (`785:3708`): 컴포넌트 속성 편집용 원본. 여기서 인스턴스를 직접 복제하지 말 것.
- **"디자인 시스템 참고"** (`619:2998`): 무드보드/레퍼런스 이미지 모음 + 위 스페이싱 규칙 텍스트. 구현 대상이 아니라 참고용.

## 코드에 이미 반영된 부분

| Figma 컴포넌트 | 코드 위치 |
|---|---|
| Text (타이포) | `constants/Typography.ts` |
| 색상 토큰 | `constants/Colors.ts` |
| Character | `assets/characters/`, `components/icons/JjaekiQuestion.tsx` |
| Controls/Icon/Home·Word·Category·Community·MyPage | `components/icons/TabIcon.tsx` |
| Navigation/BottomBar | `app/tabs/_layout.tsx` |
| Controls/Switches | `components/Toggle.tsx` |
| Controls/Icon/Focus, Play류 | `components/icons/FocusIcon.tsx`, `PlayIcon.tsx` |
| Selection/Chip/Dictionary/Combined | `app/tabs/dictionary/[id].tsx` |
| Selection/Card/Category (부분) | `app/tabs/category/index.tsx` (정밀 대조 필요 — #17) |
| Navigation/TopAppBar/Back 계열 | `app/tabs/mypage/*.tsx` 등 서브 화면 공통 헤더 |

## 다음에 확인이 필요한 것 (우선순위)

1. **`Navigation/TopAppBar/Home` (`626:3288` default / `1288:16927` search 상태)** — 홈 헤더에 검색 아이콘 탭 시 인풋으로 바뀌는 두 번째 상태가 있는지, 워드마크 로고가 텍스트("SOK-DAK")가 아니라 별도 로고 그래픽인지 확인
2. **`Selection/Card/Category` (`907:7870`)** — 카테고리 그리드(#17 미완료 작업) 정밀 대조 시 1순위
3. **`Filter/*` 일체** — 검색 6-state(#22) 마무리 시 정렬/필터 바텀시트 스펙 확인
4. **`List/Item/Word`, `List/Item/Post`, `List/Item/Community_Post`** — 사전 목록, 커뮤니티 목록(#19) 리빌드 시 확인
5. **`Display/Chip_단어 카테고리` (`871:6735`)** — 현재 멀티 카테고리 배지 구현과 색상 대조

각 항목은 `get_design_context(fileKey: 'NF716dQONfz0eDisYWPiTs', nodeId: '<위 노드ID>')`로 바로 열어볼 수 있습니다. Figma MCP가 Starter 플랜 요청 한도에 자주 걸리므로, 한 번에 여러 노드를 몰아서 열기보다 화면 작업 직전에 필요한 것만 1~2개씩 호출하는 편이 안전합니다.
