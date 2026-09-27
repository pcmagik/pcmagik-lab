"""R2 acceptance: readable table, exact feed ranges and cohort exceptions."""
import json
from pathlib import Path
import re
import sys
from check_round8 import Node

root = Path(sys.argv[1])
feed = json.loads((root/'data/episodes.json').read_text())
ep = next(e for e in feed['episodes'] if e['slug'].startswith('13-'))
markup = (root/'episodes'/ep['slug']/'index.html').read_text()
table = re.search(r'<table class="model-table">.*?</table>', markup, re.S)[0]
rows = re.findall(r'<tr[^>]*>.*?</tr>', table, re.S)[1:]
counts = {'cell_n': sum('n=' in Node(cell).text for row in rows for cell in re.findall(r'<td.*?</td>', row, re.S)),
          'verdict': Node(table).text.lower().count('no demonstrated difference')}
print('R2', counts, flush=True)
assert counts['cell_n'] == 0, counts
assert counts['verdict'] <= 1, counts
assert len(rows) == len(ep['thesis']['models'])
for model, row in zip(ep['thesis']['models'], rows):
    assert model['model'] in Node(row).text
    for variant in ['bare', 'karpathy']:
        r = model[variant]
        assert f"{r['min']:,}–{r['max']:,}" in Node(row).text
    if model['class'] == 'nakladaja-sie':
        assert Node(re.findall(r'<td.*?</td>', row, re.S)[-1]).text.strip().lower() == 'overlap'
    else:
        assert 'result-separated' in row.split('>')[0]
        assert 'Every Karpathy run below every bare run' in Node(row).text
    if 'qwen3.8' in model['model']:
        assert '3 of 5 runs (lowest, middle, highest' in Node(row).text
assert Node(markup.split('</table>')[1]).text.count('Ranges overlap · no demonstrated difference') >= 1
print('R2 PASS: all table ranges match real feed')
