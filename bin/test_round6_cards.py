"""Archive cards are teasers without previews or verdicts (round 17 supersedes round 6)."""
import re
import unittest
import build_site as site
import test_round4

class ArchiveCardsTest(unittest.TestCase):
    setUp = test_round4.Round4Test.setUp

    def test_P2_compact_shared_archive(self):
        for kind in ['para-wariantow', 'zbiorczy', 'pixel']:
            self.ep['kind'] = kind
            markup = site.cards([self.ep], self.feed)
            self.assertIn('ep-teaser', markup)
            self.assertEqual(len(re.findall(r'<img\b', markup)), 0)
            self.assertIn(self.ep['title'], markup)
            self.assertIn(site.model_label(self.ep), markup)
            self.assertNotIn(self.ep['thesis']['claim'], markup)
            self.assertNotIn('data-comparison', markup)
            self.assertNotIn('class="model-table"', markup)
            self.assertNotIn('class="kv"', markup)
