#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LEGACY_SRC="$ROOT/public/legacy/images"
LEGACY_OUT="$ROOT/public/legacy-hd/images"
FILM_SRC="$ROOT/public/world/product-film"
FILM_SCROLL="$FILM_SRC/scroll"
FILM_POSTERS="$FILM_SRC/posters"

mkdir -p "$LEGACY_OUT"
mkdir -p "$FILM_SCROLL"
mkdir -p "$FILM_POSTERS"

if [ -d "$LEGACY_SRC" ]; then
  find "$LEGACY_SRC" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) | while IFS= read -r image; do
    rel="${image#$LEGACY_SRC/}"
    out="$LEGACY_OUT/${rel%.*}.webp"
    mkdir -p "$(dirname "$out")"

    dims="$(magick identify -format '%w %h' "$image")"
    set -- $dims
    width="$1"
    height="$2"
    max_edge="$width"
    if [ "$height" -gt "$max_edge" ]; then
      max_edge="$height"
    fi

    target="$max_edge"
    if [ "$max_edge" -lt 1600 ]; then
      target="1600"
    fi

    magick "$image" \
      -auto-orient \
      -colorspace sRGB \
      -filter Lanczos \
      -resize "${target}x${target}" \
      -unsharp 0x0.8+0.8+0.02 \
      -strip \
      -quality 90 \
      "$out"
  done
fi

if [ -d "$FILM_SRC" ]; then
  for film in "$FILM_SRC"/beat-*.mp4; do
    [ -e "$film" ] || continue
    base="$(basename "$film" .mp4)"
    scroll_out="$FILM_SCROLL/$base.mp4"
    poster_out="$FILM_POSTERS/$base.webp"

    ffmpeg -hide_banner -loglevel error -y \
      -i "$film" \
      -map 0:v:0 \
      -an \
      -vf "unsharp=5:5:0.8:5:5:0.0" \
      -c:v libx264 \
      -preset medium \
      -crf 20 \
      -pix_fmt yuv420p \
      -g 8 \
      -keyint_min 8 \
      -sc_threshold 0 \
      -movflags +faststart \
      "$scroll_out"

    poster_tmp="${TMPDIR:-/tmp}/${base}-poster.png"

    ffmpeg -hide_banner -loglevel error -y \
      -ss 0.24 \
      -i "$film" \
      -frames:v 1 \
      -vf "scale=1920:-2:flags=lanczos,unsharp=5:5:0.8:5:5:0.0" \
      "$poster_tmp"

    magick "$poster_tmp" \
      -auto-orient \
      -colorspace sRGB \
      -strip \
      -quality 90 \
      "$poster_out"

    rm -f "$poster_tmp"
  done
fi
