"""Unequal homepage sample sizes must stay attached to their variants."""
import re
import unittest
import build_site as site
import test_round4


class HomeSampleTest(unittest.TestCase):
    setUp = test_round4.Round4Test.setUp

    def test_R1_unequal_samples_are_not_an_unlabelled_set(self):
        self.ep['kind'] = 'para-wariantow'
        self.ep['thesis']['models'] = self.ep['thesis']['models'][:1]
        self.ep['thesis']['models'][0]['karpathy']['n'] = 3
        # Sample sizes remain part of detailed comparisons, not teaser cards.
        markup = site.thesis_comparison(self.ep, 'test')
        labels = re.findall(r'<span class="variant-sample">(.*?)</span>', markup)
        self.assertIn('BARE · n=5', labels)
        self.assertIn('KARPATHY · n=3', labels)
