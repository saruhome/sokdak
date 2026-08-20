# SokDak 무료 작업 완료 및 외부 의존 항목

이 문서는 비공개 베타에 필요한 기능·정보 보호·유지보수 항목 중 코드와 현재 Free 플랜에서 완료할 수 있는 작업을 기록하고, 유료 플랜·법률 자문·실기기·권리 확인이 필요한 항목을 분리한다.

## 무료로 완료한 항목

| 영역 | 완료 내용 | 검증 |
| --- | --- | --- |
| 프로필 사진 보호 | private `profile-avatars` 버킷, 사용자별 Storage RLS, 경로만 DB 보관, 1시간 Signed URL, 포그라운드·만료 5분 전 자동 갱신, 회원탈퇴 시 객체 삭제를 적용했다. | Storage 설정·RLS 재조회, Edge Function v2 활성화 확인 |
| 인증·오류 개인정보 | 인증 세션을 SecureStore 키 기반 AES 암호화 저장소로 전환하고, 오류 보고에서 이메일·토큰·비밀번호·전화번호를 마스킹했다. | 단위 테스트 |
| 비공개 베타 권한 | 저장·카테고리·TTS 한도를 해제하고, 프리미엄 배너·업그레이드 행·콘텐츠 잠금을 숨겨 베타 참가자가 모든 학습 콘텐츠에 접근하도록 했다. | TypeScript·Jest·웹 번들 |
| private 미디어 확장성 | 아바타·향후 private 동영상·첨부파일이 공유할 Signed URL 레지스트리와 포그라운드/만료 전 갱신 훅을 구현했다. | 단위 테스트 |
| 커뮤니티 개인정보 | 커뮤니티에서는 private 아바타 경로를 이모지로 대체해 경로 노출과 깨진 이미지를 막았다. | 단위 테스트 |
| 검색 UX | 5개 언어 검색 결과 없음 상태를 짹이 질문 포즈 기반 빈 상태로 통일했다. | 화면 테스트 |
| CI 유지보수 | Quality Gate의 `actions/checkout`, `actions/setup-node`를 v5로 올려 Node.js 20 런타임 경고를 해소했다. | 원격 Quality Gate 성공 확인 |
| Supabase RLS·조회 성능 | 사용자 소유 데이터 RLS의 `auth.uid()`를 문 단위 평가 형태로 보정하고, 외래 키·알림 조회 패턴 인덱스를 추가했다. | Supabase Performance Advisor에서 RLS·미인덱스 외래 키 경고 해소 확인 |

## 현재 외부 의존 또는 보류 항목

| 항목 | 현재 제약 | 필요한 다음 조치 |
| --- | --- | --- |
| 유출 비밀번호 보호 | 운영 Supabase 조직이 Free 플랜이며, 해당 기능은 Supabase Pro 이상에서 제공된다. | Pro 업그레이드 후 Auth 설정에서 활성화하고 Security Advisor 재실행 |
| 정책·동의 원장 공개 배포 | 5개 언어 정책 전문, URL, 해시, 개인정보 처리방침·이용약관은 법률·운영 승인이 필요하다. | 승인된 전문·불변 HTTPS URL·SHA-256을 준비한 뒤 migration·시드·RPC를 연속 배포 |
| 캐릭터 상업 이용 권리 | 티콘파이 FAQ는 권리를 가진 이미지·컨셉으로 만든 결과물의 상업적 활용 가능성을 안내한다. 수정·재배포·권리 귀속·독점성 조건은 미확인이다. | FAQ 캡처·생성 기록을 보관하고, 스토어·광고·공개 저장소 배포 범위를 제공사에 서면 확인 |
| Android/iOS 실기기 QA | 음성 검색·SecureStore·사진 업로드·회원탈퇴·오류 복구는 개발 기기와 테스터 계정이 필요하다. | Pixel·Samsung·iPhone에서 EAS development/release build로 시나리오 실행 |
| 운영 오류 모니터링 | 외부 모니터링 서비스의 계정·프로젝트·수집 정책이 정해지지 않았다. | 개인정보 처리방침과 맞는 서비스·보존 기간을 결정하고 DSN/키를 별도 비밀값으로 연결 |
| 의존성 감사 | `npm audit --omit=dev`는 Expo/Metro 전이 의존성 15건(High 8, Moderate 7)을 보고한다. 현재 Expo 57.0.14는 SDK 57 계열 최신이며 자동 수정은 호환되지 않는 Expo 53.0.27 변경을 제안한다. | Expo SDK의 보안 패치 또는 차기 호환 SDK가 나오면 별도 업그레이드·네이티브 회귀 검증 수행 |

## 무료 검증 결과

현 상태에서 TypeScript 검사, Jest 23개 스위트·92개 테스트, Expo 공개 구성 검사, release 설정 검사, 프로덕션 웹 번들 생성이 통과했다. Expo Doctor의 개별 실행은 Expo API 네트워크 응답에 따라 일시적으로 실패할 수 있으므로, 원격 Quality Gate에서 재검증한다. npm 감사 결과는 위 의존성 항목으로 별도 추적하며, 자동 다운그레이드는 적용하지 않는다.

## 참고 자료

[1]: https://supabase.com/docs/guides/auth/password-security "Supabase Password security"
