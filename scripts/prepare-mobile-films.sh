#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

for directory in "$ROOT/public/world/vid" "$ROOT/public/world/product-film/scroll"; do
  mkdir -p "$directory/mobile"
  for source in "$directory"/*.mp4; do
    destination="$directory/mobile/$(basename "$source")"
    if [ "$destination" -nt "$source" ]; then continue; fi
    # Short keyframe intervals keep touch-driven seeking cheap to decode.
    ffmpeg -hide_banner -loglevel error -y -i "$source" \
      -map 0:v:0 -an -vf 'scale=960:-2:flags=lanczos' \
      -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p \
      -g 4 -keyint_min 4 -sc_threshold 0 -movflags +faststart "$destination"
    printf 'Prepared %s\n' "$destination"
  done
done
