"""Run browser checks and translate Playwright CLI error output into a failure exit."""
import json
from pathlib import Path
import subprocess
import sys

result = subprocess.run(
    ['playwright-cli', '-s=interactive', '--raw', 'run-code',
     '--filename=.docs/design/check-interactive.js'],
    cwd=Path(__file__).resolve().parents[2],
    capture_output=True,
    text=True,
)
try:
    checks = json.loads(result.stdout)
    assert result.returncode == 0
    assert isinstance(checks, list) and checks
    assert all(isinstance(check, str) and check.startswith('PASS ') for check in checks)
except (ValueError, AssertionError):
    print(result.stdout, end='')
    print(result.stderr, end='', file=sys.stderr)
    sys.exit(1)
print('\n'.join(checks))
