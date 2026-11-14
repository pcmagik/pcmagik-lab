"""Real exported cohorts from .tmp/runda27/site-*; evidence is copied byte for byte."""
import copy
import json
from pathlib import Path
import re
import shutil
import tempfile
import unittest
from unittest.mock import patch

import build_site as site

FIXTURE = Path(__file__).parent / 'fixtures/round27'


class ExportedMetric:
    def setUp(self):
        (site.ROOT / '.tmp').mkdir(exist_ok=True)
        temporary = tempfile.TemporaryDirectory(dir=site.ROOT / '.tmp')
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.fixture = FIXTURE / self.slug
        self.ep = json.loads((self.fixture / 'episode.json').read_text())
        self.feed = dict(schema_version=2, generated='2026-11-14', episodes=[self.ep])
        (self.root / 'data').mkdir()
        shutil.copytree(site.ROOT / 'bin/templates', self.root / 'bin/templates')
        for run in self.ep['measurements']:
            for key in ['prompt', 'strona', 'zrzut', 'zrzut_390', 'zrzut_390_kadr']:
                if run.get(key):
                    target = self.root / run[key]
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_text('Test asset')
            sources = [run['metrics'], run.get('efekty_plik'), (run.get('checks') or {}).get('plik')]
            for source in filter(None, sources):
                target = self.root / source
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(self.fixture / run['bieg'] / Path(source).name, target)
        for key in ['prompt_file', 'social_card', 'task_file']:
            if self.ep.get(key):
                target = self.root / self.ep[key]
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text('Test asset')
        root_patch = patch.object(site, 'ROOT', self.root)
        root_patch.start()
        self.addCleanup(root_patch.stop)

    def load(self):
        (self.root / 'data/episodes.json').write_text(json.dumps(self.feed))
        return site.load()

    def test_real_export_builds_without_changing_measurements(self):
        original = copy.deepcopy(self.feed)
        self.load()
        site.build()
        site.build(check=True)
        self.assertEqual(self.feed, original)
        snapshot = json.loads((self.root / 'assets/homepage-benchmarks.json').read_text())
        self.assertEqual(snapshot, original)
        html = (self.root / f'episodes/{self.slug}/index.html').read_text()
        self.assertEqual(html.count('data-run='), len(self.ep['measurements']))
        for run in self.ep['measurements']:
            article = re.search(rf'<article[^>]*data-run="{run["bieg"]}".*?</article>', html, re.S)[0]
            self.assertIn(self.ep['thesis']['metric'], article)

    def test_result_lists_each_range_once_then_the_class_verdict(self):
        html = site.episode_body(self.ep, self.feed)
        hero = re.search(r'<div class="result-hero.*?</div><a ', html, re.S)[0]
        self.assertNotIn(self.ep['thesis']['claim'], hero)
        ranges = re.findall(r'<span style="color:#[0-9a-fA-F]{6}">([^<]+)</span>', hero)
        self.assertEqual(len(ranges), len(self.ep['cohorts']))
        for group in self.ep['cohorts']:
            self.assertEqual(sum(value.startswith(group['etykieta'] + ': ') for value in ranges), 1)
        self.assertEqual(hero.count('<br>'), len(ranges))

    def test_rejects_each_corrupted_result_even_with_recomputed_ranges(self):
        self.load()
        for run in self.ep['measurements']:
            with self.subTest(run=run['bieg']):
                original = run['wynik']['wartosc']
                run['wynik']['wartosc'] = original + 0.001
                summary = next(g for g in self.ep['thesis']['kohorty'] if g['klucz'] == run['grupa'])
                saved = copy.deepcopy(summary['zakres'])
                values = [r['wynik']['wartosc'] for r in self.ep['measurements'] if r['grupa'] == run['grupa']]
                summary['zakres'] = dict(min=min(values), max=max(values), n=len(values), mean=round(sum(values)/len(values), 1))
                with self.assertRaises(ValueError):
                    self.load()
                run['wynik']['wartosc'] = original
                summary['zakres'] = saved

    def test_rejects_invalid_source_metric_unit_and_number(self):
        self.load()
        result = self.ep['measurements'][0]['wynik']
        original = copy.deepcopy(result)
        cases = [dict(miara='other'), dict(jednostka='other'), dict(zrodlo='metrics.json: unverified'),
                 dict(wartosc=True), dict(wartosc=None), dict(wartosc=-1), dict(wartosc='1'),
                 dict(wartosc=float('nan')), dict(wartosc=float('inf'))]
        for changes in cases:
            with self.subTest(changes=changes):
                result.clear(); result.update(original); result.update(changes)
                with self.assertRaises(ValueError):
                    self.load()
        result.clear(); result.update(original)
        for key, value in [('metric', 'other'), ('jednostka', 'other'), ('total', 29)]:
            with self.subTest(thesis=key):
                saved = self.ep['thesis'][key]
                self.ep['thesis'][key] = value
                with self.assertRaises(ValueError):
                    self.load()
                self.ep['thesis'][key] = saved

    def test_rejects_missing_or_invalid_raw_source_value(self):
        self.load()
        run = self.ep['measurements'][0]
        path = self.root / run['metrics']
        original = json.loads(path.read_text())
        keys = run['wynik']['zrodlo'].removeprefix('metrics.json: ').split('.')
        for value in [None, True, '123', -1, float('nan'), float('inf')]:
            with self.subTest(value=value):
                raw = copy.deepcopy(original)
                field = raw
                for key in keys[:-1]:
                    field = field[key]
                field[keys[-1]] = value
                path.write_text(json.dumps(raw))
                with self.assertRaises(ValueError):
                    self.load()
        raw = copy.deepcopy(original)
        field = raw
        for key in keys[:-1]:
            field = field[key]
        del field[keys[-1]]
        path.write_text(json.dumps(raw))
        with self.assertRaises(ValueError):
            self.load()


