"""Shared closing decoration through the public publication CLI."""
import unittest
import test_publication


class ClosingEffectsTest(unittest.TestCase):
    setUp = test_publication.PublicationTest.setUp
    episode = test_publication.PublicationTest.episode
    evidence = test_publication.PublicationTest.evidence
    publish = test_publication.PublicationTest.publish

    def test_episode_closing_shares_home_aurora(self):
        self.feed['episodes'] = [self.episode('02-example', 20)]
        self.assertEqual(self.publish().returncode, 0)
        detail = (self.root / 'episodes/02-example/index.html').read_text()
        self.assertIn('class="episode-materials glass fx-aurora"', detail)
