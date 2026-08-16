# GitHub Actions 품질 게이트 반영 가이드

**대상 파일:** `.github/workflows/quality.yml`
**현재 상태:** 해당 파일은 로컬 작업공간에 있으나, 연결된 GitHub App 토큰에는 `Workflows` 쓰기 권한이 없어 자동 푸시가 거부되었다. 애플리케이션 코드와 정책 동의 원장 커밋 `1681ea4`는 `main`에 반영되었고, 이 워크플로 파일만 별도로 반영하면 된다.

## 1. 오류의 의미

실제 오류는 다음과 같았다.

> `refusing to allow a GitHub App to create or update workflow .github/workflows/quality.yml without workflows permission`

이 오류는 저장소 `Contents` 쓰기 권한만으로는 `.github/workflows/` 아래 파일을 생성·수정할 수 없다는 뜻이다. GitHub는 Actions 파일을 편집하는 GitHub App에 별도의 **Repository permission: Workflows — Read and write**를 요구한다.[1] 워크플로 YAML 안의 `permissions: contents: read`는 실행 중인 `GITHUB_TOKEN`의 권한을 제한하는 설정일 뿐, 이 파일을 Git에 푸시하는 인증 주체의 권한을 높이지는 않는다.[2]

| 구분 | 필요한 권한 | 적용 대상 |
| --- | --- | --- |
| 워크플로 파일을 Git에 추가·수정 | `Contents: write` + `Workflows: write` | GitHub App 또는 개인 액세스 토큰 |
| 워크플로 실행 중 소스 체크아웃 | `contents: read` | YAML의 `permissions` 블록 |
| Actions를 실행하도록 허용 | Repository Settings의 Actions 정책 | 저장소 설정 |

## 2. 권장 경로: GitHub 웹 UI에서 수동 반영

이 저장소는 개인 저장소이므로, 가장 짧고 안전한 경로는 **본인 GitHub 계정의 웹 UI에서 워크플로 파일만 수동 커밋**하는 방법이다. GitHub는 `.github/workflows/<name>.yml` 경로에 새 파일을 만들고 커밋하는 절차를 공식적으로 지원한다.[3]

