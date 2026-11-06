"""Publisher fixture and adversarial checks for manually verified harness cohorts."""
import copy
import json
from pathlib import Path
import re
import shutil
import tempfile
import unittest
from unittest.mock import patch

import build_site as site

FIXTURE = Path(__file__).parent / 'fixtures/round25'


class VariableEpisodeTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(dir=site.ROOT / '.tmp')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.ep = json.loads((FIXTURE / 'episode.json').read_text())
        self.feed = dict(schema_version=2, generated='2026-11-07', episodes=[self.ep])
        (self.root / 'data').mkdir()
        shutil.copytree(site.ROOT / 'bin/templates', self.root / 'bin/templates')
        # Non-evidence assets are placeholders; only metrics and grader files are real.
        for run in self.ep['measurements']:
            for key in ['prompt', 'strona', 'zrzut', 'zrzut_390', 'zrzut_390_kadr']:
                path = self.root / run[key]
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text('Test asset')
            for source in [run['metrics'], run['checks']['plik']]:
                shutil.copyfile(FIXTURE / run['bieg'] / Path(source).name, self.root / source)
        (self.root / self.ep['prompt_file']).write_text('Test prompt')
        (self.root / self.ep['social_card']).write_text('Test card')
        self.addCleanup(patch.stopall)
        patch.object(site, 'ROOT', self.root).start()

    def load(self):
        (self.root / 'data/episodes.json').write_text(json.dumps(self.feed))
        return site.load()

    def single_run(self):
        run = self.ep['measurements'][1]
        self.ep.update(kind='pixel', measurements=[run], runs=[],
                       cohorts=[dict(model=run['model'], wariant=run['wariant'], n=1)])
        return run['checks']

    def test_manual_checks_accepted(self):
        self.single_run()
        self.load()

    def test_manual_checks_reject_corruption(self):
        checks = self.single_run()
        original = copy.deepcopy(checks)
        cases = [dict(passed=30), dict(sprawdzone_recznie=['noJsErrors']),
                 dict(sprawdzone_recznie=['eraser', 'eraser', 'undoDepth20']),
                 dict(grader_passed=25), dict(failed=['eraser']), dict(total=30),
                 dict(sprawdzone_recznie='eraser'), dict(sprawdzone_recznie=[{}]),
                 dict(failed=['unknown'])]
        for change in cases:
            with self.subTest(change=change):
                checks.clear(); checks.update(copy.deepcopy(original)); checks.update(change)
                with self.assertRaisesRegex(ValueError, 'checks differ from grader evidence'):
                    self.load()

    def test_legacy_score_still_requires_grader_score(self):
        checks = self.single_run()
        del checks['grader_passed']
        del checks['sprawdzone_recznie']
        with self.assertRaisesRegex(ValueError, 'checks differ from grader evidence'):
            self.load()
        checks['passed'] = 26
        self.load()

    def test_variable_cohorts_accepted(self):
        self.load()

    def test_variable_cohorts_reject_corruption(self):
        original = copy.deepcopy(self.ep)
        mutations = [
            lambda e: e['measurements'][0].pop('grupa'),
            lambda e: e['cohorts'][0].update(n=2),
            lambda e: e['thesis']['kohorty'][0]['zakres'].update(max=28),
            lambda e: e['thesis']['kohorty'][0]['zakres'].update(mean=28.9),
            lambda e: e['measurements'][0].update(kolor='#ffffff'),
            lambda e: e['measurements'][0].update(etykieta='Wrong'),
            lambda e: e['cohorts'][0].update(kolor='red'),
            lambda e: e['cohorts'][0].update(kod='pi-agent'),
            lambda e: e['thesis']['kohorty'][0].update(klucz='unknown'),
            lambda e: e['thesis']['kohorty'].append(e['thesis']['kohorty'][0]),
            lambda e: e['cohorts'][0].update(reprezentant='pi-agent_r2'),
            lambda e: e['runs'].pop(),
        ]
        for i, mutate in enumerate(mutations):
            with self.subTest(case=i):
                self.ep.clear(); self.ep.update(copy.deepcopy(original)); mutate(self.ep)
                with self.assertRaises(ValueError):
                    self.load()

    def test_episode_results_and_teasers(self):
        self.load()
        html = site.episode_body(self.ep, self.feed)
        hero = re.search(r'<div class="result-hero.*?</div><a ', html, re.S)[0]
        self.assertIn(self.ep['thesis']['claim'], hero)
        self.assertIn('Ranges overlap · no demonstrated difference', hero)
        self.assertNotIn('not measured yet', hero)
        for label, color, span in [('CLAUDE CODE', '#d97757', '29–29'), ('PI AGENT', '#a3e635', '25–29')]:
            self.assertIn(f'style="color:{color}">{label}', html)
            self.assertIn(f'{span} checks / 29', hero)
        for run, note in [('claude-code_r2', 'grader 26 · 3 checks verified by hand: eraser, dragIsOneStep, undoDepth20'), ('pi-agent_r3', 'grader 27 · 2 checks verified by hand: sizeClears, clearConfirms')]:
            article = re.search(rf'<article[^>]*data-run="{run}".*?</article>', html, re.S)[0]
            self.assertIn(note, article)
            self.assertIn('29 / 29', article)
        self.assertNotIn('v-bare', html)
        self.assertIn('How to reproduce', html)
        for run in self.ep['runs']:
            self.assertIn('/' + run['strona'], html)
        # Teasers preserve the publisher title, without an added result block.
        teaser = site.episode_teaser(self.ep, self.feed)
        self.assertIn('EP 24', teaser)
        self.assertIn(self.ep['title'], teaser)
        self.assertNotIn('result-verdict', teaser)
        self.assertNotIn(self.ep['thesis']['claim'], teaser)


if __name__ == '__main__':
    unittest.main()
