#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_ROOT="$ROOT_DIR/data"
DEST_ROOT="$ROOT_DIR/web_server/public/data"

if [[ ! -d "$SRC_ROOT" ]]; then
  echo "Source data directory not found: $SRC_ROOT" >&2
  exit 1
fi

LATEST_DIR="$(find "$SRC_ROOT" -maxdepth 1 -mindepth 1 -type d -name '20[0-9][0-9][01][0-9][0-3][0-9]' -printf '%f\n' | sort | tail -n 1)"
if [[ -z "$LATEST_DIR" ]]; then
  echo "No dated data folders found in $SRC_ROOT" >&2
  exit 1
fi

SRC_PATH="$SRC_ROOT/$LATEST_DIR"
DEST_PATH="$DEST_ROOT/$LATEST_DIR"

mkdir -p "$DEST_ROOT"
rm -rf "$DEST_PATH"
cp -a "$SRC_PATH" "$DEST_PATH"

echo "Copied: $SRC_PATH"
echo "To:     $DEST_PATH"
