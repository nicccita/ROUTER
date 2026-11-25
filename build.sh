#!/usr/bin/env bash
# Build main-page@local -> .xpi (rename to .zip and drag into about:debugging,
# or sign with `web-ext sign` for permanent install).
set -euo pipefail

SRC="main-page@local"
OUT_DIR="dist"
NAME="main-page"

cd "$(dirname "$0")"

[ -d "$SRC" ] || { echo "ERROR: source folder '$SRC' not found"; exit 1; }
[ -f "$SRC/manifest.json" ] || { echo "ERROR: $SRC/manifest.json not found"; exit 1; }

command -v zip >/dev/null 2>&1 || { echo "ERROR: 'zip' is required (apt install zip)"; exit 1; }

VERSION="$(python3 -c "import json;print(json.load(open('$SRC/manifest.json'))['version'])")"
XPI="$OUT_DIR/$NAME-$VERSION.xpi"

mkdir -p "$OUT_DIR"
rm -f "$XPI"

# manifest.json must be at the root of the archive
( cd "$SRC" && zip -qr "../$XPI" . -x "*.DS_Store" )

echo "Built: $XPI"
unzip -l "$XPI"