1. [saruhome/sokdak](https://github.com/saruhome/sokdak) 저장소의 `main` 브랜치를 연다.
2. **Add file → Create new file**을 선택한다.
3. 파일명에 정확히 `.github/workflows/quality.yml`을 입력한다. 경로가 없더라도 GitHub가 디렉터리를 함께 만든다.[3]
4. 로컬의 `quality.yml` 전체 내용을 붙여 넣는다. 파일은 Node 22, `npm ci`, TypeScript 검사, Expo 진단, 릴리스 구성 검사, migration 파일 존재 검사, 웹 번들 빌드를 수행한다.
5. **Commit changes**에서 권장 방식인 새 브랜치와 Pull Request를 선택한다. 혼자 운영하는 비공개 베타 직전의 작은 저장소라면 `main` 직접 커밋도 가능하지만, 첫 CI 실행 결과를 검토할 수 있는 PR 방식이 더 안전하다.
6. PR을 열었다면 변경 경로가 `.github/workflows/quality.yml` 하나인지 확인하고 병합한다.
7. 저장소의 **Actions** 탭에서 `Quality Gate` 실행을 연다. `Validate TypeScript`, `Validate Expo project health`, `Validate release configuration contract`, `Validate migration files`, `Build production web bundle`가 모두 성공해야 한다.

GitHub Actions가 비활성화되어 있거나 조직 정책으로 제한되어 있다면 **Settings → Actions → General**에서 Actions 사용을 허용해야 한다. 외부 액션을 제한하는 정책을 선택한 경우에는 이 워크플로가 사용하는 `actions/checkout@v4`와 `actions/setup-node@v4`를 허용 목록에 포함한다.[4]

## 3. 자동 푸시를 계속 사용하려는 경우

### 3.1 현재 연결 GitHub App의 권한을 바꿀 수 있는 경우

GitHub App을 직접 소유·관리하는 경우에만 이 경로를 쓴다. GitHub App 등록 화면에서 다음을 수행한다.

1. GitHub **Settings → Developer settings → GitHub Apps → 해당 App → Permissions & events**로 이동한다.
2. **Repository permissions**에서 `Contents`를 **Read and write**, `Workflows`를 **Read and write**로 설정한다.
3. 변경사항을 저장한다.
4. App이 개인 계정 또는 조직에 설치되어 있다면, 저장소 소유자가 새 권한을 **승인**하거나 App을 재설치한다. GitHub App의 새 권한은 각 설치 소유자의 승인 전까지 기존 권한으로 유지된다.[1]
5. 새 설치 액세스 토큰을 발급한 뒤, 동일한 push를 다시 수행한다.

> Manus 연동처럼 제3자가 소유한 GitHub App은 저장소 소유자가 App의 요청 권한을 변경할 수 없다. 이 경우 2장의 웹 UI 수동 반영 또는 3.2의 개인 토큰 방식을 사용한다.

### 3.2 본인 계정의 fine-grained personal access token 사용

GitHub는 새 자동화에 대해 classic PAT보다 **fine-grained PAT**를 우선 권장한다. fine-grained 토큰은 특정 소유자와 특정 저장소로 범위를 좁힐 수 있다.[5]

1. GitHub **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**으로 이동한다.
2. Resource owner로 `saruhome`을 선택하고, Repository access를 **Only select repositories**로 설정한 뒤 `sokdak`만 선택한다.
3. 만료일을 짧게 설정한다. 한 번의 CI 파일 반영이라면 7~30일이 적절하다.
4. Repository permissions에서 아래 두 항목만 **Read and write**로 설정한다.
   - **Contents**
   - **Workflows**
5. 토큰을 생성하고 비밀번호처럼 보관한다. 채팅, 이슈, 소스 파일, `.env`에 붙여 넣지 않는다.
6. 개인 로컬 개발 환경에서만 그 토큰으로 인증한 뒤 push한다. GitHub 공식 예시도 workflow 편집이 필요한 push 토큰에 `contents=write`와 `workflows=write`를 함께 지정한다.[5]
7. 정상 반영 후 토큰을 철회하거나 만료되도록 둔다.

이 토큰을 본 작업 환경이나 자동화 시스템에 공유할 필요는 없다. 수동 반영이 가능하다면 토큰을 새로 만드는 것보다 웹 UI 방식이 더 안전하다.

## 4. 첫 실행 통과 기준

| 점검 지점 | 기대 결과 | 실패 시 첫 대응 |
| --- | --- | --- |
| Actions 탭에 `Quality Gate` 표시 | `main` push 또는 PR마다 실행 생성 | `.github/workflows/quality.yml` 경로와 `.yml` 확장자 확인 |
| `npm ci` | lockfile과 package.json 일치 | 로컬 Node 22에서 lockfile을 갱신하고 재커밋 |
| TypeScript | `npm run typecheck` 통과 | 오류 파일을 수정 후 재실행 |
| Expo Doctor | 치명적 의존성·구성 오류 없음 | Expo 진단 출력을 기준으로 SDK·의존성 정리 |
| 릴리스 구성 | `npm run check:release-config` 통과 | 환경변수 계약과 `app.json` 확인 |
| migration 검사 | SQL 파일이 비어 있지 않음 | 빈 migration 파일 제거 또는 완성 |
| 웹 번들 | `npm run build` 성공 | 번들 오류를 수정; Android 우선이어도 CI의 정적 검증 역할을 유지 |

## 참고문헌

[1] [GitHub Docs — Choosing permissions for a GitHub App](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app)
[2] [GitHub Docs — Use GITHUB_TOKEN for authentication in workflows](https://docs.github.com/actions/reference/authentication-in-a-workflow)
[3] [GitHub Docs — Quickstart for GitHub Actions](https://docs.github.com/en/actions/writing-workflows/quickstart)
[4] [GitHub Docs — Managing GitHub Actions settings for a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository)
[5] [GitHub Docs — Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
