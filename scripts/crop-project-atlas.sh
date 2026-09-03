#!/bin/bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "usage: scripts/crop-project-atlas.sh /path/to/generated-atlas.png" >&2
  exit 2
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ATLAS="$1"
OUT="$ROOT/public/generated/projects"

mkdir -p "$OUT"
cp "$ATLAS" "$OUT/project-atlas.png"

slugs=(
  kuala-lumpur-putrajaya-elevated-highway
  marina-bayfront-vehicular-bridge
  fontana-towers
  ksl-city-mall-johor-bahru
  prince-court-hospital-kuala-lumpur
  boon-lay-mrt-extension
  singapore-commodity-hub
  kuala-lumpur-convention-centre
  braddell-road-interchange
  al-reem-island
  jurong-sewage-treatment-works
  ethylene-cracker-complex-for-shell
  hdb-centre-at-toa-payoh
  kuningan-city
  southern-express-highway
  ntu-alumni
  new-pantai-expressway
  lebuh-raya-kemuning-shah-alam
  fusionopolis
  antasari-blok-m-non-toll-project-dki
  kampung-melayu-casablanca-non-toll-project-dki
  binjai-condominium
  covasuites-kota-damansara
)

width="$(magick identify -format '%w' "$ATLAS")"
height="$(magick identify -format '%h' "$ATLAS")"
cell_w=$((width / 6))
cell_h=$((height / 4))

i=0
for slug in "${slugs[@]}"; do
  col=$((i % 6))
  row=$((i / 6))
  x=$((col * cell_w))
  y=$((row * cell_h))

  magick "$ATLAS" \
    -crop "${cell_w}x${cell_h}+${x}+${y}" \
    +repage \
    -shave 3x3 \
    -resize '1200x720^' \
    -gravity center \
    -extent 1200x720 \
    -colorspace sRGB \
    -strip \
    -quality 90 \
    "$OUT/$slug.webp"

  i=$((i + 1))
done
