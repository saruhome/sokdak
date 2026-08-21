# npm 전이 의존성 보안 영향 평가

**평가일:** 2026-08-21
**대상:** SokDak Expo SDK 57.0.15 프로젝트
**범위:** `npm audit`, `npm audit --omit=dev`, 잠금 파일 의존성 경로, 생성된 웹 번들, Metro 자산 처리 코드

## 결론

`@expo/ngrok` 제거 전 `npm audit`의 **16건**은 서로 독립된 16개의 런타임 취약점이 아니었다. 집계상 **8건 High, 8건 Moderate**이었지만, 경고의 대부분은 Expo·Metro 패키지가 같은 하위 취약점에 의존해 파생된 결과다. 확인된 직접 원인은 `image-size`의 무한 루프 DoS 두 건과 `uuid`의 버퍼 경계 검증 결함 한 건이다.[1] [2] [3]

SokDak의 실제 배포 웹 번들에는 `image-size`, `metro-transform-worker`, `@expo/ngrok` 문자열이 포함되지 않았다. 또한 Metro는 해당 `image-size`를 앱 자산의 폭·높이를 산출하는 **개발·번들 생성 시점**에 호출한다. 따라서 현재 위험은 설치된 Android/iOS/Web 앱 사용자를 직접 공격하는 경로보다, 악성 이미지 자산이 소스 트리 또는 빌드 환경에 유입될 때 개발자·CI의 Node.js 프로세스를 멈추게 할 수 있는 **개발·빌드 가용성 위험**에 가깝다.

| 평가 항목 | 전체 설치 기준 | `--omit=dev` 기준 | 판단 |
| --- | ---: | ---: | --- |
| npm audit 집계 | **High 8, Moderate 7 (총 15)** | **High 8, Moderate 7 (총 15)** | 사용되지 않는 `@expo/ngrok` 제거로 Moderate 1건이 해소됨 |
| Critical | 0 | 0 | 즉시 원격 코드 실행·데이터 유출로 분류된 항목 없음 |
| 웹 번들 내 빌드 도구 문자열 | `image-size` 0, `ngrok` 0, `metro-transform-worker` 0 | 해당 없음 | 생성된 웹 클라이언트에 도구 코드가 포함되지 않음 |
| 권장 조치 | 강제 자동 수정 금지 | SDK 정식 업그레이드 시 재평가 | `npm audit fix --force`는 Expo 53.0.27로 변경하려 하므로 현재 SDK 57과 호환되지 않음 |

## 취약점군별 영향 분석

| 취약점군 | npm audit 경로 | 취약점 조건 | SokDak의 실제 노출 | 위험도 | 권장 대응 |
| --- | --- | --- | --- | --- | --- |
| `image-size` ≤ 2.0.2 | `expo` → `@expo/metro` → `metro` → `image-size` | 공격자가 조작한 ICNS, JXL 또는 HEIF 버퍼를 파서에 전달하면 무한 루프로 Node.js 이벤트 루프가 멈춤 | Metro는 로컬 앱 자산의 크기 계산에 사용한다. 현재 프로필 사진·커뮤니티 이미지는 Supabase Storage 경로이며 Metro 자산 입력이 아니다. | **중간**: 개발자·CI DoS, **낮음**: 배포 앱 사용자 | 신뢰되지 않은 이미지 파일을 소스 자산·빌드 워크스페이스에 넣지 않는다. Expo가 수정 Metro를 포함하는 다음 호환 SDK를 제공하면 전체 SDK 업그레이드로 해결한다. |
| `uuid` < 11.1.1 | `@expo/config-plugins` → `xcode` → `uuid` | `v3`·`v5`·`v6` 호출이 외부 버퍼와 잘못된 offset을 함께 받을 때 부분 쓰기를 조용히 허용 | `xcode`는 iOS native 프로젝트 생성·설정의 개발 단계 패키지다. SokDak 앱 코드에서 해당 UUID API와 외부 버퍼를 호출하지 않는다. 별도 `@expo/ngrok` 개발 의존성과 하위 바이너리는 제거됐다. | **낮음**: 특수 API 호출 조건이 필요하고 최종 앱 런타임 경로가 아님 | Expo SDK 업그레이드 시 `xcode` 전이 버전을 다시 확인한다. |
| Expo·Metro 파생 패키지 13개 | `@expo/cli`, `@expo/config`, `@expo/config-plugins`, `@expo/metro`, `metro-config` 등 | 위 두 취약점군을 의존해 audit이 상위 패키지까지 영향 대상으로 표시 | 독립적인 추가 공격 경로가 확인된 것이 아니라 하위 취약점의 영향 전파다. | **상위 원인에 종속** | 패키지별 overrides나 단독 강제 업그레이드 대신 Expo SDK가 지원하는 정합 버전을 사용한다. |

> `image-size` 관련 두 GitHub Advisory는 기밀성·무결성 영향 없이 가용성 영향을 명시한다. 조작된 이미지 버퍼가 해당 Node.js 파서에 도달해야 한다는 조건이 핵심이다.[1] [2]

## 배포 경로 판단 근거

Metro의 `Assets.js`는 이미지 파일을 읽어 폭·높이를 구할 때 `image-size`를 호출한다. 이 코드는 `expo export -p web`와 개발 번들러가 실행되는 Node.js 환경의 자산 처리 코드다. 현재 생성된 `dist/_expo/static/js`를 점검한 결과 `image-size`, `ngrok`, `metro-transform-worker` 문자열은 각각 0개였다. 그러므로 웹 클라이언트가 이 Node.js 파서를 실행하는 구조는 아니다.

