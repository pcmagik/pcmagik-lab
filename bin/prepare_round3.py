"""Refresh an isolated browser fixture from an existing real publication export."""
from pathlib import Path
import json
import shutil
import subprocess

root = Path(__file__).resolve().parents[1]
source = root / '.tmp/real-publication'
target = root / '.tmp/runda3-site'
target.mkdir(exist_ok=True)
for name in ['bin', 'assets']:
    shutil.copytree(root/name, target/name, dirs_exist_ok=True)
feed = json.loads((source/'data/episodes.json').read_text())
feed['episodes'] = [ep for ep in feed['episodes'] if ep['slug'].startswith(('01-', '02-', '03-'))]
assert len(feed['episodes']) == 3
(target/'data').mkdir(exist_ok=True)
(target/'data/episodes.json').write_text(json.dumps(feed))
for ep in feed['episodes']:
    shutil.copytree(source/'episodes'/ep['slug'], target/'episodes'/ep['slug'], dirs_exist_ok=True)
subprocess.run(['bash', str(target/'bin/po-publikacji.sh')], check=True)
