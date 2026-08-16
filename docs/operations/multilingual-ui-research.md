# SokDak 다국어 UI 조사 근거

## 국제화 공통 원칙

W3C 국제화 권고는 로컬라이즈 가능한 텍스트에 언어를 연결하고, 콘텐츠 범위가 바뀔 때 언어 선언도 바꾸며, BCP 47 언어 태그를 사용할 것을 제시한다. 또한 텍스트 방향과 문자 처리, 문자열 길이 제한·검색·정렬·타이포그래피를 국제화 설계 항목으로 포함한다.[1]

Material Design의 RTL 가이드는 아랍어 같은 RTL 언어에서 텍스트만 오른쪽 정렬하는 것이 아니라 레이아웃의 흐름과 방향성 있는 아이콘을 함께 미러링해야 한다는 원칙을 다룬다.[2]

## SokDak에 대한 즉시 의미

- 현재 언어 코드는 `ko`, `en`, `ja`, `vi`, `es` 다섯 가지로 한정되어 있고 중국어·아랍어용 로케일과 RTL 방향 전환 구조가 없다.
- 모든 공통 텍스트는 `NotoSerifKR_400Regular`을 기본 폰트로 강제한다. 일본어 CJK, 베트남어 라틴 확장, 스페인어 라틴, 미래 아랍어의 가독성을 언어별로 검증·분리해야 한다.
- 아랍어 확장 시에는 오른쪽 정렬만으로 부족하며, 뒤로가기·Chevron·가로 캐러셀·정렬·메타데이터·탭 흐름을 논리적 시작/끝 속성 기반으로 전환해야 한다.

[1]: https://www.w3.org/TR/international-specs/
[2]: https://m3.material.io/foundations/layout/bidirectionality-rtl

## Android·서체 검증 근거

Android의 의사 로케일은 문자열 확장, 하드코딩 문구, 문자열 결합, 혼합 방향 텍스트, RTL 미러링 오류를 출시 전에 찾도록 설계되어 있다. `en-XA`는 영어 텍스트를 확장해 레이아웃 깨짐을 드러내고, `ar-XB`는 RTL 방향을 모사한다.[3]

Google Fonts의 Noto Sans JP는 일본어에 필요한 히라가나·가타카나·한자를 지원하며, 한국어·라틴 문자도 함께 지원한다. 일본어·중국어·한국어는 한자 계열 글리프의 언어별 형태와 읽기 밀도가 달라, `NotoSerifKR` 하나를 모든 본문에 기본 적용하는 방식보다 언어별 폰트 체인을 두는 편이 안전하다.[4]

[3]: https://developer.android.com/guide/topics/resources/pseudolocales
[4]: https://fonts.google.com/noto/specimen/Noto+Sans+JP
