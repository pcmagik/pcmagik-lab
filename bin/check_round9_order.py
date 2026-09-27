"""U2: the expandable runs precede the aggregate range table."""
import json
from pathlib import Path
import sys

root = Path(sys.argv[1])
feed = json.loads((root / 'data/episodes.json').read_text())
assert {ep['slug'][:2] for ep in feed['episodes']} == {'01', '02', '04', '13'}
for ep in feed['episodes']:
    html = (root / 'episodes' / ep['slug'] / 'index.html').read_text()
    assert html.count('id="all-runs"') == 1
    assert 'href="#all-runs"' in html
    if 'class="model-table"' in html:
        assert html.index('id="all-runs"') < html.index('class="model-table"'), f'U2 {ep["slug"]}: table before runs'
        assert html.rindex('</details>') < html.index('class="model-table"'), 'U2 table interrupts run list'
print('U2 PASS: real 01/02/04/13; run targets and DOM order')
