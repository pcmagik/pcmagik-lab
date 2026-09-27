"""Reproduction settings must follow the feed through the public build CLI."""
import argparse
import copy
from html import unescape
import json
from pathlib import Path
import re
import unittest
import test_publication

FIELDS = ('model', 'quantization', 'context_window', 'kv_cache', 'max_tokens', 'engine', 'harness', 'effort')


def section(markup):
    found = re.search(r'<section\b[^>]*id="reproduce"[^>]*>.*?</section>', markup, re.S)
    assert found, 'O1: missing How to reproduce section'
    assert 'How to reproduce' in found[0]
    return found[0]


def verify(root):
    feed = json.loads((root / 'data/episodes.json').read_text())
    if not feed['episodes']:
        for path in ('index.html', 'episodes/index.html', '404.html'):
            assert 'id="reproduce"' not in (root / path).read_text()
        print('PASS O1/O3: empty feed unchanged')
        return
    for ep in feed['episodes']:
        markup = (root / 'episodes' / ep['slug'] / 'index.html').read_text()
        fragment = section(markup)
        assert markup.index('id="all-runs"') < markup.index('id="reproduce"'), 'O1: run order'
        if 'class="model-table"' in markup:
            assert markup.index('class="model-table"') < markup.index('id="reproduce"'), 'O1: range table order'
        assert 'not measured yet' not in fragment, 'O3: incorrect missing-data label'
        rows = re.findall(r'<tr data-model="([^"]*)">(.*?)</tr>', fragment, re.S)
        models = {r['odtworzenie']['model'] for r in ep['measurements']}
        assert len(rows) == len(models), 'O1: one row per model'
        for model, row in rows:
            records = [r['odtworzenie'] for r in ep['measurements'] if r['odtworzenie']['model'] == unescape(model)]
            assert records, 'O1: model must come from reproduction metadata'
            for field in FIELDS:
                cell = re.search(rf'<(?:td|th)\b[^>]*data-field="{field}"[^>]*>(.*?)</(?:td|th)>', row, re.S)
                assert cell, f'O1: missing {field}'
                visible = unescape(re.sub('<[^>]+>', '', cell[1]))
                for record in records:
                    value = record.get(field)
                    if isinstance(value, dict):
                        assert str(value['source']) in unescape(cell[1]), f'O3: missing source for {field}'
                        value = value['value']
                    expected = 'not recorded' if value is None else f'{value:,}' if isinstance(value, int) else str(value)
                    assert expected in visible, f'O1/O3 {model} {field}: missing {expected}'
                    if len({json.dumps(r.get(field), sort_keys=True) for r in records}) == 1:
                        assert visible.count(expected) == 1, f'O1: repeated common {field}'
        print(f'PASS O1/O3: {ep["slug"]}, {len(rows)} model rows')


class ReproductionTest(unittest.TestCase):
    setUp = test_publication.PublicationTest.setUp
    episode = test_publication.PublicationTest.episode
    evidence = test_publication.PublicationTest.evidence
    publish = test_publication.PublicationTest.publish

    def prepare(self):
        ep = self.episode('01-reproduction', 20)
        ep['measurements'][0]['odtworzenie'] = {
            'model': 'reproduction/model', 'quantization': {'value': 'Q_TEST', 'source': 'quant source'},
            'context_window': 246810, 'kv_cache': {'value': 'K test / V test', 'source': 'cache source'},
            'max_tokens': 123405, 'engine': {'value': 'test-engine@1', 'source': 'engine source'},
            'harness': 'test-harness@7', 'effort': 'requested-test', 'rules': None,
        }
        self.feed['episodes'] = [ep]
        return ep

    def test_fields_follow_feed_and_escape_markup(self):
        ep = self.prepare()
        self.assertEqual(self.publish().returncode, 0)
        verify(self.root)
        for key in FIELDS:
            value = ep['measurements'][0]['odtworzenie'][key]
            if isinstance(value, dict):
                value.update(value=f'changed <{key}> & "value"', source=f'new <{key}> source')
            else:
                ep['measurements'][0]['odtworzenie'][key] = 987654 if isinstance(value, int) else f'changed <{key}>'
        self.assertEqual(self.publish().returncode, 0)
        verify(self.root)
        fragment = section((self.root / 'episodes/01-reproduction/index.html').read_text())
        self.assertNotIn('<model>', fragment)
        self.assertNotIn('<quantization>', fragment)

    def test_mixed_settings_and_null_preserved(self):
        ep = self.prepare()
        second = copy.deepcopy(ep['measurements'][0])
        second['bieg'] = 'another-run'
        second['odtworzenie']['max_tokens'] = 123999
        second['odtworzenie']['engine'] = {'value': None, 'source': 'not logged <source>'}
        ep['measurements'].append(second)
        self.assertEqual(self.publish().returncode, 0)
        verify(self.root)
        for record in ep['measurements']:
            for key in FIELDS:
                if key != 'model':
                    record['odtworzenie'][key] = {'value': None, 'source': 'no record'} if key in ('quantization', 'kv_cache', 'engine') else None
        self.assertEqual(self.publish().returncode, 0)
        verify(self.root)

    def test_empty_has_no_reproduction_section(self):
        self.assertEqual(self.publish().returncode, 0)
        verify(self.root)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root', type=Path)
    verify(parser.parse_args().root)
