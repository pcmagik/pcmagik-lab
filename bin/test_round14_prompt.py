"""B3: a shared prompt appears once, next to the final evidence links."""
import re
import unittest
import test_round11_rules


class SharedPromptTest(unittest.TestCase):
    setUp = test_round11_rules.RulesTest.setUp
    episode = test_round11_rules.RulesTest.episode
    evidence = test_round11_rules.RulesTest.evidence
    publish = test_round11_rules.RulesTest.publish
    prepare = test_round11_rules.RulesTest.prepare
    fixture = test_round11_rules.RulesTest.fixture

    def test_shared_prompt_once_and_rules_by_settings(self):
        ep, run, _ = self.fixture()
        self.assertEqual(self.publish().returncode, 0)
        markup = (self.root / 'episodes/01-reproduction/index.html').read_text()
        links = re.findall(r'<a\b[^>]*>Prompt(?: ↗)?</a>', markup)
        self.assertEqual(len(links), 1)
        materials = markup[markup.index('id="materials"'):]
        self.assertIn(links[0], materials)
        settings = test_round11_rules.section(markup)
        self.assertIn('Karpathy rules file ↗', settings)
        self.assertNotIn('>Prompt', settings)
