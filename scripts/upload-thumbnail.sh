#!/bin/bash
# Upload word thumbnails to the word-thumbnails bucket and set words.thumbnail_url.
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
  curl -sSf -X POST "$URL/storage/v1/object/word-thumbnails/word-$id.jpg" "${AUTH[@]}" \
    -H "x-upsert: true" -H "Content-Type: image/jpeg" --data-binary "@$file" >/dev/null
  rows=$(curl -sSf -X PATCH "$URL/rest/v1/words?id=eq.$id&select=id" "${AUTH[@]}" \
    -H "Content-Type: application/json" -H "Prefer: return=representation" \
    -d "{\"thumbnail_url\":\"$URL/storage/v1/object/public/word-thumbnails/word-$id.jpg\"}")
  [[ $rows != "[]" ]] || { echo "no word with id $id (image uploaded, url not set)" >&2; exit 1; }
  echo "ok word-$id"
done
