"""Round 15: effect hierarchy through the public build CLI."""
import re
import unittest
import test_publication


class EffectsTest(unittest.TestCase):
    setUp = test_publication.PublicationTest.setUp
    episode = test_publication.PublicationTest.episode
    evidence = test_publication.PublicationTest.evidence
    publish = test_publication.PublicationTest.publish

    def test_latest_published_episode_alone_gets_comet(self):
        old, latest = self.episode('13-old', 22), self.episode('01-new', 20)
        old['published'], latest['published'] = '2026-09-23', '2026-09-24'
        self.feed['episodes'] = [old, latest]
        self.assertEqual(self.publish().returncode, 0)
        for path in ['index.html', 'episodes/index.html']:
            html = (self.root / path).read_text()
            cards = re.findall(r'<article class="([^"]+)" data-episode="([^"]+)"', html)
            self.assertEqual(len(cards), 2)
            self.assertTrue(all('fx-border' in cls for cls, slug in cards))
            self.assertEqual([slug for cls, slug in cards if 'fx-comet' in cls], ['01-new'])
        home = (self.root / 'index.html').read_text()
        self.assertIn('fx-glass', home)
        detail = (self.root / 'episodes/01-new/index.html').read_text()
        self.assertIn('fx-pulse', detail)

    def test_empty_home_keeps_effects(self):
        self.assertEqual(self.publish().returncode, 0)
        home = (self.root / 'index.html').read_text()
        self.assertIn('fx-glass', home)
        self.assertEqual(home.count('fx-spotlight'), 4)
        self.assertIn('fx-aurora', home)
