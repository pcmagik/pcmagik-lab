"""Regressions at the post-publication CLI boundary."""
import json
import unittest
import test_publication

class IntegrityTest(unittest.TestCase):
    setUp = test_publication.PublicationTest.setUp
    episode = test_publication.PublicationTest.episode
    evidence = test_publication.PublicationTest.evidence
    publish = test_publication.PublicationTest.publish
    generated = test_publication.PublicationTest.generated

    def test_thinking_percentage_must_agree_with_tokens(self):
        ep = self.episode('first', 19)
        ep['runs'][0].update(tokeny=19321, tokeny_myslenia=334)
        self.evidence(ep['runs'][0])
        ep['runs'][0]['myslenie_pct'] = 1
        self.feed['episodes'] = [ep]
        result = self.publish()
        self.assertNotEqual(result.returncode, 0, 'Truncated 1% must not reach the page')
        self.assertIn('thinking percentage', result.stderr)

    def test_feed_measurement_must_match_raw_metrics(self):
        ep = self.episode('first', 19)
        run = ep['runs'][0]
        (self.root/run['metrics']).write_text(json.dumps({'model':'different/model'}))
        self.feed['episodes'] = [ep]
        result = self.publish()
        self.assertNotEqual(result.returncode, 0, 'Feed must be checked against evidence')

    def test_real_episode_slug_with_model_version(self):
        self.feed['episodes'] = [self.episode('02-qwen3.6-27b', 20)]
        result = self.publish()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue((self.root/'episodes/02-qwen3.6-27b/index.html').is_file())

    def test_missing_thinking_is_not_zero(self):
        ep = self.episode('first',19)
        ep['runs'][0]['tokeny_myslenia'] = None
        self.evidence(ep['runs'][0])
        self.feed['episodes'] = [ep]
        result = self.publish()
        self.assertEqual(result.returncode,0,result.stderr)
        self.assertIn('<b>not measured yet</b><small>thinking</small>',(self.root/'index.html').read_text())

    def test_missing_member_of_declared_cohort_is_rejected(self):
        ep = self.episode('first',19)
        ep['cohorts'] = [{'model':'test/model','wariant':'bare','n':3}]
        self.feed['episodes'] = [ep]
        result = self.publish()
        self.assertNotEqual(result.returncode,0)
        self.assertIn('incomplete declared cohort',result.stderr)

    def test_effects_must_match_evidence_including_zero(self):
        ep = self.episode('first',19)
        ep['runs'][0]['efekty'] = 0
        self.evidence(ep['runs'][0])
        self.feed['episodes'] = [ep]
        self.assertEqual(self.publish().returncode,0)
        ep['runs'][0]['efekty'] = 99
        result = self.publish()
        self.assertNotEqual(result.returncode,0)
        self.assertIn('effects differ',result.stderr)
