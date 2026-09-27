"""Round 14 B1: consistent episode invitation through the build CLI."""
import re
import unittest
import test_publication


class InvitationTest(unittest.TestCase):
    setUp = test_publication.PublicationTest.setUp
    episode = test_publication.PublicationTest.episode
    evidence = test_publication.PublicationTest.evidence
    publish = test_publication.PublicationTest.publish

    def test_episode_buttons_have_one_label(self):
        self.feed['episodes'] = [self.episode('01-example', 20)]
        self.assertEqual(self.publish().returncode, 0)
        for path in ['index.html', 'episodes/index.html']:
            markup = (self.root / path).read_text()
            self.assertNotIn('Test materials', markup)
            buttons = re.findall(r'<a class="button" href="/episodes/01-example/">(.*?)</a>', markup)
            self.assertEqual(buttons, ['See the results →'])
