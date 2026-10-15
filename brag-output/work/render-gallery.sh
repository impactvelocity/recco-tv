#!/bin/sh
# Renders gallery.html?s=1..6 to brag-output/gallery/NN-<name>.jpg (3:2, 1500x1000).
# Usage: ./render-gallery.sh [slide numbers...]   (default: all six)
cd "$(dirname "$0")"
mkdir -p ../gallery
names="install connect-phone text-anything agent inbox alexa"
for s in ${@:-1 2 3 4 5 6}; do
  name=$(echo $names | cut -d' ' -f"$s")
  out="../gallery/0$s-$name"
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=1 --window-size=1500,1000 --virtual-time-budget=4000 \
    --allow-file-access-from-files --screenshot="$PWD/$out.png" "file://$PWD/gallery.html?s=$s" 2>/dev/null
  ffmpeg -y -loglevel error -i "$out.png" -q:v 2 "$out.jpg" && rm "$out.png"
done
ls -la ../gallery
