"""Publication order must be independent of measurement chronology."""
import re
from test_round14_cta import InvitationTest


class PublicationOrderTest(InvitationTest):
    def test_published_order_ties_and_legacy(self):
        a, b = self.episode('17-a', 21), self.episode('18-b', 20)
        a.update(date='2026-09-21', published='2026-10-02')
        b.update(date='2026-09-20', published='2026-10-03')
        self.feed['episodes'] = [a, b]
        for mode, expected in [('published', '18-b'), ('tie', '18-b'), ('legacy', '17-a')]:
            with self.subTest(mode=mode):
                if mode == 'tie':
                    b['published'] = a['published']
                if mode == 'legacy':
                    for ep in [a, b]:
                        ep.pop('published')
                self.assertEqual(self.publish().returncode, 0)
                for path in ['index.html', 'episodes/index.html']:
                    markup = (self.root / path).read_text()
                    self.assertEqual(re.search(r'data-episode="([^"]+)"', markup)[1], expected)
                    self.assertNotIn('Newest run dates first', markup)
                    if path == 'index.html':
                        self.assertIn(f'class="telemetry telemetry-run glass" href="/episodes/{expected}/"', markup)
