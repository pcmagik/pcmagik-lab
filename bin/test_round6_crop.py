"""Publisher-owned hero crops are validated, rendered and packaged unchanged."""
import json
import subprocess
import unittest
import test_publication

class HeroCropTest(unittest.TestCase):
    setUp = test_publication.PublicationTest.setUp
    episode = test_publication.PublicationTest.episode
    evidence = test_publication.PublicationTest.evidence
    publish = test_publication.PublicationTest.publish

    def test_P7_publisher_crop_roundtrip(self):
        ep = self.episode('hero', 19)
        run = ep['runs'][0]
        run['zrzut_390_kadr'] = run['zrzut'].replace('screenshot.png', 'preview-390.png')
        crop = self.root/run['zrzut_390_kadr']
        crop.write_bytes(b'publisher crop fixture')
        self.feed['episodes'] = [ep]
        result = self.publish()
        self.assertEqual(result.returncode, 0, result.stderr)
        # Round 17 removes previews from the listing, not from episode details.
        self.assertNotIn('data-mobile-crop=', (self.root/'episodes/index.html').read_text())
        for path in ['episodes/hero/index.html']:
            markup = (self.root/path).read_text()
            self.assertIn('srcset="/'+run['zrzut_390_kadr']+'"', markup)
            self.assertIn('data-mobile-crop="publisher"', markup)
        for name in ['CNAME', '.nojekyll', 'README.md', 'LICENSE']:
            (self.root/name).write_text('fixture')
        out = self.root/'.tmp/pages'
        result = subprocess.run(['python3',str(self.root/'bin/package_site.py'),str(out)],capture_output=True,text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual((out/run['zrzut_390_kadr']).read_bytes(), crop.read_bytes())
        run['zrzut_390_kadr'] = 'episodes/hero/../../../outside.png'
        self.assertNotEqual(self.publish().returncode, 0)
