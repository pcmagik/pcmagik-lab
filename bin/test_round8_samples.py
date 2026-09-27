"""Shared sample labels must preserve unusual cohort sizes."""
import unittest
import build_site as site
import test_round4


class SampleTest(unittest.TestCase):
    setUp = test_round4.Round4Test.setUp

    def test_R2_different_sample_size_stays_in_cell(self):
        self.ep['thesis']['models'][1]['bare']['n'] = 3
        markup = site.model_table(self.ep)
        self.assertIn('BARE · n=5', markup)
        self.assertIn('KARPATHY · n=5', markup)
        self.assertEqual(markup.count('· n=3'), 1)
        self.assertEqual(markup.count('· n=5'), 2)
