"""Round 8 acceptance on a built, real publication (including hidden text)."""
import argparse
from html.parser import HTMLParser
import json
from pathlib import Path


class Node(HTMLParser):
    def __init__(self, markup):
        super().__init__()
        self.text = ''
        self.tables = 0
        self.feed(markup)

    def handle_starttag(self, tag, attrs):
        if tag == 'table':
            self.tables += 1

    def handle_data(self, data):
        self.text += data


def check(root, point):
    feed = json.loads((root/'data/episodes.json').read_text())
    assert {e['slug'][:2] for e in feed['episodes']} == {'01', '02', '04', '13'}
    page = Node((root/'index.html').read_text())
    counts = {'tables': page.tables, 'verdict': page.text.lower().count('no demonstrated difference'), 'n=3': page.text.count('n=3')}
    print(point, counts, flush=True)
    assert counts['tables'] == 0, counts
    assert counts['verdict'] <= 3, counts
    assert counts['n=3'] <= 3, counts
    ep = next(e for e in feed['episodes'] if e['slug'].startswith('13-'))
    assert '1 / 12' in page.text
    assert ep['thesis']['claim'] in page.text
    assert 'Full results' in page.text
    print(point, 'PASS')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root', type=Path)
    parser.add_argument('point', choices=['R1'])
    args = parser.parse_args()
    check(args.root, args.point)
