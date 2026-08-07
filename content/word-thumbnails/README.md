# word-thumbnails

영상이 없는 신조어의 썸네일 이미지를 여기 올려두면, Supabase `word-thumbnails`
버킷으로 업로드한 뒤 해당 단어의 `thumbnail_url`을 채웁니다. **이 폴더 자체는
앱이 읽는 위치가 아닙니다** — 앱 빌드에 포함되는 `assets/`와 달리 이미지를
넘겨받는 임시 창구일 뿐이라, 파일이 쌓여도 앱 용량에 영향 없습니다.

## 파일명 규칙

`{단어 id}.jpg` (또는 `.png`) — 예: `20.jpg`

단어 id는 사전 화면 URL(`/tabs/dictionary/20`)이나 Supabase `words` 테이블에서
확인할 수 있습니다. id 대신 단어 텍스트로 올려도 되지만, 자모 분리·중복 단어
문제를 피하려면 id 쪽을 권장합니다.

## 올린 다음

파일을 푸시하고 알려주시면 이 폴더를 읽어서 Supabase Storage에 업로드하고
각 단어의 `thumbnail_url`을 채웁니다.
