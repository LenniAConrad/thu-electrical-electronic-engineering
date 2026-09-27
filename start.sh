#!/usr/bin/env bash
set -euo pipefail
practice_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
exec python3 -m http.server "${1:-8765}" --bind 127.0.0.1 --directory "$practice_dir"
