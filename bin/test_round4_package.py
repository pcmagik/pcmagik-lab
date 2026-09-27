"""Exercise the build and package CLI with the extended artifact contract."""
import json
import subprocess
import unittest
import test_publication


class Round4PackageTest(unittest.TestCase):
    setUp=test_publication.PublicationTest.setUp
    episode=test_publication.PublicationTest.episode
    evidence=test_publication.PublicationTest.evidence
    publish=test_publication.PublicationTest.publish

    def fixture(self):
        ep=self.episode('pixel',19)
        ep['prompt_file']='episodes/pixel/prompt.txt'
        ep['task_file']='tasks/pixel.txt'
        r=ep['measurements'][0]
        r['zrzut_390']=r['zrzut'].replace('screenshot.png','mobile.png')
        r['checks']={'passed':7,'total':29,'plik':r['metrics'].replace('metrics.json','pixel-check.json')}
        for path in [ep['prompt_file'],ep['task_file'],r['zrzut_390'],r['checks']['plik']]:
            target=self.root/path
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_text(json.dumps({'score':7,'total':29}))
        self.feed['episodes']=[ep]
        return ep,r

    def test_B17_package_includes_exact_artifacts(self):
        ep,r=self.fixture()
        for name in ['CNAME','.nojekyll','README.md','LICENSE']:
            (self.root/name).write_text('fixture')
        self.assertEqual(self.publish().returncode,0)
        out=self.root/'.tmp/public'
        result=subprocess.run(['python3',str(self.root/'bin/package_site.py'),str(out)],capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stderr)
        for path in [ep['prompt_file'],ep['task_file'],r['zrzut_390'],r['checks']['plik']]:
            self.assertTrue((out/path).is_file(),path)
            self.assertEqual((out/path).read_bytes(),(self.root/path).read_bytes())

    def test_B17_prompt_has_separate_strict_path_validation(self):
        ep,r=self.fixture()
        self.assertEqual(self.publish().returncode,0)
        for path in ['episodes/pixel/../prompt.txt','episodes/other/prompt.txt','episodes/pixel/run/prompt.txt',
                     '/episodes/pixel/prompt.txt','episodes/pixel/prompt.txt?raw=1','episodes/pixel/missing.txt']:
            ep['prompt_file']=path
            result=self.publish()
            self.assertNotEqual(result.returncode,0,path)
        ep['prompt_file']='episodes/pixel/prompt.txt'
        (self.root/ep['prompt_file']).unlink()
        (self.root/ep['prompt_file']).symlink_to(self.root/'data/episodes.json')
        self.assertNotEqual(self.publish().returncode,0)

    def test_B8_checks_and_mobile_paths_validated(self):
        ep,r=self.fixture()
        for key in ['zrzut_390','checks']:
            with self.subTest(key=key):
                original=r[key]
                r[key]='episodes/pixel/../../secret' if key=='zrzut_390' else {'passed':7,'total':29,'plik':'episodes/pixel/../../secret'}
                self.assertNotEqual(self.publish().returncode,0)
                r[key]=original

    def test_B10_checks_must_match_grader_evidence(self):
        ep,r=self.fixture()
        (self.root/r['checks']['plik']).write_text(json.dumps({'score':7,'total':29}))
        self.assertEqual(self.publish().returncode,0)
        r['checks']['passed']=8
        self.assertNotEqual(self.publish().returncode,0)
