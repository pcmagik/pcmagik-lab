"""Rules are evidence: serve the exact bytes and reject unsafe file references."""
import subprocess
import unittest
from test_round11_reproduction import ReproductionTest, section


class RulesTest(unittest.TestCase):
    setUp = ReproductionTest.setUp
    episode = ReproductionTest.episode
    evidence = ReproductionTest.evidence
    publish = ReproductionTest.publish
    prepare = ReproductionTest.prepare

    def fixture(self):
        ep = self.prepare()
        run = ep['measurements'][0]
        run['wariant'] = 'karpathy'
        self.evidence(run)
        path = 'episodes/01-reproduction/rules/karpathy/AGENTS.md'
        run['odtworzenie']['rules'] = path
        target = self.root / path
        target.parent.mkdir(parents=True)
        target.write_bytes(b'# Rules\r\nExact source bytes.\r\n')
        ep['prompt_file'] = 'episodes/01-reproduction/prompt.txt'
        (self.root / ep['prompt_file']).write_bytes(b'Exact prompt\n')
        for name in ['CNAME', '.nojekyll', 'README.md', 'LICENSE']:
            (self.root / name).write_text('fixture')
        return ep, run, target

    def test_rules_and_prompt_links(self):
        ep, run, target = self.fixture()
        self.assertEqual(self.publish().returncode, 0)
        markup = section((self.root / 'episodes/01-reproduction/index.html').read_text())
        self.assertIn(f'href="/{run["odtworzenie"]["rules"]}">Karpathy rules file', markup)
        self.assertNotIn(f'href="/{ep["prompt_file"]}"', markup)

    def test_package_preserves_rules_bytes(self):
        ep, run, target = self.fixture()
        self.assertEqual(self.publish().returncode, 0)
        out = self.root / '.tmp/public'
        result = subprocess.run(['python3', str(self.root / 'bin/package_site.py'), str(out)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        packaged = out / run['odtworzenie']['rules']
        self.assertTrue(packaged.is_file(), 'O2: rules missing from public package')
        self.assertEqual(packaged.read_bytes(), target.read_bytes())

    def test_bare_does_not_link_rules(self):
        ep = self.prepare()
        self.assertEqual(self.publish().returncode, 0)
        self.assertNotIn('Karpathy rules file', (self.root / 'episodes/01-reproduction/index.html').read_text())

    def test_rules_paths_rejected_before_rendering(self):
        ep, run, target = self.fixture()
        valid = run['odtworzenie']['rules']
        for path in ['episodes/01-reproduction/rules/karpathy/missing.md',
                     'episodes/other/rules/karpathy/AGENTS.md',
                     'episodes/01-reproduction/rules/karpathy/../karpathy/AGENTS.md',
                     '/etc/passwd', valid + '?raw=1', valid + '#fragment']:
            with self.subTest(path=path):
                run['odtworzenie']['rules'] = path
                self.assertNotEqual(self.publish().returncode, 0, f'O2: unsafe rules accepted: {path}')
        run['odtworzenie']['rules'] = valid
        target.unlink()
        target.symlink_to(self.root / 'LICENSE')
        self.assertNotEqual(self.publish().returncode, 0, 'O2: symlink accepted')
