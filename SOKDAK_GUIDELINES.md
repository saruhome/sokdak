SOK_DAK 프로젝트 가이드라인
Claude Code + Figma MCP 연동 개발 가이드
한국 MZ세대 유행어·밈 아카이빙 커뮤니티 앱 — 속닥(SOK_DAK)


________________


1. 프로젝트 개요 (Project Overview)
SOK_DAK(속닥) 은 한국 MZ세대의 유행어·인터넷 밈·신조어를 아카이빙하는 사전형 커뮤니티 앱입니다.


항목
	내용
	서비스명
	SOK_DAK (속닥)
	주요 목적
	MZ 슬랭 사전 아카이빙 + 커뮤니티 큐레이션
	핵심 기능
	슬랭 브라우징, 검색, 카테고리 필터, 커뮤니티 게시판, 저장 컬렉션, 알림 설정
	타겟층
	10–30대, 한국어 인터넷 문화에 관심 있는 사용자
	성격
	학습 앱이 아닌 사전·아카이빙·커뮤니티 플랫폼
	

________________


2. MCP 서버 설정 (MCP Servers)
Figma Dev Mode MCP 규칙
* Figma Dev Mode MCP 서버는 이미지 및 SVG 에셋을 제공하는 엔드포인트를 가집니다.
* 중요: 구현 전 반드시 Figma MCP를 통해 해당 화면의 노드를 먼저 조회하세요.
* 중요: Figma MCP가 이미지나 SVG에 대해 localhost 소스를 반환하면 해당 소스를 직접 사용하세요. 플레이스홀더를 만들거나 대체하지 마세요.
* 중요: 새로운 아이콘 패키지를 추가하지 마세요. 모든 에셋은 Figma 페이로드에 포함된 것을 사용합니다.
* 중요: 색상값을 Figma에서 직접 확인하고, 임의로 하드코딩하지 마세요. 반드시 tailwind.config.ts의 디자인 토큰을 사용하세요.


________________


3. 기술 스택 (Tech Stack)
프로젝트의 의존성은 ./package.json을 참고하세요.


분류
	기술
	프레임워크
	Next.js (App Router), React.js, TypeScript
	스타일링
	Tailwind CSS v4
	상태 관리 / 데이터 페칭
	Axios, @tanstack/react-query
	애니메이션
	Framer Motion
	백엔드 연동
	Mock 데이터로 시작 (REST API 미확정, 추후 교체 예정)
	

Mock 데이터 전략: API 연동 전까지 src/shared/mocks/ 내 Mock 파일을 사용합니다.
실제 API로 교체할 때 queries.ts만 수정하면 되도록 인터페이스를 분리해 작성하세요.


________________


4. 디자인 시스템 (Design System)
Figma에 전체 화면·컴포넌트·가이드라인이 완성되어 있습니다.
코드로 스타일을 임의 정의하지 말고, 반드시 Figma에서 값을 가져오세요.
모든 토큰은 tailwind.config.ts의 theme.extend에 등록해 사용합니다.


________________


4-1. 타이포그래피 (Typography)
서체: Noto Serif KR


한국적인 분위기를 담은 세리프 서체로, 궁서체와 유사한 고전적인 인상을 주면서도 획의 굵기와 구조가 정제되어 가독성이 높습니다. '속닥'의 전통적 무드를 살리면서 읽기 편한 사용자 경험을 위해 선택된 서체입니다.
타이포그래피 계층 (Hierarchy)
Figma 컴포넌트 CSS에서 추출한 실제 수치입니다.


