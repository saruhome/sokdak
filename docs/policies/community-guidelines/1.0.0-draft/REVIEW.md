# 커뮤니티 운영정책 1.0.0-draft — 검수 문서

> **DRAFT 검수용.** 6개 locale 초안(ko/en/ja/es/vi/de)은 전부 조항 1~8 동일 구조이며
> 한국어(ko.md)가 canonical 원문이다. 이 문서의 서명란이 채워지기 전에는 어떤 문서도
> production seed에 사용할 수 없다. 법률 자문이 아니며, 법률 검토는 별도 항목이다.

## 1. 번역 대응 관계

모든 번역은 ko.md와 문단 단위로 1:1 대응한다(조항 번호·불릿 순서 동일).
대조 방법: 각 파일의 `## N.` 헤더와 불릿 수를 비교한다(아래 §4 검증 명령).

## 2. 원문↔번역 의미 차이 및 검수 필요 문장

| 위치 | 내용 | 검수 필요 사유 |
|---|---|---|
| 전체 §5-3 "관련 기관에 협조" | en "cooperate with the relevant authorities" 등 | 법적 의무 표현 강도가 locale마다 다르게 읽힐 수 있음 — **법률 검토 필요** |
| 전체 §3-3 "개인정보 처리방침을 따릅니다" | 각 언어의 공식 문서명 | 실제 게시될 개인정보 처리방침의 공식 번역 명칭과 일치시켜야 함(아직 미확정) |
| ja §2/§6 "カスタマーセンター" | 앱 내 고객센터 메뉴명 | 앱 ja 번역(languageStore)의 실제 메뉴 표기와 일치 여부 확인 |
| de 전체 | du(비격식) 호칭 사용 | 앱 de 번역의 호칭 컨벤션(du/Sie)과 일치 여부 확인 |
| vi §5 "ban quản trị" / es §5 "los operadores" | '운영자' 역어 | 앱 내 기존 역어와 통일 여부 확인 |
| 전체 §1-2 "청소년에게 유해한" | 각국 청소년 보호 법제 용어 | 원문은 한국 정서의 표현 — 번역이 과소/과대 번역인지 **법률 검토 필요** |
| 전체 §7-2 재동의 요구 | — | migration 동작(신버전 활성화 시 다음 참여 때 재동의)과 일치함 — 사실 확인만 |

## 3. 검수자 체크리스트

- [ ] ko.md 원문이 서비스 실태(신고·차단·고객센터·moderation 기능)와 일치한다
- [ ] 6개 파일 모두 조항 1~8 구조·불릿 수가 일치한다 (§4 명령으로 확인)
- [ ] §2의 의미 차이 항목을 모두 확인하고 필요한 수정을 반영했다
- [ ] 법률 검토 완료 (특히 §2 표의 법률 검토 표시 항목)
- [ ] 각 문서에서 DRAFT 헤더 제거 + 버전을 확정 semver(예: 1.0.0)로 변경했다
- [ ] 디렉토리를 `1.0.0-draft/` → 확정 버전으로 rename했다
- [ ] 확정 문서를 불변 URL(`https://<도메인>/policies/community-guidelines/<버전>/<locale>`)에 게시했다
- [ ] 게시된 파일 그대로 SHA-256을 계산했다 (§5)

**승인 서명**

| 역할 | 이름 | 승인일 | 서명 |
|---|---|---|---|
| 콘텐츠 검수 | | | |
| 법률 검토 | | | |
| 최종 승인(운영) | | | |

## 4. 구조 일치 검증 명령

```bash
for f in ko en ja es vi de; do
  echo "$f: $(grep -c '^## ' docs/policies/community-guidelines/1.0.0-draft/$f.md) sections"
done
# 전부 8이어야 한다.
```

## 5. Seed 준비 (검수 완료 후에만)

seed 구조는 기존 [docs/operations/community-policy-seed-template.sql](../../operations/community-policy-seed-template.sql)를
그대로 사용한다 — 새 템플릿을 만들지 않는다. 채워야 하는 값:

| placeholder | 값의 출처 |
|---|---|
| `<SEMVER_EG_1.0.0>` | 검수 승인 시 확정 (초안: 1.0.0) |
| `<EFFECTIVE_AT_ISO8601>` | 운영 결정(시행일) |
| `<PUBLIC_DOMAIN>` | 정책 문서 호스팅 도메인 — **미확정, 결정 필요** |
| `<SHA256_OF_*_DOCUMENT>` | 게시된 최종 파일에서: `shasum -a 256 <locale>.md` |

⚠️ URL과 SHA-256은 **실제 게시된 불변 문서**에서만 계산한다 — 이 draft 단계에서는
생성하지 않는다(위조 금지). 이후 절차는
[community-policy-production-rollout.md](../../operations/community-policy-production-rollout.md) §2~§4를 따른다.
