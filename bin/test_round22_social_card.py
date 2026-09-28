"""Exercise social metadata through the build and package CLIs."""
from html.parser import HTMLParser
import subprocess
import unittest
import test_publication


class HeadMetadata(HTMLParser):
    def __init__(self, markup):
        super().__init__()
        self.values = {}
        self.feed(markup.split('</head>', 1)[0])

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta':
            key = attrs.get('property', attrs.get('name'))
            self.values.setdefault(key, []).append(attrs.get('content'))


class SocialCardTest(unittest.TestCase):
    setUp = test_publication.PublicationTest.setUp
    episode = test_publication.PublicationTest.episode
    evidence = test_publication.PublicationTest.evidence
    publish = test_publication.PublicationTest.publish

    def assert_metadata(self, path, image, width, height, alt, card):
        metadata = HeadMetadata((self.root/path).read_text()).values
        for key, expected in {'og:image': image, 'og:image:width': width,
                              'og:image:height': height, 'og:image:alt': alt,
                              'twitter:card': card}.items():
            self.assertEqual(metadata.get(key), [expected], f'{path}: {key}')

    def test_S1_episode_card_and_escaped_title(self):
        ep = self.episode('01-card', 19)
        ep['title'] = 'Test "card" & <episode>'
        ep['social_card'] = 'episodes/01-card/card.jpg'
        (self.root/ep['social_card']).write_bytes(b'card fixture')
        self.feed['episodes'] = [ep]
        result = self.publish()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assert_metadata('episodes/01-card/index.html',
                             'https://lab.pcmagik.pl/episodes/01-card/card.jpg',
                             '1200', '630', ep['title'], 'summary_large_image')

    def test_S2_fallback_and_non_episode_pages(self):
        with_card = self.episode('01-card', 19)
        with_card['social_card'] = 'episodes/01-card/card.jpg'
        (self.root/with_card['social_card']).write_bytes(b'card fixture')
        absent = self.episode('02-absent', 20)
        null = self.episode('03-null', 21)
        null['social_card'] = None
        for episodes in ([], [with_card, absent, null]):
            self.feed['episodes'] = episodes
            result = self.publish()
            self.assertEqual(result.returncode, 0, result.stderr)
            paths = ['index.html', 'episodes/index.html', 'privacy/index.html', '404.html']
            if episodes:
                paths += ['episodes/02-absent/index.html', 'episodes/03-null/index.html']
            for path in paths:
                with self.subTest(path=path, populated=bool(episodes)):
                    self.assert_metadata(path, 'https://lab.pcmagik.pl/assets/avatar-400.png',
                                         '400', '400', 'PC Magik Lab logo', 'summary')

    def test_S3_package_contains_exact_card_bytes(self):
        ep = self.episode('01-card', 19)
        ep['social_card'] = 'episodes/01-card/card.jpg'
        payload = b'\xff\xd8social card fixture\xff\xd9'
        (self.root/ep['social_card']).write_bytes(payload)
        self.feed['episodes'] = [ep]
        for name in ['CNAME', '.nojekyll', 'README.md', 'LICENSE']:
            (self.root/name).write_text('fixture')
        result = self.publish()
        self.assertEqual(result.returncode, 0, result.stderr)
        out = self.root/'.tmp/pages'
        result = subprocess.run(['python3', str(self.root/'bin/package_site.py'), str(out)],
                                capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue((out/ep['social_card']).is_file())
        self.assertEqual((out/ep['social_card']).read_bytes(), payload)

    def test_social_card_rejects_invalid_missing_and_symlink_files(self):
        ep = self.episode('01-card', 19)
        self.feed['episodes'] = [ep]
        card = self.root/'episodes/01-card/card.jpg'
        card.write_bytes(b'card fixture')
        for path in ['', False, 123, 'episodes/other/card.jpg',
                     'episodes/01-card/../card.jpg', '/episodes/01-card/card.jpg',
                     'episodes/01-card/card.jpg?raw=1', 'https://example.com/card.jpg']:
            with self.subTest(path=path):
                ep['social_card'] = path
                result = self.publish()
                self.assertNotEqual(result.returncode, 0)
                self.assertIn('social_card', result.stderr)
        ep['social_card'] = 'episodes/01-card/card.jpg'
        card.unlink()
        result = self.publish()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('social_card', result.stderr)
        card.symlink_to(self.root/'data/episodes.json')
        result = self.publish()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('social_card', result.stderr)