Figma 토큰명
	size
	weight
	line-height
	용도
	속닥 Headline
	26px
	700
	36px
	강조 단어, 페이지 핵심 제목
	속닥 Title
	18px
	600
	18px
	섹션 헤더, 카드 제목, 내비게이션 바
	속닥 본문 Bold
	16px
	600
	20px
	게시글 제목, 강조 본문
	속닥 본문
	16px
	400
	20px
	일반 본문, 리스트 텍스트, 버튼 레이블
	속닥 14p
	14px
	400
	18px
	슬랭 설명, 댓글, 일반 정보 텍스트
	속닥 caption
	12px
	400
	16px
	날짜, 조회수, 메타 정보, 뱃지 텍스트
	탭 바 레이블
	9–10px
	400
	16px
	하단 탭 바 아이콘 레이블
	

// tailwind.config.ts


fontSize: {


  'sok-headline':  ['26px', { lineHeight: '36px', fontWeight: '700' }],


  'sok-title':     ['18px', { lineHeight: '18px', fontWeight: '600' }],


  'sok-body-bold': ['16px', { lineHeight: '20px', fontWeight: '600' }],


  'sok-body':      ['16px', { lineHeight: '20px', fontWeight: '400' }],


  'sok-14':        ['14px', { lineHeight: '18px', fontWeight: '400' }],


  'sok-caption':   ['12px', { lineHeight: '16px', fontWeight: '400' }],


  'sok-tab':       ['10px', { lineHeight: '16px', fontWeight: '400' }],


}


규칙: 위 7단계 계층 외의 폰트 사이즈·웨이트를 임의로 정의하지 마세요. 필요하면 Figma를 먼저 확인하세요.


________________


4-2. 컬러 시스템 (Color)
Figma 컴포넌트 주석(Sok-Dak Color/...)에서 추출한 공식 팔레트입니다.
브랜드 서피스 컬러
Figma 토큰명
	HEX
	Tailwind 토큰
	용도
	Sok-Dak Color/Primary
	#F6F2EA
	surface-primary
	주요 배경, 바텀시트, 탑 앱바
	Sok-Dak Color/Secondary
	#52514E
	surface-secondary
	다크 버튼, 탑 앱바(홈), 탭 바 비활성 셀
	Sok-Dak Color/배경
	#F8F8F8
	surface-bg
	입력 필드 배경, 카드 라이트 모드
	Sok-Dak Color/기본
	#FAFAFA
	surface-base
	말풍선, 팝업 배경
	폰트 컬러
Figma 토큰명
	HEX
	Tailwind 토큰
	용도
	Font_01 (강조, 버튼)
	#121212
	text-emphasis
	최상위 강조 텍스트, 활성 버튼
	Font_02 (타이틀)
	#333333
	text-title
	제목, 카드 헤더, 유저 닉네임
	Font_03 (본문)
	#666666
	text-body
	일반 본문, 설명 텍스트
	Font_04 (비강조)
	#888888
	text-muted
	플레이스홀더, 힌트, 비활성 레이블
	라인 / 보더 컬러
Figma 토큰명
	HEX
	Tailwind 토큰
	용도
	Line_01
	#C5C5C5
	border-default
	카드 테두리, 입력 필드 보더, 구분선
	Line_02
	#EBEBEB
	border-subtle
	얕은 구분선, 다크 모드 카드 테두리
	포인트 컬러 — 카테고리 칩 (Category Chip Colors)
카테고리 선택 모달(필터 칩 클릭 시)과 카테고리 분류 페이지에서 사용됩니다.
각 카테고리는 고유 배경색 + 텍스트 색 쌍으로 구성됩니다.


카테고리
	배경색 HEX
	텍스트색 HEX
	Tailwind 배경 토큰
	Tailwind 텍스트 토큰
	일상
	#B8C8E8
	#3D5B8E
	cat-daily-bg
	cat-daily-text
	자주 쓰는 신조어
	#E8D88A
	#7C2929
	cat-frequent-bg
	cat-frequent-text
	드라마/영화
	#E8E8E8
	#666666
	cat-drama-bg
	cat-drama-text
	새로운 신조어
	#D97060
	#720000
	cat-new-bg
	cat-new-text
	릴스
	#6B85B8
	#DCEDFF
	cat-reels-bg
	cat-reels-text
	K-POP
	#8B7BC4
	#22135F
	cat-kpop-bg
	cat-kpop-text
	무한도전
	#B0AEA8
	#333333
	cat-muhan-bg
	cat-muhan-text
	한물 간 신조어
	#C8B898
	#AF5B23
	cat-old-bg
	cat-old-text
	초성 모음집
	#E8A880
	#C85107
	cat-chosung-bg
	cat-chosung-text
	

