#!/bin/bash
set -euo pipefail

if [ "$#" -lt 3 ] || [ "$#" -gt 6 ]; then
  echo "usage: scripts/crop-project-sheet.sh sheet-name /path/to/sheet.png slug1 [slug2 slug3 slug4]" >&2
  exit 2
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="$1"
SHEET="$2"
OUT="$ROOT/public/generated/projects"
SHEETS="$OUT/sheets"
shift 2

mkdir -p "$OUT"
mkdir -p "$SHEETS"
cp "$SHEET" "$SHEETS/$NAME.png"

width="$(magick identify -format '%w' "$SHEET")"
height="$(magick identify -format '%h' "$SHEET")"
cell_w=$((width / 2))
cell_h=$((height / 2))

i=0
for slug in "$@"; do
  col=$((i % 2))
  row=$((i / 2))
  x=$((col * cell_w))
  y=$((row * cell_h))

  magick "$SHEET" \
    -crop "${cell_w}x${cell_h}+${x}+${y}" \
    +repage \
    -shave 3x3 \
    -resize '1200x720^' \
    -gravity center \
    -extent 1200x720 \
    -colorspace sRGB \
    -strip \
    -quality 92 \
    "$OUT/$slug.webp"

  i=$((i + 1))
done
