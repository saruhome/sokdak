# SokDak 다국어 커뮤니티 온보딩·가이드라인 목업 명세

이 명세는 한국에 거주하는 영어·일본어·스페인어·베트남어·독일어 원어민을 위한 **가입 후 첫 커뮤니티 진입** 흐름을 정의한다. 모든 화면은 Android 우선의 세로형 모바일 화면이며, 읽기만 허용하는 일반 커뮤니티 화면과 달리 이 흐름은 사용자가 게시글 또는 댓글을 작성하기 전에 반드시 운영정책을 확인하고 동의하도록 유도한다.

| 공통 항목 | 적용 기준 |
| --- | --- |
| 디바이스 | Android 세로형, 1440 × 2560 비율, 실제 앱 화면처럼 보이는 시각 목업 |
| 브랜드 | 아이보리 배경, 다크 올리브/차콜 헤더, 코랄 CTA, 웜 골드 포인트, 손그림 질감의 호랑이 마스코트 |
| 정보 구조 | 온보딩 1화면 → 전체 가이드라인 1화면 → 체크박스 동의 → 참여 활성화 |
| 정책 증빙 | 가이드라인 화면 하단에 `v1.0 · Updated Aug 2026`을 표시하고, 실제 제품은 서버의 정책 버전·표시 언어·원문 해시를 동의 원장에 저장 |
| 접근성 | CTA 높이 56dp 이상, 코랄 버튼의 흰색 글자, 섹션 번호와 아이콘을 함께 사용, 작은 본문 최소 16sp |
| 금지 사항 | 긴 문구 잘림, 중앙 정렬 긴 문단, 국가 상징 과다 사용, 텍스트가 들어간 로고, 경쟁 앱 브랜딩 |

## 화면 공통 구조

온보딩은 마스코트가 커뮤니티 참여를 안내하는 따뜻한 단일 스크롤 화면으로 구성한다. 상단에는 커뮤니티 헤더와 진행 상태 `1 of 2`를 두고, 본문에는 학습 목적·안전 원칙 3개·강한 CTA를 둔다. 사용자가 임의로 동의를 건너뛰지 않도록 CTA는 `가이드라인 확인`이고, 뒤로가기는 커뮤니티 피드로 돌아가 읽기만 할 수 있게 한다.

가이드라인 화면은 상단 뒤로가기, `2 of 2` 진행 표기, 3개의 번호 섹션, 전체 정책 링크, 필수 체크박스, 체크 전 비활성 CTA, 버전 메타데이터로 구성한다. 실제 구현에서는 체크박스와 `동의하고 참여하기` 동작이 서버 RPC를 호출하며, 정책 원문을 본 언어의 `content_url`에서 표시한 뒤 해당 언어 코드와 원문 SHA-256을 이력 원장에 기록한다.

| 언어 | 온보딩 제목 | 온보딩 CTA | 가이드라인 CTA | 현지화 레이아웃 주의점 |
| --- | --- | --- | --- | --- |
| English | Welcome to SokDak Community | Review community guidelines | Agree & join community | 짧고 직접적인 1–2줄 문장, 명확한 동사 중심 CTA |
| 日本語 | SokDakコミュニティへようこそ | ガイドラインを確認する | 同意して参加する | CJK 줄바꿈 공간, 약 1.35 이상의 줄간격, 과도한 영문 혼용 금지 |
| Español | Bienvenido a la comunidad de SokDak | Revisar las normas | Aceptar y participar | 제목·CTA가 길어져도 줄바꿈 또는 버튼 높이 확장, 말줄임표 금지 |
| Tiếng Việt | Chào mừng đến với cộng đồng SokDak | Xem hướng dẫn cộng đồng | Đồng ý và tham gia | 성조 부호가 잘리지 않도록 넉넉한 행간, 단어 중간 줄바꿈 금지 |
| Deutsch | Willkommen in der SokDak-Community | Community-Regeln ansehen | Zustimmen und teilnehmen | 복합 명사가 길어질 수 있으므로 CTA의 2줄 줄바꿈과 버튼 높이 확장을 허용하고, 단어 중간에서 줄바꿈하지 않음 |

## 언어별 핵심 문안

| 언어 | 안전 원칙 1 | 안전 원칙 2 | 안전 원칙 3 |
| --- | --- | --- | --- |
| English | Lead with kindness | Protect personal information | Learn in cultural context |
| 日本語 | 思いやりのある言葉を使う | 個人情報を守る | 文化的な背景を尊重する |
| Español | Habla con respeto | Protege tus datos personales | Aprende con contexto cultural |
| Tiếng Việt | Giao tiếp tử tế | Bảo vệ thông tin cá nhân | Học cùng bối cảnh văn hoá |
| Deutsch | Begegne anderen respektvoll | Schütze persönliche Daten | Lerne im kulturellen Kontext |

가이드라인의 정책 확인 문구는 각 언어로 "커뮤니티 가이드라인 v1.0을 읽고 동의합니다"라는 뜻을 명확히 표현한다. 목업의 문구는 UI 방향성을 위한 축약본이며, 법적·운영상 효력이 있는 전문은 출시 전에 버전별 공개 URL에 게시되어야 한다.