// tailwind.config.ts


colors: {


  cat: {


    daily:    { bg: '#B8C8E8', text: '#3D5B8E' },


    frequent: { bg: '#E8D88A', text: '#7C2929' },


    drama:    { bg: '#E8E8E8', text: '#666666' },


    new:      { bg: '#D97060', text: '#720000' },


    reels:    { bg: '#6B85B8', text: '#DCEDFF' },


    kpop:     { bg: '#8B7BC4', text: '#22135F' },


    muhan:    { bg: '#B0AEA8', text: '#333333' },


    old:      { bg: '#C8B898', text: '#AF5B23' },


    chosung:  { bg: '#E8A880', text: '#C85107' },


  },


}


사용 위치 — 카테고리 필터 모달에서 칩 선택 시 배경이 해당 카테고리 색으로 활성화됩니다. 카테고리 분류 페이지의 카드 배경에도 동일 컬러를 적용합니다. 미선택 상태는 border-default(#C5C5C5) + text-body(#666666) 조합을 사용하세요.


별도 포인트 컬러 — 좋아요 활성(#A94949), 알림 뱃지(#A94949), 스위치 ON(#526192)은 카테고리와 무관한 UI 포인트 컬러로 별도 관리합니다.


// UI 포인트 컬러 (카테고리 외)


point: {


  like:   '#A94949',   // 좋아요 활성, 알림 뱃지


  switch: '#526192',   // 스위치 ON 상태


}
카드 다크 모드
HEX
	Tailwind 토큰
	용도
	#38373D
	surface-dark
	단어 카드·게시글 카드 다크 배경
	#753737
	surface-dark-red
	카테고리 카드 다크 배경 (특수)
	

// tailwind.config.ts


colors: {


  surface: {


    primary:   '#F6F2EA',


    secondary: '#52514E',


    bg:        '#F8F8F8',


    base:      '#FAFAFA',


    dark:      '#38373D',


    'dark-red':'#753737',


  },


  text: {


    emphasis: '#121212',


    title:    '#333333',


    body:     '#666666',


    muted:    '#888888',


  },


  border: {


    default: '#C5C5C5',


    subtle:  '#EBEBEB',


  },


  point: {


    like:   '#A94949',   // 좋아요 활성, 알림 뱃지


    switch: '#526192',   // 스위치 ON 상태


  },


  cat: {


    daily:    { bg: '#B8C8E8', text: '#3D5B8E' },


    frequent: { bg: '#E8D88A', text: '#7C2929' },


    drama:    { bg: '#E8E8E8', text: '#666666' },


    new:      { bg: '#D97060', text: '#720000' },


    reels:    { bg: '#6B85B8', text: '#DCEDFF' },


    kpop:     { bg: '#8B7BC4', text: '#22135F' },


    muhan:    { bg: '#B0AEA8', text: '#333333' },


    old:      { bg: '#C8B898', text: '#AF5B23' },


    chosung:  { bg: '#E8A880', text: '#C85107' },


  },


}


규칙: 위 팔레트 외의 HEX·RGB 값을 코드에 직접 작성하지 마세요. 새로운 색상이 필요하면 Figma를 먼저 확인하고 토큰으로 등록하세요.


________________


4-3. Border Radius
Figma 컴포넌트에서 추출한 radius 값입니다.


컴포넌트
	radius
	용도
	버튼 (Primary/Secondary)
	10px
	메인 버튼, 입력 필드
	카드 (Word/Post)
	10px
	슬랭 카드, 게시글 카드
	카테고리 카드
	10px
	카테고리 그리드 카드
	뱃지 / 칩 (소형)
	12px
	카테고리 뱃지, 태그
	뱃지 / 칩 (중형)
	14px
	게시판 종류 뱃지
	필터 칩
	20px
	카테고리 필터 선택 칩
	검색 바
	8px
	검색 입력 필드
	바텀시트
	24px 24px 0 0
	카테고리 필터 바텀시트 상단
	섹션 컨테이너
	20px
	Figma 컴포넌트 그룹 박스
	스위치 (토글)
	35px
	ON/OFF 토글
	말풍선
	10px / 12px
	대화 예시 말풍선
	드롭다운
	8px 8px 0 0 / 0 0 8px 8px
	정렬 드롭다운 상단/하단
	

// tailwind.config.ts


borderRadius: {


  'btn':         '10px',


  'card':        '10px',


  'badge-sm':    '12px',


  'badge-md':    '14px',


  'chip':        '20px',


  'input':       '8px',


  'sheet':       '24px',


  'toggle':      '35px',


  'bubble':      '12px',


  'dropdown-t':  '8px 8px 0 0',


  'dropdown-b':  '0 0 8px 8px',


}


________________


4-4. 컴포넌트 스펙 요약 (Component Specs)
Figma 컴포넌트 CSS에서 추출한 주요 치수입니다.
버튼
종류
	width
	height
	padding
	용도
	Primary Button (full)
	260–327px
	52px
	16px 34px
	메인 CTA (검정 배경)
	Secondary Button
	320px
	52px
	12px 130px
	보조 액션 (회색 배경)
	Ghost Button
	320px
	52px
	16px 214px
	직접 문의 등 (어두운 배경)
	Filter Chip
	가변
	38px
	10px 16px
	카테고리 필터 선택
	Badge (게시판)
	92px
	28px
	4px 12px
	게시판 종류 필터
	Badge (소형)
	71px
	24px
	4px 12px
	카테고리 태그
	입력 필드
종류
	height
	padding
	용도
	검색바
	36px
	0 0 0 8px
	홈·사전 검색
	댓글 입력
	40px
	-
	댓글 입력란
	제목 입력 (게시글)
	44px
	14px 24px
	게시글 제목 필드
	본문 입력 (게시글)
	36px~
	8px 24px
	게시글 본문
	문의 내용
	90px
	12px 16px
	고객센터 문의 내용
	아이콘 터치 영역
종류
	크기
	용도
	탑 앱바 아이콘 버튼
	44 × 44px
	뒤로가기, 공유, 메뉴, 알림
	리스트 내 아이콘 버튼
	36 × 36px
	즐겨찾기, 소리, 취소
	FAB (글쓰기)
	50 × 50px
	게시글 작성 플로팅 버튼
	아이콘 원본 크기
	24 × 24px
	SVG 아이콘 기본 크기
	소형 아이콘 (메타)
	12 × 12px
	조회수·좋아요·댓글 수 옆 아이콘
	검색바 내 아이콘
	18 × 18px
	검색 아이콘, 마이크 아이콘
	스위치 (Toggle)
상태
	배경색
	크기
	knob 크기
	ON
	#52514E (surface-secondary)
	51 × 29px
	26 × 25px
	OFF
	#C5C5C5 (border-default)
	49 × 27px
	23 × 24px
	

________________


4-5. 아이콘 시스템 (Icon)
* 모든 아이콘은 Figma 페이로드에서 SVG로 가져와 사용합니다.
* 외부 아이콘 라이브러리(lucide-react, heroicons 등) 추가 금지.
* 아이콘 기본 크기: 24 × 24px
* 아이콘 컬러는 위 컬러 토큰을 사용하고, currentColor로 제어하세요.
아이콘 카테고리 (Figma 기준)
카테고리
	포함 아이콘
	네비게이션
	뒤로가기, 위, 아래, 왼쪽, 오른쪽, 닫기(X)
	탭 바
	홈, 단어(사전), 카테고리, 커뮤니티, 마이페이지
	액션
	검색, 마이크, 알림(뱃지 ON/OFF), 공유, 더보기(⋮), 즐겨찾기(★), 좋아요(♥)
	미디어
	사진, 이모지, 소리
	피드백
	체크, 취소, 신고(사이렌), 차단(정지), 삭제(휴지통), 편집(연필)
	인디케이터
	페이지 도트(활성/비활성)
	

// 사용 예시 — Figma SVG를 컴포넌트로 래핑


// src/shared/components/icons/IconSearch.tsx


export const IconSearch = ({ size = 24, color = 'currentColor' }) => (


  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">


    {/* Figma에서 복사한 SVG path */}


  </svg>


);


________________


5. 레이아웃 & 간격 가이드라인 (Layout & Spacing)
아래 수치는 Figma 디자인 시스템 기준입니다. 코드 작성 시 이 값을 그대로 사용하세요.
임의로 수치를 변경하거나 새로운 간격 값을 추가하지 마세요.


________________


5-1. 상태 표시줄 (Status Bar)
* 상태 표시줄을 위해 최소 44px의 공간을 확보합니다.
* 상단 콘텐츠는 44px 아래부터 시작해야 합니다.
* 상태 표시줄 영역에는 어떤 요소도 배치하지 마세요.


________________


5-2. 뒤로 가기 내비게이션 바 (Back Navigation Bar)
* 내비게이션 바 높이는 보통 56px 사용, 넓은 컨텐츠에 따라 달라질 수 있음
* 좌측 뒤로가기 버튼 영역까지 44px 터치 영역 확보
* 내비게이션 바 내 좌우 여백: 24px


________________


5-3. 아이콘 가로 간격 조절 (Horizontal Icon Spacing)
* 아이콘 사이의 가로 간격은 기본 '가로 간격(Horizontal spacing)' 슬라이더로 조절
* 세로 간격은 '세로 간격(Vertical spacing)' 슬라이더로 조절
* 기본 좌우 여백: 24px
* 상단 여백: 44px
* 아이콘 행 간 여백: 32px, 32px


________________


5-4. 간격 & 아이코노그래피 (Spacing & Iconography)
* 아이콘을 배치할 때 반드시 24 × 24px 크기의 컨테이너 안에 배치
* 표준 아이콘 크기: 24 × 24px (상황에 따라 더 크게 사용 가능)
* 아이콘 주변 여백:


위치
	값
	상단
	48px
	하단 행 간
	24px
	좌우
	24px
	

________________


5-5. 텍스트 컨테이너 (Text Container)
* 텍스트 컨테이너 상단 여백: 64px
* 컨테이너 우측 여백: 8px
* 텍스트와 아이콘 간 연결 여백: 8px
* 레이아웃을 올바르게 사용하기 위해 8px 패딩 적용


________________


5-6. 텍스트 & 버튼 (Text & Button)
* 텍스트와 입력 필드 사이 연결성 확보: 32px
* 버튼 간 여백: 56px
* 버튼 내부 패딩: 8px


________________


5-7. 패딩 & 마진 (Padding & Margin)
패딩(Padding)은 콘텐츠와 테두리 사이의 내부 여백을 의미하고, 마진(Margin)은 테두리 바깥쪽의 공간으로 다른 요소들과의 간격을 정합니다.


항목
	값
	우측 외부 마진
	24px
	버튼 내부 패딩
	16px (하단)
	

________________


5-8. 좌우 여백 (Horizontal Margin)
* 좌우 여백: 24px (콘텐츠-디바이스 경계 분리 기준)
* 역할: 시각적 안정감 및 가독성 확보, 다양한 해상도 대응 표준 수치


________________


5-9. 제목과 콘텐츠 사이의 여백
* 헤드라인-본문 간 계층 구조(Hierarchy) 형성
* 근접성의 원칙: 관련 정보를 한 그룹으로 인식
* 좌우 여백: 16px
* 항목 간 여백: 16px
* 하단 여백: 44px (기준)


________________


5-10. 섹션 간 여백
* 독립적 그룹 간 '시각적 휴식' 제공
* 인지 부하(Cognitive Load) 감소 / 콘텐츠 탐색 효율 최적화
* 섹션 간 여백: 32px


________________


5-11. 탭과 카드 사이의 여백
* 반복되는 요소(Card, Tab) 사이 간격
* 소속 독립성 및 리딩감 확보 / 레이아웃의 일관된 연결성 유지
* 탭·카드 간 여백: 12px (좌우), 12px (상하)


________________


5-12. 버튼 간 여백
* 인터랙션 요소 간 시각적 통일성 확보
* 터치 타겟(Touch Target) 안전거리 확보 / 사용자 오클릭(Misclick) 방지
* 버튼 간 여백: 12px (하단 기준)


________________


5-13. 탭 바 탭 내부 패딩
* iOS 홈 인디케이터 간섭 최소화
* 하단 영역의 어색 & 밸런스 조정 / 인터페이스 하단 균형 완성
* 탭 바 하단 내부 패딩: 16px (상하 동일)


________________


6. 도메인 & 디렉토리 아키텍처 (Directory Architecture)
Feature 기반 슬라이스 아키텍처를 따릅니다. 아래 IA(Information Architecture) 기반 도메인 구조를 반드시 준수하세요.
IA 구조 요약
탭
	주요 페이지
	세부 기능
	홈
	메인 피드
	검색창(히스토리), 오늘의 추천 용어(Hot & 기간별), 새로운 신조어, 커뮤니티 바로가기
	카테고리
	카테고리 브라우징
	KPOP·드라마·일상별·작품 속 단어, 한물 간 신조어(년도별), 새로운·자주 쓰는 신조어, 초성 모음집, 감탄사 모음집
	사전
	슬랭 사전
	검색창(히스토리), 자음별 분류 단어 모음
	커뮤니티
	자유 게시판
	자유 게시판(언어 교환), Q&A, 운영진에게 신조어 제안
	마이페이지
	내 계정
	계정(프로필·수정·사진·닉네임), 저장한 단어(즐겨찾기), 운영진에게 신조어 제안
	

________________


디렉토리 구조
src/


├── app/


│   │


│   ├── (splash)/                        # 로고 스플래시 화면


│   │   └── page.tsx


│   │


│   ├── (tabs)/                          # 하단 탭 네비게이션 루트


│   │   ├── layout.tsx                   # 탭 바 레이아웃


│   │   │


│   │   ├── home/                        # 탭 1: 홈


│   │   │   ├── page.tsx


│   │   │   ├── _features/


│   │   │   │   ├── ui/


│   │   │   │   │   ├── HomePageView.tsx


│   │   │   │   │   ├── RecommendedSlang.tsx   # 오늘의 추천 용어 (Hot & 기간별)


│   │   │   │   │   ├── NewSlangSection.tsx    # 새로운 신조어


│   │   │   │   │   └── CommunityBanner.tsx    # 커뮤니티 바로가기


│   │   │   │   └── lib/


│   │   │   │       └── useHomeData.ts


│   │   │   └── _entities/


│   │   │       ├── types.ts


│   │   │       └── queries.ts


│   │   │


│   │   ├── category/                    # 탭 2: 카테고리


│   │   │   ├── page.tsx                 # 카테고리 목록


│   │   │   ├── [categoryId]/            # 카테고리 상세


│   │   │   │   └── page.tsx


│   │   │   ├── _features/


│   │   │   │   ├── ui/


│   │   │   │   │   ├── CategoryPageView.tsx


│   │   │   │   │   ├── CategoryGrid.tsx       # KPOP·드라마·일상별 등


│   │   │   │   │   ├── VintageSlang.tsx       # 한물 간 신조어 (년도별)


│   │   │   │   │   ├── ChosungCollection.tsx  # 초성 모음집


│   │   │   │   │   └── ExclamationCollection.tsx # 감탄사 모음집


│   │   │   │   └── lib/


│   │   │   │       └── useCategoryData.ts


│   │   │   └── _entities/


│   │   │       ├── types.ts


│   │   │       └── queries.ts


│   │   │


│   │   ├── dictionary/                  # 탭 3: 사전


│   │   │   ├── page.tsx                 # 사전 메인 (자음별 분류)


│   │   │   ├── [slangId]/              # 슬랭 상세


│   │   │   │   └── page.tsx


│   │   │   ├── _features/


│   │   │   │   ├── ui/


│   │   │   │   │   ├── DictionaryPageView.tsx


│   │   │   │   │   ├── AlphabetIndex.tsx      # 자음별 분류 인덱스


│   │   │   │   │   ├── SlangDetailView.tsx    # 슬랭 상세


│   │   │   │   │   └── SearchHistory.tsx      # 검색 히스토리


│   │   │   │   └── lib/


│   │   │   │       └── useDictionaryData.ts


│   │   │   └── _entities/


│   │   │       ├── types.ts


│   │   │       └── queries.ts


│   │   │


│   │   ├── community/                   # 탭 4: 커뮤니티


│   │   │   ├── page.tsx                 # 커뮤니티 메인


│   │   │   ├── free/                    # 자유 게시판 (언어 교환)


│   │   │   │   ├── page.tsx


│   │   │   │   └── [postId]/


│   │   │   │       └── page.tsx


│   │   │   ├── qna/                     # Q&A 게시판


│   │   │   │   ├── page.tsx


│   │   │   │   └── [postId]/


│   │   │   │       └── page.tsx


│   │   │   ├── suggest/                 # 운영진에게 신조어 제안


│   │   │   │   └── page.tsx


│   │   │   ├── write/                   # 글쓰기


│   │   │   │   └── page.tsx


│   │   │   ├── _features/


│   │   │   │   ├── ui/


│   │   │   │   │   ├── CommunityPageView.tsx


│   │   │   │   │   ├── PostCard.tsx


│   │   │   │   │   ├── PostDetail.tsx


│   │   │   │   │   └── SuggestForm.tsx


│   │   │   │   └── lib/


│   │   │   │       └── useCommunityData.ts


│   │   │   └── _entities/


│   │   │       ├── types.ts


│   │   │       └── queries.ts


│   │   │


│   │   └── mypage/                      # 탭 5: 마이페이지


│   │       ├── page.tsx                 # 마이페이지 메인


│   │       ├── profile/                 # 계정 (프로필·수정·사진·닉네임)


│   │       │   └── page.tsx


│   │       ├── saved/                   # 저장한 단어 (즐겨찾기)


│   │       │   └── page.tsx


│   │       ├── suggest/                 # 운영진에게 신조어 제안


│   │       │   └── page.tsx


│   │       ├── settings/


│   │       │   └── notifications/       # 알림 설정


│   │       │       └── page.tsx


│   │       ├── _features/


│   │       │   ├── ui/


│   │       │   │   ├── MyPageView.tsx


│   │       │   │   ├── ProfileEdit.tsx


│   │       │   │   └── SavedSlangList.tsx


│   │       │   └── lib/


│   │       │       └── useMyPageData.ts


│   │       └── _entities/


│   │           ├── types.ts


│   │           └── queries.ts


│   │


│   └── search/                          # 전역 검색 (홈·사전 공용)


│       ├── page.tsx


│       ├── _features/


│       │   ├── ui/


│       │   │   ├── SearchPageView.tsx


│       │   │   └── SearchHistory.tsx    # 히스토리 제공


│       │   └── lib/


│       │       └── useSearch.ts


│       └── _entities/


│           ├── types.ts


│           └── queries.ts


│


├── shared/


│   ├── components/                      # 공통 컴포넌트


│   │   ├── SlangCard.tsx


│   │   ├── Badge.tsx


│   │   ├── BottomSheet.tsx


│   │   ├── Toggle.tsx


│   │   ├── SearchBar.tsx


│   │   └── ...


│   ├── mocks/                           # Mock 데이터


│   │   ├── slang.mock.ts


│   │   ├── category.mock.ts


│   │   ├── post.mock.ts


│   │   └── user.mock.ts


│   └── utils/


________________


7. 핵심 엔티티 (Core Entities)
아래 타입을 기준으로 DTO와 API 인터페이스를 작성하세요.
필드 추가가 필요하면 types.ts에 확장하되, 임의로 구조를 변경하지 마세요.


// 슬랭 (사전 단어)


interface Slang {


  id: string;


  term: string;           // 단어 (예: "갈비", "어쩔티비")


  meaning: string;        // 뜻 풀이


  examples: string[];     // 예문


  category: SlangCategory;


  tags: string[];


  origin?: string;        // 유래 (선택)


  likeCount: number;


  viewCount: number;


  createdAt: string;      // ISO 8601


  isSaved?: boolean;      // 현재 유저 저장 여부


}


type SlangCategory =


  | "유행어"


  | "밈"


  | "신조어"


  | "줄임말"


  | "드립"


  | "기타";


// 커뮤니티 게시글


interface Post {


  id: string;


  title: string;


  content: string;


  author: Author;


  slangRefs?: string[];   // 연관 슬랭 id


  likeCount: number;


  commentCount: number;


  createdAt: string;


}


interface Author {


  id: string;


  nickname: string;


  avatarUrl?: string;


}


// 저장 컬렉션


interface Collection {


  id: string;


  userId: string;


  name: string;


  slangIds: string[];


  createdAt: string;


}


// 알림 설정


interface NotificationSettings {


  masterEnabled: boolean;


  community: {


    newComment: boolean;


    newLike: boolean;


    mention: boolean;


  };


  slang: {


    newSlang: boolean;


    trendingAlert: boolean;


  };


}


________________


8. 구현 규칙 (Implementation Rules)
* 모든 페이지는 src/app 내의 디렉토리로 관리합니다.
* 페이지 구현 시 Figma 화면을 먼저 조회하고, 필요한 DTO와 Mock 데이터를 정의한 뒤 UI를 작성하세요.
* 버튼, 입력창, 토글, 바텀시트 등 공통 요소는 shared/components/에 유연한 컴포넌트로 구현하세요.
* Mock 데이터는 shared/mocks/에 분리하고, queries.ts에서 import해서 사용하세요.
* 컴포넌트 하나를 완성한 후 다음으로 넘어가세요. 여러 파일을 동시에 생성하지 마세요.
* 구현 완료 후 변경·생성된 파일 목록을 요약해서 보고하세요.


________________


9. 지양 패턴 (Avoid Patterns)
항목
	규칙
	TypeScript
	any 타입 절대 금지. 필요하면 타입을 정의하세요.
	스타일링
	margin/padding 대신 gap 사용을 우선하세요.
	모듈화
	컴포넌트 코드가 150줄을 초과하면 hook 또는 하위 컴포넌트로 분리하세요.
	이벤트 핸들러
	인라인 함수 금지. handleXxxClick 형식의 핸들러 함수를 선언하세요.
	에셋
	Figma에서 SVG 코드를 가져와 사용하고, 직접 에셋 파일을 생성하지 마세요.
	색상 하드코딩
	HEX·RGB 값 직접 작성 금지. Tailwind 토큰 또는 CSS 변수를 사용하세요.
	Mock → API 전환
	queries.ts의 fetch 함수만 교체하면 되도록 인터페이스를 유지하세요.