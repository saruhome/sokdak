#!/bin/bash
# Stage word thumbnails for CEO approval in the pixel office (2026-09-23):
# uploads to word-thumbnails/pending/word-{id}.jpg and does NOT touch words.thumbnail_url.
# The office inbox shows the image; 승인 sets thumbnail_url to this URL, 반려 deletes the object.
#   scripts/upload-thumbnail.sh <word-id> <file.jpg> [<word-id> <file.jpg> ...]
# Reads the Supabase secret (service_role) key from the macOS keychain; store it once with:
#   security add-generic-password -s sokdak-supabase-secret -a sokdak -w
# (paste the key at the prompt — it never touches shell history or the repo).
set -euo pipefail
(( $# >= 2 && $# % 2 == 0 )) || { echo "usage: $0 <word-id> <file.jpg> ..." >&2; exit 1; }

URL=https://etvrsqfhettkehpltkcp.supabase.co
KEY=$(security find-generic-password -s sokdak-supabase-secret -a sokdak -w)
AUTH=(-H "apikey: $KEY")
# New sb_secret_ keys go in apikey only; legacy JWT keys also need the Bearer header.
[[ $KEY == eyJ* ]] && AUTH+=(-H "Authorization: Bearer $KEY")

while (( $# >= 2 )); do
  id=$1 file=$2; shift 2
  [[ $id =~ ^[0-9]+$ ]] || { echo "bad word id: $id" >&2; exit 1; }
  [[ -f $file ]] || { echo "missing file: $file" >&2; exit 1; }
  [[ $(curl -sSf "$URL/rest/v1/words?id=eq.$id&select=id" "${AUTH[@]}") != "[]" ]] || { echo "no word with id $id" >&2; exit 1; }
  curl -sSf -X POST "$URL/storage/v1/object/word-thumbnails/pending/word-$id.jpg" "${AUTH[@]}" \
    -H "x-upsert: true" -H "Content-Type: image/jpeg" --data-binary "@$file" >/dev/null
  echo "staged word-$id (대표 결재함 대기)"
done
