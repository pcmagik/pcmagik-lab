"""Navigation contract on generated pages, also callable against real exports."""
import argparse
import json
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest
import test_publication


class Links(HTMLParser):
    def __init__(self, markup):
        super().__init__()
        self.links = []
        self.feed(markup)

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            self.links.append(dict(attrs))


def navigation(root):
    pages = [root / 'index.html', root / 'episodes/index.html', root / '404.html']
    pages += sorted((root / 'episodes').glob('*/index.html'))
    count = len(json.loads((root / "data/episodes.json").read_text())["episodes"])
    normalized = []
    for path in pages:
        markup = path.read_text()
        nav = re.search(r'<nav aria-label="Main navigation">.*?</nav>', markup, re.S)[0]
        mobile = re.search(r'<div class="mobile-links">.*?</div>', markup, re.S)[0]
        relative = path.relative_to(root).as_posix()
        current = 'page' if relative == 'episodes/index.html' else 'true' if relative.startswith('episodes/') else None
        for fragment, extra in [(nav, []), (mobile, ['https://www.youtube.com/@PCMagikLab'])]:
            counters = re.findall(r'<sup>(.*?)</sup>', fragment)
            assert counters == ([f'{count:02}'] if count else []), f'M2 {relative}: counter'
            assert re.search(r'>Benchmarks</a>', fragment), f'M1 {relative}: Benchmarks without counter'
            links = Links(fragment).links
            assert [a['href'] for a in links] == [('#episodes' if relative == 'index.html' else '/#episodes'), '/episodes/', '/#method', 'https://github.com/pcmagik/pcmagik-lab'] + extra, f'N2 {relative}: destinations'
            assert re.search(r'>Episodes(?: <sup>\d+</sup>)?</a>', fragment), f'N2 {relative}: label'
            assert [a.get('aria-current') for a in links] == [None, current] + [None] * (len(links)-2), f'N3 {relative}: active link'
        normalized.append(re.sub(r' aria-current="[^"]*"', '', nav + mobile).replace('href="#episodes"', 'href="/#episodes"'))
    assert len(set(normalized)) == 1, 'N4: shared navigation differs'
    print(f'PASS N1–N4: {root}, {len(pages)} pages')


class NavigationTest(unittest.TestCase):
    setUp = test_publication.PublicationTest.setUp
    publish = test_publication.PublicationTest.publish

    def test_empty_navigation(self):
        result = self.publish()
        self.assertEqual(result.returncode, 0, result.stderr)
        navigation(self.root)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root', type=Path)
    navigation(parser.parse_args().root)
