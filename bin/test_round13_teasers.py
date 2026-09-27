"""Round 13: landing views invite readers into episodes without revealing results."""
import re
import unittest
import build_site as site
import test_round4


class TeaserTest(unittest.TestCase):
    setUp = test_round4.Round4Test.setUp

    def test_G1_G2_all_episode_kinds_hide_results(self):
        for kind in ['para-wariantow', 'zbiorczy', 'pixel']:
            self.ep['kind'] = kind
            if kind == 'pixel':
                self.ep['thesis'].update(metric='checks', total=29)
            for render in [site.home_cards, site.cards]:
                with self.subTest(kind=kind, view=render.__name__):
                    markup = render([self.ep], self.feed)
                    self.assertNotIn(self.ep['thesis']['claim'], markup)
                    self.assertNotRegex(markup, r'result-verdict|archive-verdict|data-comparison|data-metric|\d+ runs')
                    self.assertIn(f'href="/episodes/{self.ep["slug"]}/"', markup)
                    self.assertIn(site.model_label(self.ep), markup)
                    self.assertIn('datetime=', markup)
                    if render == site.home_cards:
                        self.assertNotRegex(markup, r'<img|<picture|class="runs"|class="kv"')
                        self.assertIn('See the results', markup)

    def test_G1_legacy_episode_is_also_a_teaser(self):
        self.ep.pop('thesis')
        markup = site.home_cards([self.ep], self.feed)
        self.assertNotIn('result-verdict', markup)
        self.assertNotIn('data-comparison', markup)
