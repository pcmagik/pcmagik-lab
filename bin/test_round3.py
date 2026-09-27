"""Regression criteria from the publication audit, using real exported measurements."""
import fixture_feed
import re
import unittest
from pathlib import Path
import build_site as site

ROOT = Path(__file__).resolve().parents[1]


class Round3Test(unittest.TestCase):
    def setUp(self):
        self.feed = fixture_feed.feed()
        self.ep = self.feed['episodes'][0]

    def test_B2_previews_only_on_episode(self):
        home = site.home_cards([self.ep], self.feed)
        episode = site.episode_body(self.ep, self.feed)
        self.assertNotIn('class="run spotlight"', home)
        self.assertIn('class="run spotlight"', episode)

    def test_B4_same_metric_order_and_default(self):
        study = site.study_for(self.ep)
        a = site.home_comparison(self.ep, study, 'a')
        b = site.home_comparison(self.ep, study, 'b', detailed=True)
        metrics = lambda html: re.findall(r'data-metric="(.*?)".*?aria-pressed="(.*?)"', html)
        expected = [(key, str(i == 0).lower()) for i, key in enumerate(['effects','time','tokens','throughput','thinking','lines'])]
        self.assertEqual(metrics(a), expected)
        self.assertEqual(metrics(a), metrics(b))

    def test_B12_list_links_to_same_episode(self):
        self.assertIn(f'href="/episodes/{self.ep["slug"]}/"', site.cards([self.ep], self.feed))
        visible = re.sub('<[^>]+>', '', site.cards([self.ep], self.feed))
        self.assertNotIn('| PC Magik Lab', visible)

    def test_B3_verdicts_share_value_caption_repeat(self):
        for effects, label in [([80,85,90], 'fewer counted effects'), ([90,105,130], 'Ranges overlap'), ([130,140,150], 'more counted effects')]:
            runs = [{'wariant':'bare','efekty':n} for n in [100,110,120]] + [{'wariant':'karpathy','efekty':n} for n in effects]
            html = site.episode_result(runs)
            self.assertNotIn('result-number', html)
            self.assertIn('result-verdict', html)
            self.assertNotIn('result-words', html)
            self.assertNotIn('result-repeat', html)
            self.assertIn(label, html)
            if label != 'Ranges overlap':
                self.assertRegex(html, r'[−+]\d+%')

    def test_B5_effort_and_display_precision(self):
        from copy import deepcopy
        for received, note in [(None,'unknown'), ('on','differs'), ('medium','medium')]:
            ep = deepcopy(self.ep)
            for r in ep['measurements']:
                r['effort_otrzymany'] = received
            ep['runs'] = ep['measurements'][:2]
            for html in [site.episode_body(ep, self.feed)]:
                self.assertIn('Effort requested: medium', html)
                self.assertIn('received: '+(received or 'unknown'), html)
                self.assertIn(note, html)
                self.assertNotRegex(html, r'\d+\.\d{2}%')
                self.assertIn('not comparable across models', html)
            body = site.episode_body(ep, self.feed)
            self.assertEqual(body.count('class="effort-note"'), len(ep['measurements'])+len(ep['runs']))

    def test_B6_one_duration_format(self):
        html = site.home_cards([self.ep], self.feed) + site.episode_body(self.ep, self.feed)
        self.assertNotRegex(html, r'\d+\.\d+ s')
        for r in self.ep['measurements']:
            self.assertIn(site.duration(r['sekundy']), html)
        ranges = site.home_comparison(self.ep, site.study_for(self.ep), 'test')
        for v in ['bare','karpathy']:
            values = [r['sekundy'] for r in self.ep['measurements'] if r['wariant']==v]
            self.assertIn(site.duration(min(values)).removesuffix(' min:s')+'–'+site.duration(max(values)), ranges)

    def test_B14_hero_language(self):
        for path in [*ROOT.glob('assets/*.js'), *ROOT.glob('bin/templates/*')]:
            self.assertNotRegex(path.read_text(), '[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]', str(path))

    def test_B15_no_generated_fake_link(self):
        css = (ROOT/'assets/lab.css').read_text()
        self.assertNotRegex(css, r'\.hero-bottom::after\s*\{[^}]*↗')

    def test_B21_method_counts_from_feed(self):
        source = (ROOT/'bin/templates/home.html').read_text()
        self.assertNotRegex(source, r'93%|n=3|n=5')
        self.assertIn('{{method_samples}}', source)
        from copy import deepcopy
        feed = deepcopy(self.feed)
        summary = site.method_samples(feed['episodes'])
        self.assertIn('n=5', summary)
        for ep in feed['episodes']:
            ep['measurements'] = ep['measurements'][:4]
        self.assertIn('n=4', site.method_samples(feed['episodes']))
        self.assertNotIn('n=5', site.method_samples(feed['episodes']))
