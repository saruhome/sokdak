# 속닥 디자인 가이드 (컴포넌트 라이브러리)

**출처**: [Figma — 속닥 Sokdak](https://www.figma.com/design/NF716dQONfz0eDisYWPiTs/%EC%86%8D%EB%8B%A5-Sokdak?node-id=735-4626) (node `735:4626`, "Component" 프레임)

이 문서는 위 Figma 노드에 있는 재사용 컴포넌트 라이브러리(디자인 시스템)를 코드 작업 시 참고하기 위한 인덱스입니다. **전체 스펙을 1:1로 옮겨 적은 문서가 아니라**, 어떤 컴포넌트 카테고리가 존재하는지 정리한 목차 + 이미 코드에 반영된 부분에 대한 매핑입니다. 실제 화면을 새로 만들거나 다듬을 때는 아래 인덱스에서 관련 섹션을 찾은 뒤, Figma에서 해당 서브프레임을 직접 열어 정확한 색상/간격/타이포를 추출해서 반영하세요 (`get_screenshot` / `get_design_context`, 또는 Figma 웹에서 레이어 검색).

> **접근 제약 메모**: 이 문서를 작성한 시점 기준, Figma Dev Mode MCP가 요청 한도(Starter 플랜)에 도달해 있었고, 브라우저로 직접 캔버스를 조작(줌/스크롤/키보드 단축키)하는 것도 이 세션 환경에서 불안정했습니다. 그래서 아래 "확인됨" 섹션은 실제 화면 캡처로 검증한 내용이고, "섹션 목록"은 최초 전체보기(7% 줌)에서 라벨만 읽어낸 목록이라 각 섹션 내부 스펙은 아직 미검증 상태입니다. 새 화면을 이 섹션들과 대조할 때는 그 섹션을 다시 열어 확인이 필요합니다.

## 컴포넌트 라이브러리 최상위 섹션 목록

노드 `735:4626` 하위에 존재하는 것으로 확인된 섹션들 (Figma 프레임 라벨 기준):

- **Navigation** — 상단바(TopAppBar) 변형들
- **Selection** — Chip & Card (칩, 탭, 카드)
- **Bars** — 진행바/탭바류로 추정
- **Callout Card** — 홈 화면 추천 카드류 (`recommendCard` 패턴과 연관 추정)
- **Card** — 범용 카드 컴포넌트
- **Controls** — 버튼/토글/입력 등 인터랙션 컨트롤
- **Character** — 짹이/호랭 캐릭터 슬롯 (SVG 원본은 이미 `assets/`에 있음: `첫페이지_짹이.svg`, `첫페이지_호랭이.svg`, `짹이_물음표.svg`, `icon.svg`)
- **Display** — 배지/라벨/상태 표시
- **Text** — 타이포그래피 스타일 (Sok-Dak Font 변수 컬렉션 — `constants/Typography.ts`와 연관)
- **Form** — 입력 폼 필드
- **System** — 시스템/아이콘 그리드로 추정
- **Icon** — 아이콘 세트
- **Line** — 구분선/디바이더

두 개의 안내 프레임도 함께 있음: "디자인 시스템 참고"(참고용), "사용 X (컴포넌트 속성...)"(사용 금지 — 컴포넌트 속성 편집용 원본이니 인스턴스를 직접 복제하지 말라는 의미로 추정).

## 확인된 컴포넌트 스펙

### Navigation (TopAppBar 4종)

| 변형 | 구성 | 비고 |
|---|---|---|
| `Navigation/TopAppBar/Dictionary` | `‹ back` + 중앙 타이틀("word") + ★ 아이콘 우측 | 사전 상세류 화면에서 저장 버튼 자리로 추정 |
| `Navigation/TopAppBar/Back` | `‹ back` + 중앙 타이틀만 | 서브 화면 공통 헤더 — 지금 대부분의 `mypage/*` 서브 화면이 이미 이 패턴 사용 중 |
| `Navigation/TopAppBar/Default/Default` | 타이틀 + 🔔(알림) 우측, 뒤로가기 없음 | 탭 최상위 화면용으로 추정 |
| `Navigation/TopAppBar/Home` | **"SokDak" 워드마크 로고** + 🔍(검색) + 🔔(알림) | 홈 화면 헤더 — 현재 `app/tabs/index.tsx` 헤더와 대조 필요. 워드마크가 텍스트 "SOK-DAK"이 아니라 로고 스타일("SokDak")로 그려져 있음 — 확인 후 반영 권장 |

### Selection (Chip & Card)

- `Selection/Chip/고객센터`: 알약형 칩 6개, 서로 다른 배경색(중립/다크/버건디/레드/옐로우/그린 계열) — 카테고리별 칩 컬러 팔레트로 추정, `constants/categories.ts`의 `colorBg` 값들과 대조 필요
- `Selection/Chip/Dictionary/Combined`: "K-POP" 텍스트 탭 2개 나란히 (액티브/비액티브 상태로 추정) — 단어 상세의 멀티 카테고리 탭과 연관
- `Card` 컴포넌트: 재생 아이콘이 있는 체커보드(투명) 배경 카드 — `components/WordVideo.tsx`의 비디오 플레이스홀더와 유사한 패턴으로 이미 구현되어 있음

## 코드에 이미 반영된 부분

| Figma 섹션 | 코드 위치 |
|---|---|
| Text (타이포) | `constants/Typography.ts` |
| 색상 토큰 | `constants/Colors.ts` |
| Character | `assets/characters/`, `components/icons/JjaekiQuestion.tsx` |
| Icon (탭바) | `components/icons/TabIcon.tsx` |
| Controls (토글) | `components/Toggle.tsx` |
| Navigation/TopAppBar/Back 계열 | `app/tabs/mypage/*.tsx` 등 서브 화면 공통 헤더 패턴 |

## 다음에 확인이 필요한 섹션 (우선순위)

1. Navigation/TopAppBar/Home — 워드마크 로고 형태 확정 (현재 텍스트 "SOK-DAK" vs Figma 로고 스타일 "SokDak")
2. Bars, Callout Card, Card, Controls, Display, Form, System, Icon, Line — 아직 내부를 열어보지 못함. 카테고리 그리드(#17)·검색(#22) 등 남은 화면 작업 시 관련 섹션을 그때그때 열어서 대조할 것.
