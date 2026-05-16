#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_ROOT="/var/www/wildfiregraphs"

sudo mkdir -p "$WEB_ROOT/html" "$WEB_ROOT/data"
sudo rsync -a --delete "$PROJECT_ROOT/web_server/dist/" "$WEB_ROOT/html/"
sudo rsync -a --delete "$PROJECT_ROOT/web_server/public/data/" "$WEB_ROOT/data/"
sudo find "$WEB_ROOT" -type d -exec chmod 755 {} \;
sudo find "$WEB_ROOT" -type f -exec chmod 644 {} \;
