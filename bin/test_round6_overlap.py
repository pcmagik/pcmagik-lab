"""Overlapping ranges must not become a numeric headline."""
import unittest
import build_site as site
import test_round4

class OverlapTest(unittest.TestCase):
    setUp = test_round4.Round4Test.setUp

    def test_P3_overlap_has_only_verdict(self):
        ep = self.ep
        ep['kind'] = 'para-wariantow'
        ep['thesis']['models'] = ep['thesis']['models'][:1]
        ep['thesis']['models'][0]['class'] = 'nakladaja-sie'
        ep['thesis']['summary'] = {'models':1, 'nakladaja-sie':1}
        ep['thesis']['claim'] = 'Ranges overlap · no demonstrated difference'
        self.assertNotIn('result-number', site.thesis_result(ep))
        self.assertIn(ep['thesis']['claim'], site.thesis_result(ep))
        ep['thesis']['models'][0]['class'] = 'karpathy-mniej'
        self.assertNotIn('result-number', site.thesis_result(ep))
        self.assertIn('result-verdict', site.thesis_result(ep))

    def test_P3_legacy_overlap_has_only_verdict(self):
        runs = [{'wariant':v, 'efekty':n} for v in ['bare','karpathy'] for n in [10,20,30]]
        self.assertNotIn('result-number', site.episode_result(runs))
        self.assertIn('Ranges overlap', site.episode_result(runs))
