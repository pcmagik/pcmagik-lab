"""Keep human-readable setting provenance without exposing internal repo paths."""
from html import unescape
import re
import unittest
import test_publication


class SettingTitlesTest(unittest.TestCase):
    setUp = test_publication.PublicationTest.setUp
    episode = test_publication.PublicationTest.episode
    evidence = test_publication.PublicationTest.evidence
    publish = test_publication.PublicationTest.publish

    def test_internal_paths_removed_but_description_dates_and_qualification_stay(self):
        ep = self.episode('01-sources', 19)
        sources = {
            'quantization': ('Q4_K_M', 'LM Studio server log at 2026-09-19T01:32:06; not logged by this run', 'LM Studio server log at 2026-09-19T01:32:06; not logged by this run'),
            'kv_cache': ('K q4_0 / V q4_0', 'rig model settings read 2026-09-21 18:20 (seria/pomiary/ustawienia-modeli-2026-09-21.json); K/V unchanged until 2026-09-26; not logged by this run', 'rig model settings read 2026-09-21 18:20; K/V unchanged until 2026-09-26; not logged by this run'),
            'engine': ('engine@1', 'engine locked since 2026-09-19 01:20 (D58, seria/harness/wersje.json); not logged by this run', 'engine locked since 2026-09-19 01:20 (D58); not logged by this run'),
        }
        ep['measurements'][0]['odtworzenie'] = {'model': 'test/model', **{key: {'value': value, 'source': source} for key, (value, source, expected) in sources.items()}}
        self.feed['episodes'] = [ep]
        result = self.publish()
        self.assertEqual(result.returncode, 0, result.stderr)
        markup = (self.root / 'episodes/01-sources/index.html').read_text()
        titles = [unescape(t) for t in re.findall(r'\btitle="([^"]*)"', markup)]
        self.assertFalse(any('seria/' in t for t in titles), titles)
        for value, source, expected in sources.values():
            self.assertIn(expected, titles)
        # The public feed remains byte-for-byte faithful to the supplied source.
        import json
        published = json.loads((self.root / 'data/episodes.json').read_text())
        self.assertEqual(published['episodes'][0]['measurements'][0]['odtworzenie'], ep['measurements'][0]['odtworzenie'])