class SecondsExportTest(ExportedMetric, unittest.TestCase):
    slug = '22-effort-qwen38'

    def test_partial_class_loads_and_unknown_class_is_rejected(self):
        self.assertEqual(self.ep['thesis']['class'], 'czesciowo')
        self.load()
        self.ep['thesis']['class'] = 'unknown'
        with self.assertRaisesRegex(ValueError, 'invalid variable cohort or range'):
            self.load()

    def test_partial_verdict_in_result_table_and_summary(self):
        expected = 'Some pairs differ in every run, others overlap'
        html = site.episode_body(self.ep, self.feed)
        hero = re.search(r'<div class="result-hero.*?</div><a ', html, re.S)[0]
        self.assertIn('<br>' + expected + '</span>', hero)
        for value in ['NONE: 295–362 s', 'LOW: 924–1,610 s',
                      'MEDIUM: 276–437 s', 'XHIGH: 1,439–1,632 s']:
            self.assertEqual(hero.count(value), 1)
        self.assertIn(f'<p class="compare-summary">{expected}</p>', html)
        self.assertNotIn('no demonstrated difference', html.lower())
        # The shared table consumer must use the same class wording.
        table_ep = copy.deepcopy(self.ep)
        table_ep['thesis']['models'] = [dict(model='test/model', bare=dict(min=1, max=2, n=3),
                                            karpathy=dict(min=2, max=3, n=3))]
        table_ep['thesis']['models'][0]['class'] = 'czesciowo'
        self.assertIn(f'<td class="model-verdict">{expected}</td>', site.model_table(table_ep))

    def test_seconds_are_rounded_only_for_display(self):
        self.load()
        html = site.episode_body(self.ep, self.feed)
        self.assertIn('NONE: 295–362 s</span>', html)
        self.assertIn('>295–362 s</strong>', html)
        article = re.search(r'<article[^>]*data-run="effort-none_r1".*?</article>', html, re.S)[0]
        self.assertIn('<strong>295 s</strong>', article)
        self.assertNotIn('294.83 s', article)
        self.assertEqual(self.ep['measurements'][0]['wynik']['wartosc'], 294.83)


class OutputTokensExportTest(ExportedMetric, unittest.TestCase):
    slug = '23-ponytail-qwen38'

    def test_output_tokens_have_thousands_separators(self):
        self.load()
        html = site.episode_body(self.ep, self.feed)
        self.assertIn('BARE: 8,137–12,622 tokens</span>', html)
        self.assertIn('>8,137–12,622 tokens</strong>', html)
        self.assertIn('<strong>8,137 tokens</strong>', html)

    def recolor_group(self, label, color, variant):
        group = self.ep['cohorts'][0]
        group.update(etykieta=label, kolor=color, wariant=variant)
        self.ep['thesis']['kohorty'][0].update(etykieta=label, kolor=color)
        for run in self.ep['measurements']:
            if run['grupa'] == group['kod']:
                run.update(etykieta=label, kolor=color, wariant=variant)
                path = self.root / run['metrics']
                raw = json.loads(path.read_text())
                raw['variant'] = variant
                path.write_text(json.dumps(raw))
        self.ep['runs'] = [next(m for m in self.ep['measurements'] if m['bieg'] == r['bieg']) for r in self.ep['runs']]

    def test_reserved_colors_accept_only_matching_variant_and_label(self):
        self.load()
        for label, color, variant in [('BARE', '#ff9f45', 'bare'), ('KARPATHY', '#5ec8ff', 'karpathy'),
                                      ('BARE', '#FF9F45', 'bare'), ('KARPATHY', '#5EC8FF', 'karpathy')]:
            with self.subTest(label=label, color=color):
                self.recolor_group(label, color, variant)
                self.load()
        for label, color, variant in [('BARE', '#5ec8ff', 'bare'), ('KARPATHY', '#ff9f45', 'karpathy'),
                                      ('LOW', '#ff9f45', 'bare'), ('LOW', '#5ec8ff', 'karpathy'),
                                      ('BARE', '#ff9f45', 'ponytail'), ('KARPATHY', '#5ec8ff', 'bare')]:
            with self.subTest(label=label, color=color, variant=variant):
                self.recolor_group(label, color, variant)
                with self.assertRaises(ValueError):
                    self.load()


class PromptTokensExportTest(ExportedMetric, unittest.TestCase):
    slug = '25-context-mode-qwen38'

    def test_prompt_tokens_have_thousands_separators(self):
        self.load()
        html = site.episode_body(self.ep, self.feed)
        self.assertIn('BARE: 35,553–168,320 tokens</span>', html)
        self.assertIn('>35,553–168,320 tokens</strong>', html)
        self.assertIn('<strong>168,320 tokens</strong>', html)

    def test_other_allowlisted_source_cannot_supply_prompt_tokens(self):
        self.load()
        self.ep['measurements'][0]['wynik']['zrodlo'] = 'metrics.json: usage.completion_tokens'
        with self.assertRaises(ValueError):
            self.load()


if __name__ == '__main__':
    unittest.main()
