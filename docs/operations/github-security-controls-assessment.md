# GitHub 무료 보안 통제 적용 계획

**평가일:** 2026-08-22
**대상:** 공개 GitHub 저장소 `saruhome/sokdak`
**목적:** 비공개 베타 전 공급망·정적 코드·비밀정보 유출 탐지를 무료 GitHub 기능으로 보강한다.

## 현재 상태

2026-08-22 GitHub API 조회 시 `dependabot_security_updates`, `secret_scanning`, `secret_scanning_push_protection`, `secret_scanning_non_provider_patterns`, `secret_scanning_validity_checks`는 모두 `disabled`였다. Dependabot의 automated security fixes도 `enabled: false`였고, CodeQL default setup은 `not-configured` 상태였다. 현재 저장소에는 Quality Gate만 있고 Dependabot 또는 CodeQL 구성 파일은 없다.

같은 날 적용 후 Dependabot alerts·Dependabot security updates·automated security fixes·secret scanning·repository push protection은 활성화됐다. CodeQL default setup은 `actions`, `javascript-typescript` 언어와 기본 쿼리 모음·원격 위협 모델로 구성되었고 첫 분석 실행 ID `32558685946`이 생성됐다. `secret_scanning_non_provider_patterns`와 `secret_scanning_validity_checks`는 GitHub가 `disabled`로 유지했으며, 이 두 세부 옵션은 현재 저장소 설정에서 무료로 활성화 가능한 범위가 아니므로 사용 가능한 제공자 패턴 기반 Secret Protection만 적용한다.

첫 CodeQL 분석은 두 언어 작업 모두 성공했고, Code scanning 화면에서 `0 Open`, `0 Closed` 경고 및 도구 정상 상태를 확인했다. Secret scanning은 `0 Open`, `0 Closed`였으며 미해결 비밀정보를 발견하지 못했다. Dependabot은 `image-size` High 2건과 `uuid` Moderate 1건, 총 3개를 `package-lock.json`에서 탐지했다. 이는 기존 npm audit 분석과 같은 근본 원인을 경고 단위로 표시한 것이며, `image-size`에 패치 버전이 없는 점과 Expo SDK 정합성 제약은 기존 전이 의존성 보안 평가 문서를 따른다.

## 적용 원칙

공개 저장소에서는 GitHub Actions가 활성화되어 있으면 CodeQL default setup을 무료로 활성화할 수 있다.[1] JavaScript/TypeScript와 GitHub Actions 워크플로를 검사 범위로 포함하고, 기본 쿼리 모음과 원격 위협 모델을 사용한다. CodeQL 기본 설정은 저장소 외부에서 관리되므로 별도의 워크플로 YAML을 추가하지 않는다.

Dependabot alerts와 Dependabot security updates를 활성화해 알려진 취약 의존성에 대한 보안 업데이트 pull request를 생성하도록 한다. automated security fixes도 활성화하되, 앱·Expo SDK 정합성 영향을 고려해 pull request의 병합은 기존 Quality Gate와 사람 검토를 거치며 자동 병합 정책은 추가하지 않는다.[2]

Secret Protection과 저장소 수준 push protection은 공개 저장소에서 민감한 토큰·자격 증명이 Git 이력에 도달하기 전에 탐지·차단하기 위한 통제로 구성한다. 탐지 차단이 발생하면 실제 비밀정보가 포함됐는지 먼저 확인하고, 포함됐다면 즉시 자격 증명을 폐기·교체한 다음 깨끗한 변경으로 다시 푸시한다. 테스트용 값 또는 오탐은 우회 사유를 남기되 비밀값처럼 보이는 임의 문자열을 새로 만들지 않는다.[3] [4]

## 적용·검증 기준

| 통제 | 목표 상태 | 검증 기준 | 변경 영향 |
| --- | --- | --- | --- |
| Dependabot alerts | 활성화 | Security 탭에서 경고 감시 상태 확인 | 알려진 의존성 취약점 알림 |
| Dependabot security updates | 활성화 | 보안 업데이트 pull request 허용 상태 확인 | 업데이트 PR 생성 가능 |
| Automated security fixes | 활성화 | API가 `enabled: true` 반환 | 업데이트 PR 제안 자동화, 자동 병합 없음 |
| Secret scanning | 활성화 | Security 탭에서 Secret Protection 활성화 확인 | 과거·신규 커밋의 제공자 패턴 탐지 |
| Push protection | 활성화 | Security 탭과 푸시 보호 상태 확인 | 신규 비밀정보 푸시 차단 가능 |
| CodeQL default setup | 활성화 | default setup API가 `configured`, 첫 분석 성공 | JS/TS 및 GitHub Actions 정적 분석 |

## 제약과 후속 처리

GitHub 토큰 또는 앱 권한으로 보안 설정 변경이 거절되면, 로그인된 GitHub 웹 UI에서 동일 설정을 활성화한다. CodeQL 또는 Dependabot이 생성한 경고·업데이트는 취약점의 실제 도달 가능성, Expo SDK 호환성, Quality Gate 결과를 검토한 뒤 처리한다. 알림이나 분석 결과가 없다는 사실을 취약점 부재의 증명으로 보지는 않는다.

## 참고 자료

[1]: https://docs.github.com/code-security/code-scanning/enabling-code-scanning/configuring-default-setup-for-code-scanning "GitHub Docs: Configuring default setup for code scanning"

[2]: https://docs.github.com/github/managing-security-vulnerabilities/configuring-dependabot-security-updates "GitHub Docs: Configuring Dependabot security updates"

[3]: https://docs.github.com/en/code-security/how-tos/secure-your-secrets/detect-secret-leaks/enable-secret-scanning "GitHub Docs: Enabling secret scanning for your repository"

[4]: https://docs.github.com/en/code-security/concepts/secret-security/push-protection "GitHub Docs: Push protection"
