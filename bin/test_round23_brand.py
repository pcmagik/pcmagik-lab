"""Check the visible navbar brand through the site build CLI."""
import re
import unittest
from html import unescape

import test_publication


class BrandTest(unittest.TestCase):
    setUp = test_publication.PublicationTest.setUp
    episode = test_publication.PublicationTest.episode
    evidence = test_publication.PublicationTest.evidence
    publish = test_publication.PublicationTest.publish

    def test_brand_on_every_generated_page(self):
        for populated in (False, True):
            with self.subTest(populated=populated):
                self.feed['episodes'] = [self.episode('brand', 19)] if populated else []
                result = self.publish()
                self.assertEqual(result.returncode, 0, result.stderr)
                pages = ['index.html', 'episodes/index.html', 'privacy/index.html', '404.html']
                pages += [f'episodes/{ep["slug"]}/index.html' for ep in self.feed['episodes']]
                for name in pages:
                    with self.subTest(page=name):
                        markup = (self.root / name).read_text()
                        brand = re.search(r'<a class="brand"[^>]*>(.*?)</a>', markup, re.S)
                        self.assertIsNotNone(brand, name)
                        text = unescape(re.sub(r'<[^>]+>', '', brand[1]))
                        self.assertEqual(text, 'PC MAGIK LAB', name)
                        self.assertIn('aria-label="PC Magik Lab — home"', brand[0])
                        footer = re.search(r'<footer>.*?</footer>', markup, re.S)[0]
                        self.assertIn('lab.pcmagik.pl</a> / PC MAGIK LAB', footer)
