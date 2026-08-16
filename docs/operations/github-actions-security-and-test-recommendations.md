# GitHub Actions 보안 검증 및 자동 테스트 권고안

**대상:** SokDak Expo 57 · React Native 0.86 · TypeScript · Supabase 기반 Android 우선 비공개 베타
**기준 워크플로:** `.github/workflows/quality.yml`
**작성일:** 2026-08-16

## 1. 현재 상태와 판단 기준

현재 품질 게이트는 Node 22 고정, `npm ci`, TypeScript 검사, Expo 진단, 릴리스 설정 계약 검사, 비어 있는 migration 파일 검사, 웹 번들 빌드를 수행한다. 이는 좋은 출발점이지만, 현재 프로젝트에는 테스트 러너·테스트 파일이 없고, 의존성 변경·비밀 유출·코드 보안 분석을 PR 단계에서 차단하는 장치가 없다.

또한 현재 `npm audit --omit=dev --audit-level=high` 결과는 **15개 high, 7개 moderate** 취약점이다. 확인된 high 항목은 Expo/Metro 개발·번들 도구 체인의 `image-size` 취약점에 연결되어 있다. 자동 `npm audit fix --force`는 Expo를 호환되지 않는 버전으로 내릴 수 있으므로 실행하면 안 된다. 이 상태에서는 high를 즉시 실패 조건으로 삼으면 모든 CI가 막히므로, 먼저 critical만 차단하고 Expo SDK 호환 업데이트로 high 항목을 별도 해소하는 것이 현실적이다.

> 권장 원칙은 **새로운 치명적 위험은 즉시 차단하고, 기존 위험은 명시적으로 추적하며, 핵심 사용자 흐름은 빠른 테스트로 보호**하는 것이다.

## 2. 비공개 베타 전 P0: 바로 추가할 항목

| 우선순위 | 단계 | 차단 대상 | 권장 트리거 | 도입 난이도 |
| --- | --- | --- | --- | --- |
| P0 | GitHub Secret Protection / Push Protection | API 키·토큰·개인키의 저장소 유입 | Push 시점 | 설정만 필요 |
| P0 | Dependency Review | PR이 새로 도입하는 high/critical runtime 취약점 | Pull request | 낮음 |
| P0 | `npm audit` critical gate | 현재 또는 새 critical 의존성 취약점 | PR·main | 낮음 |
| P0 | 정책 동의 단위·컴포넌트 테스트 | 동의 RPC 파라미터, 동의 전 쓰기 차단 UX, locale 전달 회귀 | PR·main | 중간 |
| P0 | 권한 최소화·checkout hardening | 워크플로 토큰 오남용·자격증명 잔존 | 모든 CI | 낮음 |

### 2.1 GitHub Secret Protection 및 Push Protection

워크플로보다 먼저 저장소 설정에서 비밀 탐지와 Push Protection을 활성화한다. 이 기능은 자격증명·토큰이 Git 이력에 들어가기 **전에** push를 차단하므로, 커밋 이후 실행되는 CI보다 방어 위치가 앞선다.[1] 저장소의 **Settings → Advanced Security → Secret Protection → Push protection**에서 활성화한다.

현재 `quality.yml`에는 `.test` URL과 placeholder publishable key만 있어 실제 비밀을 넣지 않는다. Supabase 서비스 역할 키, Expo/EAS 토큰, 이메일 API 키, GitHub PAT는 GitHub Secrets 또는 EAS Secrets에만 보관한다. 저장소 플랜 또는 공개/비공개 상태상 GitHub Secret Protection을 쓸 수 없다면, P1로 Gitleaks 또는 TruffleHog 기반 CI 스캔을 도입하되, 첫 선택은 GitHub의 native Push Protection이다.

### 2.2 PR Dependency Review

Dependency Review는 PR의 의존성 차이를 검사해 새로 추가되는 알려진 취약점과 라이선스 조건을 실패로 만들 수 있다.[2] 기존 Expo 체인의 high 항목 때문에 전체 lockfile을 매번 막지 않으면서도, **새로운 high/critical runtime 위험**은 도입 순간 차단하는 데 적합하다.

새 파일 `.github/workflows/dependency-review.yml`의 최소 구성은 다음과 같다.

```yaml
name: Dependency Review

on:
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
      - uses: actions/dependency-review-action@v4
        with:
          fail-on-severity: high
          fail-on-scopes: runtime
```

첫 2주 동안은 라이선스 allowlist/denylist를 추가하지 않는다. 라이선스 정책을 먼저 정한 뒤에만 `allow-licenses` 또는 `deny-licenses`를 설정한다. 검토 없이 allowlist를 활성화하면 이미 사용 중인 Expo·React Native 전이 의존성 때문에 정상 PR이 과도하게 차단될 수 있다.

### 2.3 Critical 의존성 감사 게이트

