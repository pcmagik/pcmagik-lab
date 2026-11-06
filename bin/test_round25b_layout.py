"""Regression coverage for standalone manual notes and concise variable ranges."""
import json
from pathlib import Path
from html.parser import HTMLParser
import unittest
import build_site as site


class Notes(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.stack, self.parents = [], []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('class') == 'manual-checks':
            self.parents.append(self.stack.copy())
        if tag not in ('img', 'source', 'br', 'meta', 'link', 'input'):
            self.stack.append((tag, attrs.get('class', '')))

    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break


class LayoutTest(unittest.TestCase):
    def setUp(self):
        self.ep = json.loads((Path(__file__).parent / 'fixtures/round25/episode.json').read_text())

    def test_manual_notes_outside_metrics_and_header(self):
        html = site.episode_body(self.ep, {'episodes': [self.ep]})
        notes = Notes(html).parents
        self.assertEqual(len(notes), 3)
        for ancestors in notes:
            self.assertFalse(any(tag in ('b', 'strong') or cls in ('kv', 'run-result-head', 'run-effects')
                                 for tag, cls in ancestors), ancestors)

    def test_variable_ranges_once_and_equal_endpoints_collapsed(self):
        hero = site.thesis_result(self.ep)
        self.assertNotIn(self.ep['thesis']['claim'], hero)
        self.assertEqual(hero.count('CLAUDE CODE'), 1)
        self.assertEqual(hero.count('PI AGENT'), 1)
        self.assertNotIn('29–29', hero)
        self.assertIn('29 checks / 29', hero)
        self.assertIn('25–29 checks / 29', hero)
        bars = site.thesis_comparison(self.ep, 'test')
        self.assertNotIn('29–29', bars)
        self.assertIn('>29 / 29<', bars)
        self.assertIn('CLAUDE CODE <span', bars)
        self.assertIn('PI AGENT <span', bars)
