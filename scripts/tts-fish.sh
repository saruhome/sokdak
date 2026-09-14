#!/bin/bash
# Fish Audio TTS for 호랭·짹이 shorts voice-over.
#   scripts/tts-fish.sh <horang|jjaeki|<fish-voice-id>> "대사" out.mp3
# Reads the Fish Audio API key from the macOS keychain; store it once with:
#   security add-generic-password -s sokdak-fish-audio -a sokdak -w
# Voice ids: pick or clone in https://fish.audio → copy the id → fill HORANG/JJAEKI below.
#   호랭 = 밝고 씩씩한 에너지 담당, 짹이 = 시니컬·덤덤한 츳코미 (assets/characters/CHARACTER-SPEC.md)
set -euo pipefail
(( $# == 3 )) || { echo "usage: $0 <horang|jjaeki|voice-id> \"text\" out.mp3" >&2; exit 1; }

HORANG=""   # TODO: Fish Audio voice id for 호랭
JJAEKI="7be0ffc91afa45b5b5bffb90c0eac128"   # 짹이 (Fish Audio, 대표 선택 2026-09-14)
case $1 in horang) ref=$HORANG ;; jjaeki) ref=$JJAEKI ;; *) ref=$1 ;; esac
[[ -n $ref ]] || { echo "voice id for '$1' not set — edit HORANG/JJAEKI in $0" >&2; exit 1; }
[[ -n $2 ]] || { echo "empty text" >&2; exit 1; }

KEY=$(security find-generic-password -s sokdak-fish-audio -a sokdak -w)
body=$(python3 -c 'import json,sys; print(json.dumps({"text":sys.argv[1],"reference_id":sys.argv[2],"format":"mp3","mp3_bitrate":128}))' "$2" "$ref")
curl -sSf -X POST https://api.fish.audio/v1/tts \
  -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -H "model: s1" \
  -d "$body" -o "$3"
echo "wrote $3 ($(wc -c <"$3") bytes)"
