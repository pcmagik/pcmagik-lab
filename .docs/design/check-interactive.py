"""Run browser checks and translate Playwright CLI error output into a failure exit."""
import json
from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parents[2]
reference = root / '.tmp/visual-reference'
(reference / 'assets').mkdir(parents=True, exist_ok=True)
for name in ['index.html', 'assets/lab.css', 'assets/lab.js', 'assets/neural-scene.js']:
    (reference / name).write_bytes(subprocess.check_output(['git', 'show', f'a3f1687:{name}'], cwd=root))
for name, target in [('assets/vendor', '../../../assets/vendor'), ('assets/avatar-400.png', '../../../assets/avatar-400.png'), ('episodes', '../../episodes'), ('tasks', '../../tasks')]:
    link = reference / name
    if not link.exists():
        link.symlink_to(target)

result = subprocess.run(
    ['playwright-cli', '-s=restore', '--raw', 'run-code',
     '--filename=.docs/design/check-readability.js' if '--readability' in sys.argv else '--filename=.docs/design/check-interactive.js'],
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
