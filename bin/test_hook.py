"""The publication hook must reject a failing CI test before building."""
import subprocess
import unittest
import test_publication

class HookTest(unittest.TestCase):
    setUp = test_publication.PublicationTest.setUp

    def test_N1_hook_runs_ci_suite_before_build(self):
        test = self.root/'bin/test_gate.py'
        test.write_text('import unittest\nclass Gate(unittest.TestCase):\n def test_gate(self):\n  self.fail("N1 sentinel")\n')
        result = subprocess.run(['bash',str(self.root/'bin/po-publikacji.sh')],capture_output=True,text=True)
        self.assertNotEqual(result.returncode,0)
        self.assertIn('N1 sentinel',result.stderr)
        self.assertNotIn('Publication build failed',result.stderr)
