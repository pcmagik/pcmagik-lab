"""Integration tests of the public post-publication hook, isolated inside .tmp."""
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]

class PublicationTest(unittest.TestCase):
    def setUp(self):
        (ROOT / '.tmp').mkdir(exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(dir=ROOT / '.tmp')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        shutil.copytree(ROOT / 'bin', self.root / 'bin')
        self.feed = {'schema_version':2,'generated':'2026-09-20','source':'fixture','note':'Effects count code, not visual quality.', 'episodes':[]}
        (self.root / 'data').mkdir()

    def episode(self, slug, day):
        name=f'2026-09-{day:02}_test_bare'
        prefix=f'episodes/{slug}/{name}'
        run={'bieg':name,'model':'test/model','wariant':'bare','harness':'pi','sekundy':12.5,'tokeny':321,'tokeny_myslenia':21,'myslenie_pct':6.54,'tok_s':25.68,'linie':42,'efekty':7,'effort_zadany':'medium','effort_otrzymany':None,'model_przeladowany':True}
        for key, filename in [('strona','index.html'),('zrzut','screenshot.png'),('metrics','metrics.json'),('prompt','prompt.txt')]:
            run[key]=prefix+'/'+filename
            file=self.root/run[key];file.parent.mkdir(parents=True,exist_ok=True);file.write_text('Test artifact')
        self.evidence(run)
        return {'measurements':[run], 'slug':slug,'title':'Test <episode> '+slug,'task':'easy','youtube':'','opis':'Measured test description.', 'runs':[run]}

    def evidence(self, run):
        raw = {'model':run['model'], 'variant':run['wariant'], 'harness':run['harness'],
               'seconds':run['sekundy'], 'usage':{'completion_tokens':run['tokeny'],
               'completion_tokens_details':{'reasoning_tokens':run['tokeny_myslenia']}},
               'tokens_per_second':run['tok_s'], 'html_lines':run['linie'],
               'effort':run['effort_zadany'], 'effort_otrzymany':run['effort_otrzymany'],
               'model_reloaded':run['model_przeladowany']}
        (self.root/run['metrics']).write_text(json.dumps(raw))
        run['efekty_plik'] = str(Path(run['metrics']).with_name('efekty.json'))
        (self.root/run['efekty_plik']).write_text(json.dumps({'razem':run['efekty']}))
        run['myslenie_pct'] = round(run['tokeny_myslenia']/run['tokeny']*100,2) if run['tokeny'] and run['tokeny_myslenia'] is not None else None

    def publish(self):
        for ep in self.feed['episodes']:
            if 'cohorts' not in ep:
                groups = {}
                for run in ep['measurements']:
                    key = (run['model'],run['wariant'])
                    groups[key] = groups.get(key,0)+1
                ep['cohorts'] = [{'model':m,'wariant':v,'n':n} for (m,v),n in groups.items()]
        (self.root/'data/episodes.json').write_text(json.dumps(self.feed))
        return subprocess.run(['bash', str(self.root/'bin/po-publikacji.sh')],cwd=self.root/'data',capture_output=True,text=True)

    def test_new_episode_and_feed_update(self):
        self.feed['episodes']=[self.episode('new-episode',19)]
        result=self.publish()
        self.assertEqual(result.returncode,0,result.stderr)
        output=self.root/'episodes/new-episode/index.html'
        self.assertIn('321',output.read_text())
        self.assertIn('Test &lt;episode&gt;',output.read_text())
        self.feed['episodes'][0]['runs'][0]['tokeny']=987
        self.evidence(self.feed['episodes'][0]['runs'][0])
        self.assertEqual(self.publish().returncode,0)
        self.assertIn('987',output.read_text())
        data=json.loads((self.root/'assets/homepage-benchmarks.json').read_text())
        self.assertEqual(data['episodes'][0]['runs'][0]['tokeny'],987)

    def test_order_limit_video_and_idempotence(self):
        self.feed['episodes']=[self.episode(f'episode-{day}',day) for day in [12,19,10,15]]
        self.feed['episodes'][1]['youtube']='https://www.youtube.com/watch?v=abc123'
        result=self.publish()
        self.assertEqual(result.returncode,0,result.stderr)
        home=(self.root/'index.html').read_text()
        listing=(self.root/'episodes/index.html').read_text()
        self.assertEqual(home.count('data-episode='),3)
        self.assertEqual(listing.count('class="episode-card '),4)
        self.assertNotIn('href="/episodes/episode-10/"',home)
        self.assertLess(home.index('Test &lt;episode&gt; episode-19'),home.index('Test &lt;episode&gt; episode-15'))
        self.assertIn('https://www.youtube.com/watch?v=abc123',(self.root/'episodes/episode-19/index.html').read_text())
        before=self.generated()
        self.assertEqual(self.publish().returncode,0)
        self.assertEqual(before,self.generated())

    def test_full_cohort_is_exported_on_episode_and_home(self):
        ep = self.episode('first', 10)
        ep['measurements'] = []
        ep['runs'] = []
        for day, variant in [(10,'bare'),(11,'bare'),(12,'bare'),(13,'karpathy'),(14,'karpathy'),(15,'karpathy')]:
            run = self.episode('first',day)['runs'][0]
            run['wariant'] = variant
            run['tokeny'] = 100 + day
            self.evidence(run)
            ep['measurements'].append(run)
            if day in [11,14]:
                ep['runs'].append(run)
        self.feed['episodes'] = [ep]
        result = self.publish()
        self.assertEqual(result.returncode,0,result.stderr)
        for path in ['index.html','episodes/first/index.html']:
            html = (self.root/path).read_text()
            self.assertIn('bare: n=3',html)
            self.assertIn('karpathy: n=3',html)
            self.assertIn('110–112',html)
            self.assertIn('113–115',html)
            self.assertEqual(html.count('class="shot"'),2)
        for run in ep['measurements']:
            self.assertIn(run['metrics'],(self.root/'episodes/first/index.html').read_text())
        before = self.generated()
        ep['runs'][0]['tokeny'] = 999
        self.assertNotEqual(self.publish().returncode,0)
        self.assertEqual(before,self.generated())

    def generated(self):
        return {str(p.relative_to(self.root)):p.read_bytes() for p in self.root.rglob('*')
                if p.is_file() and (p.name=='homepage-benchmarks.json' or (p.name=='index.html' and 'Generated from data/episodes.json' in p.read_text()))}

    def test_invalid_second_episode_preserves_previous_publication(self):
        self.feed['episodes']=[self.episode('first',19)]
        self.assertEqual(self.publish().returncode,0)
        before=self.generated()
        self.feed['episodes'][0]['title']='CHANGED BUT MUST NOT BE WRITTEN'
        second=self.episode('second',20)
        self.feed['episodes'].append(second)
        bad_cases=[('sekundy',-1),('tokeny',float('nan')),('tok_s','oops'),('prompt','../../secret'),('strona','episodes/second/missing/index.html')]
        for key,value in bad_cases:
            with self.subTest(key=key):
                original=second['runs'][0][key]
                second['runs'][0][key]=value
                result=self.publish()
                self.assertNotEqual(result.returncode,0)
                self.assertIn('Publication build failed',result.stderr)
                self.assertEqual(before,self.generated())
                second['runs'][0][key]=original
        second['slug']='first'
        self.assertNotEqual(self.publish().returncode,0)
        self.assertEqual(before,self.generated())
        second['slug']='second';second['youtube']='javascript:alert(1)'
        self.assertNotEqual(self.publish().returncode,0)
        self.assertEqual(before,self.generated())

    def test_empty_feed_withdraws_wrappers_but_preserves_raw_outputs(self):
        ep=self.episode('first',19)
        self.feed['episodes']=[ep]
        self.assertEqual(self.publish().returncode,0)
        raw=self.root/ep['runs'][0]['strona']
        self.feed['episodes']=[]
        self.assertEqual(self.publish().returncode,0)
        self.assertFalse((self.root/'episodes/first/index.html').exists())
        self.assertEqual(raw.read_text(),'Test artifact')
        self.assertIn('No episodes published yet',(self.root/'index.html').read_text())

    def test_single_examples_do_not_claim_cohort_ranges(self):
        ep=self.episode('first',19)
        second=self.episode('first',20)['runs'][0]
        second['wariant']='karpathy'
        self.evidence(second)
        ep['runs'].append(second)
        ep['measurements'].append(second)
        self.feed['episodes']=[ep]
        self.assertEqual(self.publish().returncode,0)
        output=(self.root/'episodes/first/index.html').read_text()
        self.assertNotIn('data-comparison',output)
        self.assertNotIn('22%',output)
        self.assertIn('repeated ranges not measured yet',output)
        ep['runs'][0]['tokeny']=None
        self.evidence(ep['runs'][0])
        self.assertEqual(self.publish().returncode,0)
        self.assertIn('not measured yet',(self.root/'episodes/first/index.html').read_text())

    def test_multiple_models_do_not_mix_representatives(self):
        ep = self.episode('first',10)
        other = self.episode('first',11)['runs'][0]
        other['model'] = 'another/model'
        self.evidence(other)
        ep['runs'].append(other)
        ep['measurements'].append(other)
        self.feed['episodes'] = [ep]
        result = self.publish()
        self.assertEqual(result.returncode,0,result.stderr)
        home = (self.root/'index.html').read_text()
        self.assertNotIn('class="shot"',home)
        self.assertIn('comparisons within each model',home)
        self.assertIn('another/model',(self.root/'episodes/first/index.html').read_text())

def browser_fixture():
    case = PublicationTest()
    case.setUp()
    try:
        ep = case.episode('first', 10)
        for day, variant in [(11, 'bare'), (12, 'karpathy'), (13, 'karpathy')]:
            run = case.episode('first', day)['runs'][0]
            run['wariant'] = variant
            run['tokeny'] = 100 + day
            case.evidence(run)
            ep['runs'].append(run)
            ep['measurements'].append(run)
        case.feed['episodes'] = [ep]
        result = case.publish()
        if result.returncode:
            raise RuntimeError(result.stderr)
        target = ROOT / '.tmp/browser-fixture'
        if target.exists():
            shutil.rmtree(target)
        shutil.copytree(case.root, target)
    finally:
        case.doCleanups()


if __name__ == '__main__':
    import sys
    if sys.argv[1:] == ['--browser-fixture']:
        browser_fixture()
    else:
        unittest.main()

