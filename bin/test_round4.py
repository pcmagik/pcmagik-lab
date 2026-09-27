"""Contract regressions for the shared publication renderer."""
from copy import deepcopy
import fixture_feed
from pathlib import Path
import re
import unittest
import build_site as site


class Round4Test(unittest.TestCase):
    def setUp(self):
        self.feed = fixture_feed.feed()
        self.ep = deepcopy(self.feed['episodes'][0])
        self.ep.update(kind='zbiorczy', title='One rules file. Two models.')
        self.ep['thesis'] = {'metric':'efekty', 'claim':'One of two models has separated ranges.',
            'summary':{'models':2, 'karpathy-mniej':1, 'nakladaja-sie':1, 'karpathy-wiececej':0}, 'pary':[],
            'models':[{'model':model, 'bare':{'min':10,'max':20,'n':5,'mean':15},
                'karpathy':{'min':2,'max':8,'n':5,'mean':5}, 'class':'karpathy-mniej',
                'n_bare':5,'n_karpathy':5,'karpathy_ponizej_kazdego_bare':5,'zmiana_sredniej_pct':-66.7}
                for model in [self.ep['measurements'][0]['model'],'second/model']]}

    def test_B9_shared_thesis_and_compact_models(self):
        ep=self.ep
        ep['cohorts'][0].update(reprezentant=None, reprezentant_powod='No complete output in this cohort.')
        body=site.episode_body(ep,self.feed)
        self.assertIn(ep['title'], re.search(r'<h1.*?</h1>',body,re.S)[0])
        self.assertIn(ep['thesis']['claim'],body)
        self.assertEqual(body.count('class="model-summary"'),2)
        self.assertIn('No complete output in this cohort.',body)
        self.assertIn('<details',body)
        home=site.home_cards([ep],self.feed)
        self.assertNotIn(ep['thesis']['claim'],home)
        self.assertNotIn(ep['thesis']['claim'], site.cards([ep],self.feed))
        self.assertNotIn(f'<span class="result-verdict">{ep["thesis"]["claim"]}</span>',home)
        self.assertNotIn('result-number',home)
        # Thesis ranges are authoritative, independent of raw run display.
        self.assertIn('10–20',body)
        self.assertEqual(body.count('class="result-hero glass"'),1)

    def test_B10_pixel_checks_and_thesis_ranges(self):
        ep=self.ep
        ep.update(kind='pixel',title='Pixel evidence')
        ep['thesis'].update(metric='checks', total=29, claim='Measured pair verdict',
            pary=[{'wariant':'bare','rozstrzygniete':1,'wszystkie':3}])
        for r in ep['measurements']:
            r['efekty']=None
            r['checks']={'passed':7,'total':29,'plik':r['metrics'].replace('metrics.json','pixel-check.json')}
        ep['runs'] = [r for r in ep['measurements'] if r.get('strona')]
        for render in [lambda:site.episode_body(ep,self.feed)]:
            html=render()
            self.assertNotIn('not measured yet',html)
            self.assertIn('7 / 29',html)
            self.assertIn('/pixel-check.json',html)
            self.assertNotIn('>effects<',html)
            self.assertNotIn('data-metric="effects"',html)
            self.assertIn('data-metric="checks"',html)
            self.assertRegex(html,r'data-metric="checks"[^>]*aria-pressed="true"')
            self.assertIn('Measured pair verdict',html)
            self.assertIn('1 / 3',html)
        comparison=site.home_comparison(ep,site.study_for(ep),'test')
        self.assertIn('10–20 / 29',comparison)
        self.assertNotIn('data-metric="thinking"',comparison)

    def test_B5_B7_B8_B17_artifact_presentation(self):
        ep=self.ep
        ep.update(kind='para-wariantow',prompt_file=f"episodes/{ep['slug']}/prompt.txt",task_file='tasks/easy.txt')
        for i,r in enumerate(ep['measurements'],10):
            r.update(powtorzenie=i, effort={'zadany':'medium','otrzymany':'on','zrodlo':'server logs','zgodny':False},
                strona=r['metrics'].replace('metrics.json','index.html'),
                zrzut=r['metrics'].replace('metrics.json','screenshot-1920.png'),
                zrzut_390=r['metrics'].replace('metrics.json','screenshot-390.png'))
        ep['runs']=ep['measurements'][:2]
        ep['runs'][0]['zrzut_pusty']=True
        for html in [site.episode_body(ep,self.feed)]:
            self.assertIn('received: on',html)
            self.assertIn('server logs',html)
            self.assertIn(f'href="/{ep["prompt_file"]}">Prompt',html)
            self.assertNotIn(f'<img src="/{ep["runs"][0]["zrzut"]}"',html)
            self.assertIn('Preview unavailable',html)
            self.assertIn(ep['runs'][1]['zrzut_390'],html)
        body=site.episode_body(ep,self.feed)
        for r in ep['measurements']:
            self.assertIn(f'Run {r["powtorzenie"]}</h4>',body)
            card=re.search(f'<article class="run-result.*?data-run="{re.escape(r["bieg"])}".*?</article>',body,re.S)[0]
            self.assertIn(f'href="/{r["strona"]}"',card)
            self.assertIn(f'href="/{r["zrzut"]}"',card)
        ep['prompt_file']=None
        body=site.episode_body(ep,self.feed)
        for r in ep['measurements']:
            self.assertIn(f'href="/{r["prompt"]}">Prompt',body)

    def test_B9_effects_are_tabulated_not_ranked_across_models(self):
        html=site.home_comparison(self.ep,None,'summary')
        self.assertNotIn('class="bar-fill',html)
        self.assertEqual(html.count('class="model-summary"'),2)
