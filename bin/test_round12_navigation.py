"""Check feed-backed navigation through the builder, including withdrawal and addition."""
import argparse
import json
from pathlib import Path
import subprocess
import unittest

from test_round10_navigation import navigation
import test_publication


def build_and_check(root):
    result = subprocess.run(['python3', str(root / 'bin/build_site.py')], capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    navigation(root)


def changing_real_feed(root):
    """The CLI must receive a disposable copy, never the source export."""
    path = root / 'data/episodes.json'
    original = path.read_bytes()
    feed = json.loads(original)
    assert len(feed['episodes']) == 4, 'Expected the 01/02/04/13 export'
    try:
        build_and_check(root)
        removed = feed['episodes'].pop()
        path.write_text(json.dumps(feed))
        build_and_check(root)
        feed['episodes'].append(removed)
        path.write_text(json.dumps(feed))
        build_and_check(root)
        print('PASS M2: real feed 04 → 03 → 04')
    finally:
        path.write_bytes(original)
        subprocess.run(['python3', str(root / 'bin/build_site.py')], check=True)


class EpisodeCounterTest(unittest.TestCase):
    setUp = test_publication.PublicationTest.setUp
    publish = test_publication.PublicationTest.publish
    episode = test_publication.PublicationTest.episode
    evidence = test_publication.PublicationTest.evidence

    def test_add_and_remove_episodes(self):
        episodes = [self.episode(f'{day:02}-example', day) for day in [1, 2, 4, 13]]
        for count in [0, 4, 3, 4, 1, 0]:
            with self.subTest(count=count):
                self.feed['episodes'] = episodes[:count]
                result = self.publish()
                self.assertEqual(result.returncode, 0, result.stderr)
                navigation(self.root)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root', type=Path, help='Disposable copy of the real export')
    changing_real_feed(parser.parse_args().root.resolve())
