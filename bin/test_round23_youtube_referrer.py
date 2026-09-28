"""Verify the published video frame's referrer policy through the build CLI."""
from html.parser import HTMLParser
import unittest
import test_publication


class Frames(HTMLParser):
    def __init__(self, markup):
        super().__init__()
        self.frames = []
        self.feed(markup)

    def handle_starttag(self, tag, attrs):
        if tag == 'iframe':
            self.frames.append(dict(attrs))


class YoutubeReferrerTest(unittest.TestCase):
    setUp = test_publication.PublicationTest.setUp
    episode = test_publication.PublicationTest.episode
    evidence = test_publication.PublicationTest.evidence
    publish = test_publication.PublicationTest.publish

    def test_video_frame_sends_origin_and_preserves_attributes(self):
        ep = self.episode('01-video', 19)
        ep['youtube'] = 'https://www.youtube.com/watch?v=5xvHtb7y0zY'
        self.feed['episodes'] = [ep]
        result = self.publish()
        self.assertEqual(result.returncode, 0, result.stderr)
        frames = Frames((self.root/'episodes/01-video/index.html').read_text()).frames
        self.assertEqual(frames, [{
            'src': 'https://www.youtube-nocookie.com/embed/5xvHtb7y0zY',
            'title': ep['title'], 'loading': 'lazy',
            'allow': 'fullscreen; picture-in-picture', 'allowfullscreen': None,
            'referrerpolicy': 'strict-origin-when-cross-origin',
        }])

    def test_episode_without_youtube_has_no_frame(self):
        self.feed['episodes'] = [self.episode('02-no-video', 20)]
        result = self.publish()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(Frames((self.root/'episodes/02-no-video/index.html').read_text()).frames, [])
