#!/usr/bin/env bash
set -euo pipefail

get_clip() {
  if [[ -n "${CLIP:-}" ]]; then
    printf '%s' "$CLIP"
  elif command -v pbpaste >/dev/null 2>&1; then
    pbpaste
  elif command -v xclip >/dev/null 2>&1; then
    xclip -o -selection clipboard
  elif command -v xsel >/dev/null 2>&1; then
    xsel --clipboard --output
  elif command -v powershell.exe >/dev/null 2>&1; then
    powershell.exe -NoProfile -Command "Get-Clipboard" | tr -d '\r'
  else
    printf ''
  fi
}

CLIP_TXT="$(get_clip)"

if command -v iconv >/dev/null 2>&1; then
  CLIP_TXT="$(printf '%s' "$CLIP_TXT" | iconv -f UTF-8 -t ASCII//TRANSLIT 2>/dev/null || printf '%s' "$CLIP_TXT")"
fi

SLUG="$(printf '%s' "$CLIP_TXT" |
  tr '[:upper:]' '[:lower:]' |
  sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')"

printf '%s' "$SLUG"
