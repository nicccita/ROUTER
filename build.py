#!/usr/bin/env python3
"""Build main-page@local -> dist/main-page-<version>.xpi (zip with manifest.json at root)."""
import json
import os
import sys
import zipfile

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "main-page@local")
OUT_DIR = os.path.join(ROOT, "dist")


def main():
    manifest_path = os.path.join(SRC, "manifest.json")
    if not os.path.isfile(manifest_path):
        sys.exit(f"ERROR: {manifest_path} not found")

    with open(manifest_path, encoding="utf-8-sig") as f:
        manifest = json.load(f)
    version = manifest["version"]

    os.makedirs(OUT_DIR, exist_ok=True)
    xpi = os.path.join(OUT_DIR, f"main-page-{version}.xpi")
    if os.path.exists(xpi):
        os.remove(xpi)

    # manifest.json first at archive root, then the rest of the files
    files = []
    for dirpath, _, filenames in os.walk(SRC):
        for name in filenames:
            full = os.path.join(dirpath, name)
            arc = os.path.relpath(full, SRC).replace(os.sep, "/")
            if name == ".DS_Store":
                continue
            files.append((full, arc))
    files.sort(key=lambda t: (t[1] != "manifest.json", t[1]))

    with zipfile.ZipFile(xpi, "w", zipfile.ZIP_DEFLATED) as z:
        for full, arc in files:
            z.write(full, arc)

    print(f"Built: {xpi}")
    with zipfile.ZipFile(xpi) as z:
        bad = z.testzip()
        if bad:
            sys.exit(f"ERROR: corrupt entry {bad}")
        for info in z.infolist():
            print(f"  {info.file_size:>8}  {info.filename}")
    print("Archive OK (manifest.json at root, zip integrity verified)")


if __name__ == "__main__":
    main()
