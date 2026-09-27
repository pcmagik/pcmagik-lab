"""Real episode 16 thesis exported by publikuj.py, 2026-09-26."""
import json
from pathlib import Path
import unittest
import build_site as site

class VariantRangesTest(unittest.TestCase):
    def test_P4_real_16_keeps_ranges_separate(self):
        ep = json.loads((Path(__file__).parent/'fixtures/round6-16-thesis.json').read_text())
        markup = site.thesis_result(ep)
        self.assertNotIn('6–23', markup)
        self.assertRegex(markup, r'v-bare[^>]*>.*?6–18')
        self.assertRegex(markup, r'v-karpathy[^>]*>.*?22–23')