네이티브 Android/iOS 앱도 JavaScript 번들과 정적 자산을 포함해 배포하며, Metro의 Node.js 서버·빌드 도구 자체를 앱 프로세스에 포함하지 않는다. 다만 CI 또는 개발 머신에서 신뢰되지 않은 브랜치·압축 파일·자산을 빌드하는 경우에는 해당 빌드 프로세스가 DoS 영향을 받을 수 있으므로, 소스 자산 반입 통제를 유지해야 한다.

## 대응 우선순위

| 우선순위 | 조치 | 이유 | 시점 |
| --- | --- | --- | --- |
| P1 | `npm audit` 결과를 SDK 업데이트 때마다 재검토하고, CI 로그에 전체·`--omit=dev` 결과를 남긴다. | 취약점 원인이 Expo·Metro 전이 경로에 집중돼 있어 SDK 릴리스에 따라 상태가 바뀐다. | 매 SDK 패치·월 1회 |
| P1 | 신뢰되지 않은 이미지 파일을 `assets/` 또는 CI 빌드 입력에 직접 반입하지 않는다. 외부 이미지는 현재처럼 Storage에서 앱 런타임에 조회한다. | `image-size` 공격 조건을 차단하는 가장 직접적인 운영 완화책이다. | 즉시·상시 |
| 완료 | `@expo/ngrok` 개발 의존성과 하위 터널 바이너리를 제거했다. | Moderate 1건과 사용하지 않는 로컬 터널 바이너리 의존성이 제거됐다. | 2026-08-21 |
| P2 | Expo가 SDK 57 호환 Metro 수정 또는 다음 지원 SDK를 제공하면 별도 업그레이드 브랜치에서 업데이트·실기기 QA·전체 CI를 수행한다. | 현재 `npm audit fix --force`는 Expo를 53.0.27로 바꾸려 하므로 호환성·보안상 안전한 수정 경로가 아니다. | 지원 버전 확인 후 |
| P3 | 패키지 override로 `metro`, `image-size`, `uuid`를 강제 교체하지 않는다. | Expo SDK의 Metro·native 패키지 조합을 깨뜨릴 수 있고, 현재 최종 사용자 런타임 노출은 낮다. | 현재 보류 |

## 출시 판단

남은 15건만으로 비공개 베타 배포를 중단할 근거는 현재 확인되지 않았다. 단, **P0로 보지 않는 이유는 앱 사용자 런타임보다 개발·빌드 도구에서 조건부로 발생하는 가용성 위험이기 때문**이다. 반대로 외부 기여자가 임의 자산을 올리거나 CI가 신뢰되지 않은 압축 자산을 자동 빌드하는 운영 방식으로 바뀌면 `image-size` 위험은 P1으로 상향해야 한다.

## @expo/ngrok 안전 제거·재도입 절차

제거 전에는 Git 추적 파일에서 `@expo/ngrok`, `expo start --tunnel`, `--tunnel`, `ngrok`를 검색하고, `package.json` 스크립트가 `expo start`, `expo start --web`, `expo run:android`, `expo run:ios`만 사용함을 확인했다. SokDak에는 터널을 호출하는 스크립트·코드·워크플로가 없었으므로 아래 절차로 제거했다.

| 단계 | 명령 또는 확인 | 안전 기준 |
| --- | --- | --- |
| 1 | `git grep -n -i -E '@expo/ngrok|expo[[:space:]]+start.*--tunnel|--tunnel|\bngrok\b'` | 잠금 파일·의존성 선언 이외의 사용처가 없어야 함 |
| 2 | `npm uninstall --save-dev @expo/ngrok` | `package.json`·`package-lock.json`에서 패키지와 하위 바이너리가 함께 제거됨 |
| 3 | `npm run test:ci`, `npm run typecheck`, `npx expo-doctor`, `npm run build` | 앱 동작·Expo 정합성·웹 번들이 모두 통과해야 함 |
| 4 | `npm audit`, `npm audit --omit=dev` | 전체·운영 설치 모두 15건(High 8, Moderate 7)인지 확인 |

**제거 후 검증 결과:** 전체·`--omit=dev` 감사 모두 High 8, Moderate 7, 총 15건으로 일치했다. Jest 24개 스위트·99개 테스트, TypeScript 검사, Expo Doctor 21/21, 웹 프로덕션 번들도 통과했다.

향후 원격 기기에서 로컬 개발 서버에 접속해야 해 터널이 필요해지면, 별도 브랜치에서 `npm install --save-dev @expo/ngrok`를 실행하고 `expo start --tunnel`을 명시적으로 사용한다. 재도입 후에는 동일한 회귀 검사와 `npm audit`을 수행하며, 무단 터널 노출을 기본 개발 흐름에 추가하지 않는다.

이 평가는 실제 Android/iOS 실기기 QA, Supabase RLS, private 미디어 처리, 정책 전문·권리 확인과 별개의 Node.js 공급망 위험 평가다. 향후 Expo SDK 업그레이드 전에는 동일한 `npm audit`, `expo-doctor`, 전체 Jest·TypeScript·웹 번들·실기기 QA를 함께 다시 수행한다.

## 참고 자료

[1]: https://github.com/advisories/GHSA-w3rx-r6r6-pgpr "GitHub Advisory: image-size ICNS parser infinite-loop DoS"
[2]: https://github.com/advisories/GHSA-5p2g-fcmc-qvqq "GitHub Advisory: image-size JXL/HEIF parser infinite-loop DoS"
[3]: https://github.com/advisories/GHSA-w5hq-g745-h8pq "GitHub Advisory: uuid external output buffer bounds check"
