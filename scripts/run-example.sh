#!/usr/bin/env bash
# ─────────────────────────────────────────────────
# Run a Node.js example by chapter and file number
# Usage: ./scripts/run-example.sh phase-01 ch-04-scope 02-hoisting
# ─────────────────────────────────────────────────

set -euo pipefail

if [ $# -lt 3 ]; then
  echo "Usage: $0 <phase> <chapter-dir> <file-name>"
  echo ""
  echo "Examples:"
  echo "  $0 phase-01 ch-04-scope 01-var-let-const"
  echo "  $0 phase-02 ch-15-async 02-async-await"
  echo ""
  echo "Available examples:"
  find examples-node -name '*.js' -type f | sort
  exit 1
fi

PHASE="$1"
CHAPTER="$2"
FILE="$3"

FILE_PATH="examples-node/${PHASE}/${CHAPTER}/${FILE}.js"

if [ ! -f "$FILE_PATH" ]; then
  echo "Error: File not found: $FILE_PATH"
  echo ""
  echo "Available files in examples-node/${PHASE}/${CHAPTER}/:"
  ls "examples-node/${PHASE}/${CHAPTER}/" 2>/dev/null || echo "  (directory not found)"
  exit 1
fi

echo "─── Running: $FILE_PATH ───"
echo ""
node "$FILE_PATH"
