# SokDak 출시 실행 문서

이 문서는 코드 변경만으로 해결할 수 없는 출시 요건을 배포 담당자가 순서대로 완료하도록 돕는다. 현재 저장소에는 앱 빌드와 Supabase 스키마를 위한 변경이 포함되어 있지만, **아래의 원격 설정·법률 검토·운영 준비가 완료되기 전에는 일반 공개를 진행하지 않는다.**

## 1. Supabase 변경 적용과 검증

`supabase/migrations/`의 migration은 번호 순서대로 운영 Supabase 프로젝트에 적용한다. 적용 전에는 운영 DB 백업을 만들고, staging 프로젝트에서 가입·동의·글쓰기·댓글·프로필 수정·프리미엄 권한 변경을 먼저 검증한다. `20260814120000_lock_premium_entitlement.sql`은 모바일 클라이언트의 `profiles.is_premium` 변경을 차단한다. `20260814121000_add_community_guidelines_consent.sql`과 `20260814122000_enforce_community_guidelines_consent.sql`은 커뮤니티 정책 동의 시각과 게시 전 서버 검증을 추가한다.

| 검증 항목 | 통과 기준 |
|---|---|
| 프리미엄 권한 | `authenticated` 사용자로 `is_premium`을 수정하면 실패하고, 신뢰된 결제 웹훅의 `service_role` 경로만 성공한다. |
| 정책 동의 | 동의하지 않은 사용자는 post/comment insert가 실패하고, 동의 후에는 정상 작성된다. |
| 계정 삭제 | `delete_own_account` 실행 후 Auth·profiles·사용자 생성 콘텐츠·Storage 객체의 처리 방식이 정책 문서와 일치한다. |
| RLS | 사용자 A가 사용자 B의 프로필 민감 정보, 저장 목록, 차단 목록, 문의, 신고를 조회·수정·삭제하지 못한다. |
| Storage | `post-images` 및 프로필 이미지 버킷에서 인증·경로·콘텐츠 타입·파일 크기·삭제 정책이 모두 기대대로 작동한다. |

RLS와 Storage 정책은 현재 원격 프로젝트에만 존재할 수 있으므로, 실제 SQL을 반드시 저장소 migration으로 가져오고 role별 통합 테스트를 추가한다. 새 정책을 적용할 때는 익명 사용자의 읽기 범위와 커뮤니티 로그인 게이트가 동일한지 확인한다.

## 2. 개인정보·약관·계정 삭제 공개 URL

앱 내 `커뮤니티 운영정책` 화면은 게시 전 동의 기록을 위한 UI다. 이것만으로 개인정보 고지나 스토어의 웹 리소스 요건을 충족하지는 않는다. 법률 검토를 거친 아래 문서를 **HTTPS 공개 URL**로 발행하고, 앱·App Store Connect·Play Console에 같은 URL을 등록한다.

| 공개 문서 | 필수 내용 |
|---|---|
| 개인정보 처리방침 | 수집 데이터(계정, 연락처, 프로필 이미지, 게시물, 문의), 목적, 보관·파기, Supabase 등 처리 위탁/국외 이전, 이용자 권리와 연락처 |
| 이용약관·커뮤니티 가이드라인 | 금지 행위, 신고·차단, 제재 단계, 이의제기, 저작권 신고, 운영자 연락처 |
| 계정·데이터 삭제 페이지 | 로그인 여부와 무관하게 삭제 요청을 시작할 수 있는 웹 경로, 처리 범위, 보존 예외, 완료 예정 시점, 문의 방법 |
| 고객지원 페이지 | 정확한 운영 주체, 연락처, 응답 가능 시간, 긴급·불법 콘텐츠 신고 안내 |

Google Play에서 계정 생성 앱은 앱 내 삭제 경로와 웹 기반 계정·데이터 삭제 요청 리소스를 모두 제공해야 한다. Apple도 계정 생성 앱이 앱 안에서 삭제를 시작할 수 있도록 요구한다. 세부 기준은 [Google Play 계정 삭제 요건](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en) 및 [Apple 계정 삭제 안내](https://developer.apple.com/support/offering-account-deletion-in-your-app/)를 따른다.

## 3. 유료화 원칙

현재 앱은 프리미엄 상태를 읽기만 하며 판매·체험 활성화·클라이언트 권한 변경을 제공하지 않는다. 실제 유료화를 시작할 때에는 StoreKit/Google Play Billing 또는 적용 가능한 스토어 정책의 결제 경로, 서버 영수증 검증, 중복 웹훅 방지, entitlement 갱신, 구매 복원, 해지·환불·계정 삭제 안내를 함께 구현한다. 디지털 기능과 구독의 Play 결제 요건은 [Google Play Payments policy](https://support.google.com/googleplay/android-developer/answer/10281818?hl=en)를 기준으로 확인한다.

## 4. 커뮤니티 운영 준비

클라이언트 입력 검증은 사용자 경험을 위한 1차 장치일 뿐, 모더레이션의 전부가 아니다. 운영팀은 최소 1명 이상의 담당자, 신고 티켓 확인 주기, 심각도별 숨김·삭제·정지 기준, 이의제기 처리, 아동·성착취·신체 위협·개인정보 노출의 긴급 대응 절차를 확정해야 한다. 신고 콘텐츠와 사용자 차단이 실제로 운영자가 조치할 수 있는 큐로 연결되는지 확인한다.

Apple은 UGC 앱에 게시 전 부적절 소재 필터, 신고 및 신속한 대응, 사용자 차단, 공개 연락처를 요구한다. Google Play도 UGC 생성 전 정책 수락, 금지 행동 정의, 지속적 모더레이션, 인앱 신고·차단 및 적절한 조치를 요구한다. 자세한 기준은 [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) 및 [Google Play UGC policy](https://support.google.com/googleplay/android-developer/answer/9876937?hl=en-GB)를 참고한다.

## 5. 스토어 제출 전 품질 게이트

릴리스 후보는 `npm ci`, `npx tsc --noEmit`, `npx expo-doctor`, `npm run build`를 모두 통과해야 한다. 별도로 Android와 iOS의 release build를 실기기에서 검증하고, 신규 가입·이메일 인증·비밀번호 재설정 딥링크·로그아웃·계정 삭제·이미지 업로드·글/댓글 작성·신고/차단·다국어·오프라인/약한 네트워크를 회귀 테스트한다.

스토어 제출물에는 정확한 앱 설명, 개인정보와 Data safety/Privacy Nutrition Label, 연령 등급, 지원 URL, 스크린샷, 심사용 데모 계정 또는 완전한 데모 모드, 운영 중인 백엔드를 포함한다. 크래시와 API 오류를 수집할 관측성 도구, 롤백 절차, 릴리스 담당자와 고객지원 담당자도 공개 전 확정한다.
