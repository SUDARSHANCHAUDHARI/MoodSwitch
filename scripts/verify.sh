#!/usr/bin/env bash

set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_dir"

if ! command -v node >/dev/null 2>&1; then
  echo "Verification requires Node.js 18 or newer." >&2
  exit 1
fi

node --check script.js
node --test tests/*.test.cjs

if command -v xmllint >/dev/null 2>&1; then
  awk '$0 ~ /<svg/ && !printing {printing=1} printing {print} printing && /<\/svg>/ {exit}' index.html \
    | xmllint --noout -
else
  echo "Note: xmllint is unavailable; the supplemental SVG XML check was skipped."
fi

echo "MoodSwitch verification passed."
