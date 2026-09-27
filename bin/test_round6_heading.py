"""The film title is the only episode H1 for every publication kind."""
import html
import re
import unittest
import build_site as site
import test_round4

class FilmHeadingTest(unittest.TestCase):
    setUp = test_round4.Round4Test.setUp

    def test_P8_title_then_model_for_every_kind(self):
        for kind in ['para-wariantow', 'zbiorczy', 'pixel']:
            self.ep['kind'] = kind
            if kind == 'pixel':
                self.ep['thesis'].update(metric='checks', total=29)
            markup = site.episode_body(self.ep, self.feed)
            heading = re.search(r'<h1[^>]*>(.*?)</h1>', markup, re.S)
            self.assertEqual(html.unescape(re.sub('<[^>]+>', '', heading[1])), self.ep['title'])
            after = markup[heading.end():].split('</section>')[0]
            self.assertIn(site.model_label(self.ep), html.unescape(after))
        self.ep['measurements'][1]['model'] = 'another/model'
        markup = site.episode_body(self.ep, self.feed)
        intro = re.search(r'<section class="episode-intro">(.*?)</section>',markup,re.S)[1]
        self.assertIn('2 models', intro)
