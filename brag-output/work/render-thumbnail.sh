#!/bin/sh
# Renders thumbnail.html to brag-output/thumbnail.png (1280x720) and a smaller JPG copy.
cd "$(dirname "$0")"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1280,720 --virtual-time-budget=4000 \
  --allow-file-access-from-files --screenshot="$PWD/../thumbnail.png" "file://$PWD/thumbnail.html" 2>/dev/null
ffmpeg -y -loglevel error -i ../thumbnail.png -q:v 2 ../thumbnail.jpg
