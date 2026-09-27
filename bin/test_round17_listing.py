"""Round 17: listing uses home teasers; model previews belong to details."""
import re
import unittest
import test_publication


class ListingTest(unittest.TestCase):
    setUp = test_publication.PublicationTest.setUp
    episode = test_publication.PublicationTest.episode
    evidence = test_publication.PublicationTest.evidence
    publish = test_publication.PublicationTest.publish

    def test_listing_reuses_home_cards_without_model_previews(self):
        self.feed['episodes'] = [self.episode(f'{day:02}-film', day) for day in [10, 12, 14, 16]]
        result = self.publish()
        self.assertEqual(result.returncode, 0, result.stderr)
        home = (self.root / 'index.html').read_text()
        listing = (self.root / 'episodes/index.html').read_text()
        self.assertNotRegex(listing, r'<img\b|<picture\b|Explore live')
        pattern = r'<article\b[^>]*data-episode="([^"]+)".*?</article>'
        home_cards = {re.search(r'data-episode="([^"]+)"', m[0]).group(1): m[0]
                      for m in re.finditer(pattern, home, re.S)}
        list_cards = {re.search(r'data-episode="([^"]+)"', m[0]).group(1): m[0]
                      for m in re.finditer(pattern, listing, re.S)}
        self.assertEqual(len(home_cards), 3)
        self.assertEqual(len(list_cards), 4)
        for slug, card in home_cards.items():
            self.assertEqual(list_cards[slug], card)
            self.assertIn('See the results →', card)
            self.assertIn('fx-border', card)
        self.assertEqual(listing.count('fx-comet'), 1)
        for ep in self.feed['episodes']:
            detail = (self.root / f'episodes/{ep["slug"]}/index.html').read_text()
            self.assertRegex(detail, r'<img\b')
            self.assertIn(ep['runs'][0]['zrzut'], detail)
