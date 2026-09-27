"""R3 acceptance on all episode text and every published run value."""
import json
from pathlib import Path
import re
import sys
from check_round8 import Node

root = Path(sys.argv[1])
feed = json.loads((root/'data/episodes.json').read_text())
ep = next(e for e in feed['episodes'] if e['slug'].startswith('13-'))
markup = (root/'episodes'/ep['slug']/'index.html').read_text()
page = Node(markup)
counts = {'verdict': page.text.lower().count('no demonstrated difference'), 'n=3': page.text.count('n=3')}
print('R3', counts, flush=True)
assert counts['verdict'] <= 5, counts
assert counts['n=3'] <= 5, counts
cards = re.findall(r'<article class="run-result.*?</article>', markup, re.S)
assert len(cards) == len(ep['measurements'])
for run, card in zip(ep['measurements'], cards):
    # Look up by ID because display groups the feed into cohorts.
    card = next(c for c in cards if f'data-run="{run["bieg"]}"' in c)
    values = re.findall(r'<strong>(.*?)</strong>', card)
    seconds = round(run['sekundy'])
    expected = [f'{run["efekty"]:,}', f'{seconds // 60}:{seconds % 60:02} min:s',
                f'{run["tokeny"]:,}', 'not measured yet' if run['myslenie_pct'] is None else f'{run["myslenie_pct"]:.1f}%',
                f'{run["tok_s"]:,}', f'{run["linie"]:,}']
    assert values == expected, (run['bieg'], values, expected)
print(f'R3 PASS: {len(cards)} runs, all displayed measurements match feed')
