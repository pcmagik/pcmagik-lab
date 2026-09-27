"""Round five contracts use independent examples, never the production feed."""
import html
import re
import unittest
import build_site as site
import fixture_feed
import test_round4

class Round5Test(unittest.TestCase):
    setUp = test_round4.Round4Test.setUp

    def test_N2_variants_own_label_colors(self):
        ep = fixture_feed.feed()['episodes'][0]
        for markup in [site.home_comparison(ep,site.study_for(ep),'test'), site.thesis_comparison(self.ep,'test')]:
            for label in re.findall(r'<span class="compare-label[^>]*>.*?</span>',markup):
                variant='karpathy' if 'KARPATHY' in label else 'bare'
                self.assertIn('v-'+variant,label)

    def test_N3_description_model_and_matching_run(self):
        ep=self.ep
        ep.update(kind='pixel',opis='The model overwrote its work: 3/29. More context.')
        ep['thesis'].update(metric='checks',total=29)
        for i,r in enumerate(ep['measurements']):
            r['checks']={'passed':3 if i==2 else 9,'total':29,'plik':r['metrics']}
        intro=re.search(r'<section class="episode-intro">(.*?)</section>',site.episode_body(ep,self.feed),re.S)[1]
        self.assertIn('The model overwrote its work: 3/29.',html.unescape(intro))
        self.assertIn(ep['measurements'][0]['model'],intro)
        self.assertIn(ep['measurements'][2]['bieg'],intro)

    def test_N4_selected_cohort_explained_in_table_and_group(self):
        for c in self.ep['cohorts']:
            c.update(n=3,n_w_badaniu=5,wybor='seria/film/build_seria.py:13-jeden-model')
        expected='3 of 5 runs (lowest, middle, highest'
        self.assertIn(expected,html.unescape(site.model_table(self.ep)))
        body=site.episode_body(self.ep,self.feed)
        groups=re.findall(r'<details class="model-runs.*?</details>',body,re.S)
        self.assertIn(expected,html.unescape(groups[0]))

    def test_N5_singular_model(self):
        self.ep.update(kind='pixel')
        self.ep['thesis'].update(metric='checks',total=29)
        self.ep['thesis']['summary']['models']=1
        self.assertNotIn('1 models',site.home_cards([self.ep],self.feed))

    def test_N6_card_title_is_film_title_for_each_kind(self):
        for kind in ['para-wariantow','zbiorczy','pixel']:
            self.ep['kind']=kind
            if kind == 'pixel':
                self.ep['thesis'].update(metric='checks',total=29)
            markup=site.home_cards([self.ep],self.feed)
            title=html.unescape(re.sub('<[^>]+>','',re.search(r'<h3>.*?</h3>',markup)[0]))
            self.assertEqual(title,self.ep['title'])

    def test_N7_effort_no_private_paths_or_duplicate_unknown(self):
        text=site.effort_text({'effort':{'zadany':'medium','otrzymany':None,'zrodlo':'seria/badania/06-pixel-art-editor/effort-rzeczywisty.json'}})
        self.assertEqual(text.count('unknown'),1)
        self.assertNotIn('seria/',text)
        self.assertIn('LM Studio server log',text)
        self.assertNotIn('source:', site.effort_text({'effort': {'zrodlo': None}}))

    def test_N13_all_views_link_to_visible_runs_anchor(self):
        for kind in ['para-wariantow','zbiorczy','pixel']:
            self.ep['kind']=kind
            if kind == 'pixel':
                self.ep['thesis'].update(metric='checks',total=29)
            page=site.episode_body(self.ep,self.feed)
            self.assertIn('id="all-runs"',page)
            self.assertIn('href="#all-runs"',page)
            self.assertIn(f'href="/episodes/{self.ep["slug"]}/"',site.home_cards([self.ep],self.feed))
