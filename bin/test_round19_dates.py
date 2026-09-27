"""Publication dates must describe episodes independently of run dates."""
import re
import unittest
import test_publication


class PublicationDatesTest(unittest.TestCase):
    setUp = test_publication.PublicationTest.setUp
    episode = test_publication.PublicationTest.episode
    evidence = test_publication.PublicationTest.evidence
    publish = test_publication.PublicationTest.publish

    def test_publication_date_on_cards_latest_and_episode_header(self):
        episodes = [self.episode(f'{n:02}-film', 24 - n) for n in range(1, 5)]
        for n, ep in enumerate(episodes, 1):
            ep.update(date=f'2026-09-{24-n:02}', published=f'2026-10-{n:02}')
        self.feed['episodes'] = episodes
        result = self.publish()
        self.assertEqual(result.returncode, 0, result.stderr)
        for path, count in [('index.html', 3), ('episodes/index.html', 4)]:
            markup = (self.root / path).read_text()
            self.assertNotIn('Run date', markup)
            cards = re.findall(r'<article\b[^>]*data-episode="([^"]+)".*?</article>', markup, re.S)
            self.assertEqual(cards, [e['slug'] for e in reversed(episodes)][:count])
            for ep in list(reversed(episodes))[:count]:
                card = re.search(rf'<article\b[^>]*data-episode="{ep["slug"]}".*?</article>', markup, re.S)[0]
                self.assertIn(f'<time datetime="{ep["published"]}">Published {ep["published"]}</time>', card)
        latest = re.search(r'<a class="telemetry telemetry-run.*?</a>', (self.root / 'index.html').read_text(), re.S)[0]
        self.assertIn('<time datetime="2026-10-04">Published 2026-10-04</time>', latest)
        for ep in episodes:
            markup = (self.root / f'episodes/{ep["slug"]}/index.html').read_text()
            self.assertNotIn('Run date', markup)
            intro = re.search(r'<section class="episode-intro">.*?</section>', markup, re.S)[0]
            self.assertIn(f'<time datetime="{ep["published"]}">Published {ep["published"]}</time>', intro)

    def test_missing_publication_never_uses_measurement_or_generated_date(self):
        ep = self.episode('01-legacy', 19)
        ep['date'] = '2026-09-19'
        self.feed['episodes'] = [ep]
        self.assertEqual(self.publish().returncode, 0)
        for path in ['index.html', 'episodes/index.html', 'episodes/01-legacy/index.html']:
            markup = (self.root / path).read_text()
            self.assertNotIn('Run date', markup)
            self.assertNotRegex(markup, r'<time\b')
            self.assertIn('Publication date: not measured yet', markup)
