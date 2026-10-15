#!/bin/sh
# Renders <name>.html (default project-image) to brag-output/<name>.png (3:2, 1500x1000) and a JPG copy.
# Usage: ./render-project-image.sh [project-image | project-image-corner]
cd "$(dirname "$0")"
name="${1:-project-image}"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1500,1000 --virtual-time-budget=4000 \
  --allow-file-access-from-files --screenshot="$PWD/../$name.png" "file://$PWD/$name.html" 2>/dev/null
ffmpeg -y -loglevel error -i "../$name.png" -q:v 2 "../$name.jpg"
