#!/usr/bin/env bash
set -euo pipefail

rm -rf dist
mkdir -p dist

cp index.html styles.css script.js .nojekyll dist/
cp -R assets dist/assets

