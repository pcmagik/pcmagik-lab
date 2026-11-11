"""Memory cohorts verified against the publisher's GPU evidence."""
import copy
import json
from pathlib import Path
import re
import shutil
import tempfile
import unittest
from unittest.mock import patch

import build_site as site
import test_round25_variable as previous

FIXTURE = Path(__file__).parent / 'fixtures/round26'


class MemoryEpisodeTest(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory(dir=site.ROOT / '.tmp')
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        self.ep = json.loads((FIXTURE / 'episode.json').read_text())
        self.feed = dict(schema_version=2, generated='2026-11-11', episodes=[self.ep])
        (self.root / 'data').mkdir()
        shutil.copytree(site.ROOT / 'bin/templates', self.root / 'bin/templates')
        for run in self.ep['measurements']:
            for key in ['prompt', 'strona', 'zrzut', 'zrzut_390', 'zrzut_390_kadr']:
                if run.get(key):
                    path = self.root / run[key]
                    path.parent.mkdir(parents=True, exist_ok=True)
                    path.write_text('Test asset')
            sources = [run['metrics']]
            if run.get('checks'):
                sources.append(run['checks']['plik'])
            for source in sources:
                shutil.copyfile(FIXTURE / run['bieg'] / Path(source).name, self.root / source)
        for key in ['prompt_file', 'social_card']:
            (self.root / self.ep[key]).write_text('Test asset')
        self.addCleanup(patch.stopall)
        patch.object(site, 'ROOT', self.root).start()

    def load(self):
        (self.root / 'data/episodes.json').write_text(json.dumps(self.feed))
        return site.load()

    def test_export_builds_with_memory_and_pageless_run(self):
        self.load()
        site.build()
        site.build(check=True)
        html = (self.root / 'episodes' / self.ep['slug'] / 'index.html').read_text()
        hero = re.search(r'<div class="result-hero.*?</div><a ', html, re.S)[0]
        self.assertIn(self.ep['thesis']['claim'], hero)
        self.assertIn('Ranges do not overlap', hero)
        for label, color, span in [('F16', '#fecdd3', '23828–23841'),
                                   ('Q8_0', '#fb7185', '22106–22113'),
                                   ('Q4_0', '#f43f5e', '21078–21083')]:
            self.assertIn(f'style="color:{color}">{label}: {span} MiB</span>', hero)
        self.assertEqual(hero.count('<br>'), 3)
        for invalid in ['/ None', '/ null', 'not measured yet', 'checks /']:
            self.assertNotIn(invalid, hero)
        for run in self.ep['measurements']:
            article = re.search(rf'<article[^>]*data-run="{run["bieg"]}".*?</article>', html, re.S)[0]
            self.assertIn(f'{run["wynik"]["wartosc"]} MiB', article)
            if run.get('checks'):
                self.assertIn(f'{run["checks"]["passed"]} / 29', article)
            if run['bez_strony']:
                self.assertNotIn('Live output', article)
                self.assertNotIn('Screenshot', article)
                self.assertNotIn('href="/"', article)
        for file in ['index.html', 'episodes/index.html']:
            teaser = (self.root / file).read_text()
            self.assertIn('EP 21', teaser)
            self.assertNotIn('result-verdict', teaser)
            self.assertNotIn(self.ep['thesis']['claim'], teaser)

    def test_rejects_corrupt_memory_and_ranges(self):
        original = copy.deepcopy(self.ep)
        mutations = [
            lambda e: e['thesis']['kohorty'][0]['zakres'].update(max=23842),
            lambda e: e['thesis']['kohorty'][0]['zakres'].update(mean=23834.1),
            lambda e: e['measurements'][0]['wynik'].update(wartosc=23842),
            lambda e: e['measurements'][0]['wynik'].update(jednostka='GiB'),
            lambda e: e['measurements'][0]['wynik'].update(miara='other'),
            lambda e: e['measurements'][0]['wynik'].update(zrodlo='unverified'),
            lambda e: e['measurements'][0]['wynik'].update(wartosc=True),
            lambda e: e['measurements'][0]['wynik'].update(wartosc=float('nan')),
            lambda e: e['measurements'][0].pop('wynik'),
            lambda e: e['thesis'].update(jednostka='', total=29),
            lambda e: e['measurements'][0]['checks'].update(passed=29),
        ]
        for i, mutate in enumerate(mutations):
            with self.subTest(case=i):
                self.ep.clear(); self.ep.update(copy.deepcopy(original)); mutate(self.ep)
                with self.assertRaises(ValueError):
                    self.load()

    def test_missing_or_corrupt_gpu_evidence_rejected(self):
        path = self.root / self.ep['measurements'][0]['metrics']
        original = json.loads(path.read_text())
        for memory in [{}, {'loaded_mib': 24193}, {'loaded_mib': '24193', 'idle_mib': 360},
                       {'loaded_mib': 0, 'idle_mib': 360},
                       {'loaded_mib': float('inf'), 'idle_mib': 360}]:
            with self.subTest(memory=memory):
                path.write_text(json.dumps(dict(original, gpu_memory=memory)))
                with self.assertRaises(ValueError):
                    self.load()


class ChecksPageTest(unittest.TestCase):
    setUp = previous.VariableEpisodeTest.setUp
    load = previous.VariableEpisodeTest.load

    def test_checks_cannot_omit_page(self):
        run = self.ep['measurements'][0]
        run.update(bez_strony=True, strona='', zrzut='', zrzut_390='', zrzut_390_kadr='')
        for i, r in enumerate(self.ep['runs']):
            self.ep['runs'][i] = next(m for m in self.ep['measurements'] if m['bieg'] == r['bieg'])
        with self.assertRaisesRegex(ValueError, 'page|stron'):
            self.load()


if __name__ == '__main__':
    unittest.main()
