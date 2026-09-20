"""Render the latest three episodes and complete archive as no-JavaScript HTML."""
import argparse
from datetime import date
from html import escape
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]


def ordered(entries, limit=None):
    return sorted(entries, key=lambda entry: date.fromisoformat(entry['date']), reverse=True)[:limit]


def render(entries):
    cards = []
    for entry in entries:
        e = {key: escape(value, quote=True) for key, value in entry.items()}
        cards.append(f'''<article class="episode-card glass spotlight">
  <div class="ep-meta"><span class="chip">{e['label']}</span><time datetime="{e['date']}">{e['date']}</time></div>
  <p class="eyebrow">{e['model']}</p><h3><a href="/episodes/{e['slug']}/">{e['title']} <span aria-hidden="true">↗</span></a></h3>
  <p class="episode-thesis">{e['summary']}</p><p class="measurement-note">{e['note']}</p>
</article>''')
    return '\n'.join(cards)


def build(check=False):
    entries = json.loads((ROOT / 'assets/episodes.json').read_text())
    assert len({e['slug'] for e in entries}) == len(entries), 'Duplicate episode slug'
    for e in entries:
        assert re.fullmatch(r'[a-z0-9-]+', e['slug'])
        assert (ROOT / 'episodes' / e['slug'] / 'index.html').is_file()
    # Four unordered dates exercise the boundary without publishing fake episodes.
    fixture = [{'date': d} for d in ['2026-01-02','2026-01-04','2026-01-01','2026-01-03']]
    assert [e['date'] for e in ordered(fixture, 3)] == ['2026-01-04','2026-01-03','2026-01-02']
    assert len(ordered(fixture)) == 4
    for filename, limit in [('index.html', 3), ('episodes/index.html', None)]:
        path = ROOT / filename
        original = path.read_text()
        updated, count = re.subn(r'<!-- EPISODES:START -->.*?<!-- EPISODES:END -->',
                                lambda _: '<!-- EPISODES:START -->\n'+render(ordered(entries,limit))+'\n<!-- EPISODES:END -->', original, flags=re.S)
        assert count == 1, filename
        if check:
            assert original == updated, f'{filename}: regenerate episode cards'
        else:
            path.write_text(updated)
    print(f'PASS episode catalog: {len(entries)} real episode(s); newest-first ordering and three-card limit; static HTML matches')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    build(parser.parse_args().check)
