"""Acceptance checks against a real four-episode publication."""
import argparse
import json
from pathlib import Path
import re

import build_site as site


def check(root, point):
    feed = json.loads((root / 'data/episodes.json').read_text())
    episodes = feed['episodes']
    assert {ep['slug'][:2] for ep in episodes} == {'01', '02', '04', '13'}
    if point == 'U1':
        archive = (root / 'episodes/index.html').read_text()
        home = (root / 'index.html').read_text()
        for ep in episodes:
            label = f'EP {ep["slug"][:2]}'
            assert label in archive, f'U1 archive missing {label}'
            page = (root / 'episodes' / ep['slug'] / 'index.html').read_text()
            assert label in page.split('<h1')[0], f'U1 intro missing {label}'
            if f'data-episode="{ep["slug"]}"' in home:
                card = home.split(f'data-episode="{ep["slug"]}"', 1)[1].split('</article>', 1)[0]
                assert label in card, f'U1 home missing {label}'
            # All four films can independently become the latest publication.
            assert label in site.home_cards([ep], feed)
        for slug in ['unnumbered', '1-example', '123-example']:
            ep = dict(episodes[0], slug=slug)
            for markup in [site.cards([ep], feed), site.home_cards([ep], feed), site.episode_body(ep, feed)]:
                assert not re.search(r'EP \d+', markup), f'U1 invented label for {slug}'
    print(f'{point} PASS: real 01/02/04/13', flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root', type=Path)
    parser.add_argument('point', choices=['U1'])
    args = parser.parse_args()
    check(args.root, args.point)
