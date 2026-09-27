#!/usr/bin/env bash
set -euo pipefail
repo_dir="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_dir"
python3 -m unittest discover -s bin -p 'test_*.py'
python3 "$repo_dir/bin/build_site.py"
python3 "$repo_dir/bin/build_site.py" --check
