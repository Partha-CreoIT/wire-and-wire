#!/usr/bin/env bash
# build-hero.sh — Blender scene -> scroll-scrubbable WebP frame sets + atlases
#
#   ./scripts/build-hero.sh [frames] [samples] [width]
#
# Renders TWO passes: 16:9 desktop and 9:16 mobile. Mobile is a genuine
# re-composition from the scene (horizontal sensor fit + pulled-in distance),
# not a centre crop — cropping a 240 m bridge to 9:16 slices its ends off.
#
# Output: public/film/{d,m}/NNN.webp and public/film/{d,m}-atlas.webp
set -euo pipefail

FRAMES="${1:-400}"; SAMPLES="${2:-24}"; WIDTH="${3:-1920}"
HEIGHT=$(( WIDTH * 9 / 16 ))

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCENE="$ROOT/assets-source/3d/greybox_hero.py"
RAW="$ROOT/assets-source/3d/_render"
OUT="$ROOT/public/film"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

command -v blender >/dev/null || { echo "need blender: brew install --cask blender"; exit 1; }
command -v ffmpeg  >/dev/null || { echo "need ffmpeg: brew install ffmpeg"; exit 1; }
# NOTE: the ffmpeg build on this machine has no libwebp, so cwebp encodes.
command -v cwebp   >/dev/null || { echo "need cwebp: brew install webp"; exit 1; }

render() {                       # render <orient> <resx> <resy> <subdir>
  local o="$1" rx="$2" ry="$3" sub="$4"
  echo "==> render $sub: $FRAMES frames @ ${rx}x${ry}, $SAMPLES samples"
  rm -rf "$RAW/$sub"; mkdir -p "$RAW/$sub"
  blender -b -P "$SCENE" -a -- "$RAW/$sub" "$rx" "$ry" "$FRAMES" "$SAMPLES" "$o" \
    | grep -E "^\[greybox\]|Error" || true
  local n; n=$(ls "$RAW/$sub"/*.png 2>/dev/null | wc -l | tr -d ' ')
  [ "$n" -eq "$FRAMES" ] || { echo "FAIL: $sub rendered $n of $FRAMES"; exit 1; }
}

encode() {                       # encode <subdir> <quality> <tileW> <tileH>
  local sub="$1" q="$2" tw="$3" th="$4"
  mkdir -p "$TMP/$sub" "$OUT/$sub"; rm -f "$OUT/$sub"/*.webp
  ffmpeg -y -loglevel error -i "$RAW/$sub/%04d.png" -start_number 1 "$TMP/$sub/%03d.png"
  for f in "$TMP/$sub"/*.png; do
    cwebp -quiet -q "$q" -m 4 "$f" -o "$OUT/$sub/$(basename "${f%.png}").webp"
  done
  local n cols rows; n=$(ls "$OUT/$sub" | wc -l | tr -d ' '); cols=12
  rows=$(( (n + cols - 1) / cols ))
  ffmpeg -y -loglevel error -i "$TMP/$sub/%03d.png" \
    -vf "scale=${tw}:${th},tile=${cols}x${rows}" "$TMP/${sub}-atlas.png"
  cwebp -quiet -q 70 "$TMP/${sub}-atlas.png" -o "$OUT/${sub}-atlas.webp"
  echo "    $sub: $n frames, $(du -sh "$OUT/$sub" | cut -f1), atlas ${cols}x${rows} $(du -h "$OUT/${sub}-atlas.webp" | cut -f1)"
}

render d "$WIDTH" "$HEIGHT" d
render m 1080 1920 m
echo "==> encoding"
encode d 82 320 180
encode m 80 180 320

echo "==> preview video"
ffmpeg -y -loglevel error -framerate 24 -i "$RAW/d/%04d.png" -vf "scale=1280:-2" \
  -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -movflags +faststart \
  "$ROOT/reference/greybox-hero-preview.mp4"

COUNT=$(ls "$OUT/d" | wc -l | tr -d ' ')
AVG=$(( $(du -k "$OUT/d" | tail -1 | cut -f1) / COUNT ))
echo
echo "frames     : $COUNT per orientation"
echo "atlas      : { cols: 12, tileWidth: 320, tileHeight: 180 }  mobile 180x320"
echo "avg frame  : ${AVG}KB  $([ "$AVG" -gt 120 ] && echo '<-- OVER BUDGET, drop -q to 78' || echo '(budget 40-120KB)')"
echo "film total : $(du -sh "$OUT" | cut -f1)  (budget <=30MB)"
echo
echo "preview: reference/greybox-hero-preview.mp4"
echo "harness: cd public && python3 -m http.server 8747"
echo "         open http://localhost:8747/greybox-test.html"
