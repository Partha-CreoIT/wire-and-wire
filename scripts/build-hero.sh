#!/usr/bin/env bash
# build-hero.sh — Blender scene -> scroll-scrubbable WebP frame sets + atlases
#
#   ./scripts/build-hero.sh [frames] [samples] [width]
#
# Writes public/film/{d,m}/NNN.webp and public/film/{d,m}-atlas.webp
set -euo pipefail

FRAMES="${1:-400}"
SAMPLES="${2:-24}"
WIDTH="${3:-1920}"
HEIGHT=$(( WIDTH * 9 / 16 ))

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCENE="$ROOT/assets-source/3d/greybox_hero.py"
RAW="$ROOT/assets-source/3d/_render"
OUT="$ROOT/public/film"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

command -v blender >/dev/null || { echo "blender required: brew install --cask blender"; exit 1; }
command -v ffmpeg  >/dev/null || { echo "ffmpeg required: brew install ffmpeg"; exit 1; }
# This ffmpeg build has no libwebp, so cwebp does the encoding.
command -v cwebp   >/dev/null || { echo "cwebp required: brew install webp"; exit 1; }

echo "==> rendering $FRAMES frames @ ${WIDTH}x${HEIGHT}, $SAMPLES samples"
rm -rf "$RAW"; mkdir -p "$RAW"
blender -b -P "$SCENE" -a -- "$RAW" "$WIDTH" "$HEIGHT" "$FRAMES" "$SAMPLES" \
  | grep -E "^\[greybox\]|Error" || true

COUNT=$(ls "$RAW"/*.png 2>/dev/null | wc -l | tr -d ' ')
[ "$COUNT" -eq "$FRAMES" ] || { echo "FAIL: rendered $COUNT of $FRAMES frames"; exit 1; }

echo "==> scaling"
mkdir -p "$TMP/d" "$TMP/m" "$OUT/d" "$OUT/m"
rm -f "$OUT"/d/*.webp "$OUT"/m/*.webp
ffmpeg -y -loglevel error -i "$RAW/%04d.png" -vf "scale=${WIDTH}:-2" -start_number 1 "$TMP/d/%03d.png"
ffmpeg -y -loglevel error -i "$RAW/%04d.png" \
  -vf "crop=ih*9/16:ih,scale=1080:-2" -start_number 1 "$TMP/m/%03d.png"

echo "==> encoding webp"
for f in "$TMP"/d/*.png; do cwebp -quiet -q 82 -m 4 "$f" -o "$OUT/d/$(basename "${f%.png}").webp"; done
for f in "$TMP"/m/*.png; do cwebp -quiet -q 80 -m 4 "$f" -o "$OUT/m/$(basename "${f%.png}").webp"; done

COLS=12; ROWS=$(( (COUNT + COLS - 1) / COLS ))
echo "==> atlases (${COLS}x${ROWS})"
ffmpeg -y -loglevel error -i "$TMP/d/%03d.png" -vf "scale=320:180,tile=${COLS}x${ROWS}" "$TMP/da.png"
ffmpeg -y -loglevel error -i "$TMP/m/%03d.png" -vf "scale=180:320,tile=${COLS}x${ROWS}" "$TMP/ma.png"
cwebp -quiet -q 70 "$TMP/da.png" -o "$OUT/d-atlas.webp"
cwebp -quiet -q 70 "$TMP/ma.png" -o "$OUT/m-atlas.webp"

echo "==> preview video"
ffmpeg -y -loglevel error -framerate 24 -i "$RAW/%04d.png" -vf "scale=1280:-2" \
  -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -movflags +faststart \
  "$ROOT/reference/greybox-hero-preview.mp4"

AVG=$(( $(du -k "$OUT/d" | tail -1 | cut -f1) / COUNT ))
echo
echo "frames      : $COUNT"
echo "atlas       : { cols: $COLS, tileWidth: 320, tileHeight: 180 }   mobile 180x320"
echo "avg frame   : ${AVG}KB   $([ "$AVG" -gt 120 ] && echo '<-- OVER BUDGET, drop -q to 78' || echo '(budget 40-120KB)')"
echo "film total  : $(du -sh "$OUT" | cut -f1)   (budget <=30MB)"
echo
echo "preview: reference/greybox-hero-preview.mp4"
echo "harness: cd public && python3 -m http.server 8747"
echo "         open http://localhost:8747/greybox-test.html"
