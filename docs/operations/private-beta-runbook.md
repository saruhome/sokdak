# SokDak 초대형 비공개 베타 배포 실행 문서

## 출시 전 원칙

이번 단계는 **무료·초대 전용·비공개 베타**다. 프리미엄 결제, 공개 스토어 검색 노출, 공개 테스트 링크, 개인 이름을 전면에 내세우는 고객지원 문구를 사용하지 않는다. 앱 안의 제품명과 테스터 안내는 `SokDak`으로 통일한다.

TestFlight 및 Google Play 개발자 계정의 법적 신원 표시는 해당 플랫폼 설정을 따르며, 앱 안의 브랜드 표시와는 별개다. 개인 정보 공개 범위가 허용되지 않으면 해당 플랫폼 공개 테스트로 전환하지 않고 초대형 비공개 트랙만 유지한다.

## 1. 사전 구성

| 항목 | 비공개 베타 기준 | 확인 방법 |
|---|---|---|
| 빌드 프로필 | `eas.json`의 `private-beta` | `EXPO_PUBLIC_RELEASE_STAGE=private-beta` |
| 결제 | 비활성 | 프리미엄 화면에 실제 구매·권한 변경이 없음 |
| Supabase | 운영 프로젝트 연결, RLS·migration 적용 | migration 이력·Security Advisor 확인 |
| 고객지원 | 로그인 사용자는 앱 내 지원 티켓 사용 | 지원 티켓 생성·답변·읽음 확인 |
| 법률 URL | 정식 공개 출시 전까지 실제 URL로 주장하지 않음 | `private-beta` 구성 검사는 URL을 요구하지 않음 |
| 초대 목록 | 동의한 테스터의 이메일만 사용 | 접근 제한된 운영 시트 |

베타 빌드는 환경 변수 `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_RELEASE_STAGE=private-beta`를 설정한 뒤 `npm run check:release-config`를 통과해야 한다. 공개 정식 출시용 `production` 단계는 별도 HTTPS 법률 URL과 지원 이메일이 필수다.

## 2. iOS 배포

App Store Connect에서 내부 테스트 그룹을 먼저 만든 뒤 TestFlight 외부 테스트 그룹을 이메일 초대 방식으로 구성한다. 외부 공개 링크는 사용하지 않는다. 새 빌드는 TestFlight 검토가 필요한지 확인한 뒤, 승인된 빌드만 초대 그룹에 연결한다. 초대에는 베타 목적, 피드백 채널, 중단 방법, 콘텐츠 비공개 주의사항을 포함한다.

## 3. Android 배포

Google Play Console의 **비공개 테스트** 트랙을 만들고, 이메일 목록 또는 Google Group을 사용해 테스터를 제한한다. 개인 개발자 계정은 정식 프로덕션 접근 전에 최소 12명의 테스터가 14일 연속 opt-in해야 하므로, SokDak은 30명 이상을 초대하고 최소 21일을 운영 목표로 한다.[1]

## 4. 베타 주간 운영

월요일에는 신규 빌드·알려진 이슈·이번 주 검증 항목을 안내한다. 매일은 지원 티켓·신고 큐·오류 보고를 확인하고, 긴급 UGC는 즉시 숨긴다. 매주에는 테스터 이탈, 핵심 흐름 실패, 기기별 오류, 신고 처리 시간, 계정 삭제 결과를 리뷰하고 다음 빌드의 P0/P1 목록을 확정한다.

## 5. 정식 출시 전환 금지 조건

다음 중 하나라도 충족되지 않으면 `production` 빌드를 만들지 않는다. 실제 공개 개인정보처리방침·이용약관·계정 삭제 URL, 브랜드 고객지원 채널, 사업자 등록 및 조직 개발자 계정 정보, iOS·Android 실기기 QA, 결제 영수증 검증 및 환불·고객지원 절차가 모두 필요하다.

[1]: https://support.google.com/googleplay/android-developer/answer/14151465?hl=en "Google Play — App testing requirements for new personal developer accounts"
