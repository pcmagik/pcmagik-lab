"""Empty publication is a complete site, exercised through the build CLI."""
import subprocess
import unittest
import test_publication

class EmptyFeedTest(unittest.TestCase):
    setUp = test_publication.PublicationTest.setUp
    publish = test_publication.PublicationTest.publish

    def test_P1_empty_site_and_package(self):
        result = self.publish()
        self.assertEqual(result.returncode, 0, result.stderr)
        for name in ['index.html', 'episodes/index.html', '404.html']:
            self.assertTrue((self.root/name).is_file(), name)
        for name in ['index.html', 'episodes/index.html']:
            markup = (self.root/name).read_text()
            self.assertIn('First results will arrive with the first film.', markup)
            self.assertNotIn('No episodes published yet.', markup)
            self.assertNotIn('class="episode-list"', markup)
            self.assertNotIn('class="evidence-note', markup)
            self.assertNotIn('result-number', markup)
        for name in ['CNAME', '.nojekyll', 'README.md', 'LICENSE']:
            (self.root/name).write_text('fixture')
        result = subprocess.run(['python3', str(self.root/'bin/package_site.py'), str(self.root/'.tmp/pages')], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue((self.root/'.tmp/pages/404.html').is_file())