`quality.yml`의 `npm ci` 직후에 아래 단계를 추가한다. `critical`만 실패 기준으로 지정하므로 현재 확인된 high 취약점 때문에 출시 파이프라인이 중단되지는 않는다.

```yaml
      - name: Block critical runtime dependency vulnerabilities
        run: npm audit --omit=dev --audit-level=critical
```

`npm audit`의 보고서는 CI 로그에 남기고, 현재 15개 high는 별도 보안 부채 이슈로 등록한다. 해당 이슈에는 취약 경로(현재 `image-size` → Metro/Expo), 영향 범위(빌드·개발 도구), Expo 호환 업데이트 후보, 재검토 날짜를 기록한다. `npm audit fix --force`는 SDK 하향 또는 호환성 붕괴를 유발할 수 있으므로, **EAS/Expo 호환 매트릭스를 확인한 명시적 SDK 업데이트 PR**로만 해결한다.

### 2.4 정책 동의 흐름의 첫 자동 테스트

현재에는 테스트 프레임워크와 테스트 파일이 없다. Expo는 `jest-expo`와 React Native Testing Library 조합을 공식적으로 안내하며, React 19 이상에서는 deprecated `react-test-renderer` 대신 Testing Library를 사용하도록 권장한다.[3]

도입 명령과 CI용 script는 다음과 같이 제한한다.

```bash
npx expo install jest-expo jest @types/jest @testing-library/react-native --dev
```

```json
{
  "scripts": {
    "test": "jest --watchAll",
    "test:ci": "jest --ci --runInBand"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
```

첫 PR에서 작성할 테스트는 UI 전체를 광범위하게 덮는 것이 아니라, 이번 출시 P0의 불변 조건 네 가지를 지킨다.

| 테스트 대상 | Given | When | Then |
| --- | --- | --- | --- |
| `authStore.hasAcceptedCommunityGuidelines` | 로그인된 사용자와 RPC true | 상태 확인 | true를 반환 |
| 동의 상태 오류 처리 | RPC 오류 또는 false | 상태 확인 | false를 반환하고 쓰기를 열지 않음 |
| `acceptCommunityGuidelines` | `ja`, `es`, `vi` locale | 동의 제출 | `p_locale`·`p_source`가 RPC에 정확히 전달 |
| 가이드라인 화면 | 체크되지 않은 상태 | 버튼 누르기 | 동의 RPC가 호출되지 않음 |
| 가이드라인 화면 | 체크된 상태 | 동의 버튼 누르기 | 성공 시 커뮤니티 참여 경로로 진행 |

`quality.yml`에 추가할 단계는 다음이다.

```yaml
      - name: Run unit and component tests
        run: npm run test:ci
```

테스트는 사용자가 실제로 보거나 누르는 문구·접근성 요소를 기준으로 작성한다. React Native는 컴포넌트 내부 state/props보다 사용자 관점의 상호작용 검증을 권장한다.[4]

### 2.5 워크플로 권한과 checkout hardening

현재 워크플로는 최상위 `permissions: contents: read`로 시작하므로 방향이 맞다. 이를 유지하고, 각 job에 정말 필요한 권한만 주며, checkout 자격증명이 작업 공간에 남지 않도록 아래 옵션을 넣는다.

```yaml
      - name: Check out source
        uses: actions/checkout@v4
        with:
          persist-credentials: false
```

향후 CodeQL job을 추가할 때만 해당 job에 `security-events: write`를 부여한다. 일반 품질 게이트에 `contents: write`, `pull-requests: write`, `id-token: write`를 추가하지 않는다.

## 3. 베타 중 P1: 높은 신뢰도를 위한 추가 단계

| 항목 | 도입 효과 | 권장 주기 | 전제 조건 |
| --- | --- | --- | --- |
| CodeQL default setup | TypeScript·JavaScript 및 Actions YAML의 보안 정적 분석 | PR·main·주간 | GitHub Code Scanning 사용 가능 |
| Supabase schema contract test | RLS, RPC grant, 동의 원장, 게시 트리거의 회귀 방지 | PR | 격리된 로컬/스테이징 DB |
| Maestro Android E2E | 실제 Android 화면에서 가입·동의·게시 흐름 확인 | main·릴리스 후보 | 테스트 계정·에뮬레이터 또는 EAS workflow |
| workflow lint | Actions YAML 문법 및 위험한 설정 조기 발견 | PR | actionlint 또는 동등 도구 선택 |
| SBOM 생성 | 배포 시점 의존성 구성의 추적·사고 대응 | main·릴리스 | CycloneDX 등 도구 선정 |

### 3.1 CodeQL

