"""U3 replaces numeric headlines with one feed-backed verdict."""
import unittest
import build_site as site
import test_round4


class VerdictTest(unittest.TestCase):
    setUp = test_round4.Round4Test.setUp

    def test_U3_all_classes_use_the_feed_claim(self):
        for category in site.CLASSES:
            self.ep['thesis']['models'][0]['class'] = category
            markup = site.thesis_result(self.ep)
            self.assertNotIn('result-number', markup)
            self.assertIn('result-verdict', markup)
            self.assertIn(self.ep['thesis']['claim'], markup)

    def test_U3_legacy_missing_data_uses_verdict(self):
        markup = site.episode_result([])
        self.assertNotIn('result-number', markup)
        self.assertIn('not measured yet', markup)
        self.assertIn('result-verdict', markup)
