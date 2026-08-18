# 캐릭터 포즈 에셋

이 디렉터리의 PNG는 사용자가 SokDak GitHub 저장소에 추가한 호랭이·짹이 원본 시트에서 앱 UI에 필요한 포즈만 무손실 crop한 파일입니다. 원본 파일은 `assets/캐릭터일러스트_티콘파이_*.png`에 보존되어 있으며, 아래 대응 관계를 유지합니다.

| 앱용 파일 | 원본 시트 | 사용 목적 |
|---|---|---|
| `jjaeki-question.png` | `캐릭터일러스트_티콘파이_짹이.png` | 사전 검색 결과 없음 |
| `jjaeki-reading.png` | `캐릭터일러스트_티콘파이_짹이.png` | 향후 학습 안내 |
| `jjaeki-wave.png` | `캐릭터일러스트_티콘파이_짹이.png` | 향후 환영·완료 안내 |
| `horang-reading.png` | `캐릭터일러스트_티콘파이_호랭 (3).png` | 저장 단어 없음 |
| `horang-question.png` | `캐릭터일러스트_티콘파이_호랭 (3).png` | 향후 도움말·검색 안내 |
| `horang-cheer.png` | `캐릭터일러스트_티콘파이_호랭 (3).png` | 향후 학습 완료·격려 |

원본 시트에는 `tCorn pie` 서명이 보입니다. 공개 스토어 출시와 상업적 사용 전에 해당 일러스트의 상업적 이용, 수정·crop, 배포 조건 및 필요한 표기를 권리자와 확인해야 합니다. 이 확인 전에는 캐릭터를 광고 소재나 유료 상품의 핵심 시각 자산으로 확대 사용하지 않습니다.

## 투명 배경 앱용 복사본

앱 화면은 흰 배경이 없는 `assets/characters/transparent/`의 PNG를 사용한다. 이 파일들은 원본·crop 파일의 가장자리와 연결된 흰 배경만 알파 채널로 전환한 복사본이며, 캐릭터 내부의 흰색 표정·의상 디테일은 보존한다. 재생성은 `scripts/remove_character_white_backgrounds.py`, 알파 가장자리 검증은 `scripts/verify_character_transparency.py`로 수행한다. 원본 파일과 상업 이용 주의사항은 그대로 유지한다.