CodeQL은 JavaScript/TypeScript와 GitHub Actions workflow를 지원하며, 취약점·오류를 code scanning alert로 게시한다.[5] 초기에는 GitHub의 **Code scanning → Set up → Default** 방식을 권장한다. 언어·이벤트·기본 쿼리 선택을 GitHub가 관리하므로, 별도 YAML을 즉시 복잡하게 만들 필요가 없다. 알림 품질이 안정되면 advanced setup에서 `javascript-typescript`와 security-extended query suite로 세분화한다.

### 3.2 Supabase schema contract test

정책 동의 시스템에서 가장 위험한 회귀는 UI가 아니라 서버 강제의 약화다. 운영 DB가 아니라 Docker 기반 로컬 Supabase 또는 전용 스테이징 프로젝트에 migration을 적용한 뒤, 아래 계약을 자동 확인한다.

1. `community_policy_versions`, `community_policy_locales`, `community_policy_consents`에 RLS가 활성화되어야 한다.
2. `anon`은 동의 RPC를 실행할 수 없어야 하고, `authenticated`만 실행할 수 있어야 한다.
3. active 정책 1개와 published locale 5개가 없으면 게시·댓글 INSERT가 거부되어야 한다.
4. 정책 동의 전에는 게시·댓글 INSERT가 `42501`로 거부되어야 한다.
5. 동의 후에는 해당 locale과 SHA-256이 원장에 기록되고 게시·댓글 INSERT가 성공해야 한다.
6. 같은 사용자·같은 정책 버전의 재동의는 행을 추가하지 않아야 한다.

이 테스트는 Supabase CLI와 Docker 준비가 필요한 만큼 P1로 둔다. 다만 정책 개정 또는 RLS migration PR에는 병합 필수 검사로 승격하는 것이 바람직하다.

### 3.3 Android E2E

Android 우선 출시이므로 최소 하나의 Android E2E 흐름을 확보한다. Expo도 UI snapshot보다 E2E 테스트를 권장하고, Maestro를 EAS Workflows에서 사용하는 경로를 안내한다.[3] 첫 flow는 다음만 덮는다.

1. 신규 또는 정책 미동의 테스트 계정으로 로그인한다.
2. Community 탭에 진입해 온보딩과 가이드라인 전문 링크를 확인한다.
3. 체크 전 CTA가 비활성인지 확인한다.
4. 영어 또는 일본어에서 동의한다.
5. 테스트 게시글을 작성해 성공을 확인한다.
6. 정책 개정 fixture에서는 재동의 게이트가 다시 나타나는지 확인한다.

E2E는 느리고 flaky할 수 있으므로 모든 PR에 실행하지 않는다. `main` 병합 후, 매일 야간, 그리고 Android 베타 후보 빌드에 실행한다.

## 4. P2: 안정화 이후에 검토할 항목

P2는 보안 성숙도를 높이지만 현재 비공개 베타의 출시 차단 요건은 아니다. 여기에는 full-SHA action pinning과 Dependabot 업데이트 PR 자동화, SBOM 생성·보관, 사전 정의된 라이선스 정책, 서드파티 보안 스캐너, 커버리지 임계치가 포함된다. 특히 커버리지 퍼센트는 테스트가 없는 상태에서 숫자만 목표로 삼으면 품질을 보장하지 못하므로, 정책 동의·인증·작성 권한 같은 위험도 높은 흐름을 먼저 테스트한 뒤 기준을 설정한다.

## 5. 권장 도입 순서와 완료 기준

| 순서 | 산출물 | 완료 기준 |
| --- | --- | --- |
| 1 | GitHub Secret Protection 설정 | Push Protection이 활성화되고 테스트용 비밀 문자열로 차단 동작을 확인 |
| 2 | Dependency Review workflow | 고위험 runtime 의존성을 새로 추가한 테스트 PR이 실패 |
| 3 | `npm audit` critical gate | main과 PR에서 critical 취약점이 있으면 job 실패 |
| 4 | Jest·Testing Library와 정책 동의 테스트 5개 | `npm run test:ci`가 CI에서 녹색, 위 P0 불변 조건을 덮음 |
| 5 | checkout hardening | 모든 checkout에 `persist-credentials: false`, 기본 권한은 read-only |
| 6 | CodeQL default setup | TypeScript 및 Actions workflow 분석 결과가 Security 탭에 표시 |
| 7 | 격리 DB contract test와 Android E2E | 정책 동의 핵심 흐름이 운영 DB와 분리된 환경에서 반복 검증 |

## 참고문헌

[1] [GitHub Docs — Enabling push protection for your repository](https://docs.github.com/en/code-security/how-tos/secure-your-secrets/prevent-future-leaks/enable-push-protection)
[2] [GitHub Docs — Configuring the dependency review action](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/manage-your-dependency-security/configure-dependency-review-action)
[3] [Expo Docs — Unit testing with Jest](https://docs.expo.dev/develop/unit-testing/)
[4] [React Native Docs — Testing overview](https://reactnative.dev/docs/testing-overview)
[5] [GitHub Docs — Code scanning with CodeQL](https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql)
