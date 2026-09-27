"""Verify analytics on generated wrappers while preserving raw model evidence."""
import json
import re
import subprocess
import unittest
from html.parser import HTMLParser
import test_publication


class PageParser(HTMLParser):
    def __init__(self, markup):
        super().__init__()
        self.scripts = []
        self.feed(markup)

    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            self.scripts.append(dict(attrs))


class AnalyticsTest(unittest.TestCase):
    setUp = test_publication.PublicationTest.setUp
    episode = test_publication.PublicationTest.episode
    evidence = test_publication.PublicationTest.evidence
    publish = test_publication.PublicationTest.publish

    def test_P1_analytics_once_on_wrappers_and_packaged_without_touching_models(self):
        for populated in (False, True):
            with self.subTest(populated=populated):
                self.feed['episodes'] = [self.episode('analytics', 19)] if populated else []
                raw = {run['strona']: (self.root/run['strona']).read_bytes()
                       for ep in self.feed['episodes'] for run in ep['measurements']}
                result = self.publish()
                self.assertEqual(result.returncode, 0, result.stderr)
                for name in ['CNAME', '.nojekyll', 'README.md', 'LICENSE']:
                    (self.root/name).write_text('fixture')
                out = self.root/f'.tmp/pages-{populated}'
                result = subprocess.run(['python3', str(self.root/'bin/package_site.py'), str(out)],
                                        capture_output=True, text=True)
                self.assertEqual(result.returncode, 0, result.stderr)
                wrappers = ['index.html', 'episodes/index.html', '404.html']
                wrappers += [f'episodes/{ep["slug"]}/index.html' for ep in self.feed['episodes']]
                for name in wrappers:
                    for root in (self.root, out):
                        markup = (root/name).read_text()
                        beacons = [s for s in PageParser(markup).scripts
                                   if s.get('src') == 'https://static.cloudflareinsights.com/beacon.min.js']
                        self.assertEqual(len(beacons), 1, str(root/name))
                        self.assertEqual(beacons[0]['type'], 'module')
                        self.assertEqual(json.loads(beacons[0]['data-cf-beacon']),
                                         {'token': '07bc67564faa42ceb381c751c2b66861'})
                        self.assertRegex(markup, r'</script><!-- End Cloudflare Web Analytics -->\s*</body>')
                for name, original in raw.items():
                    self.assertEqual((self.root/name).read_bytes(), original)
                    self.assertEqual((out/name).read_bytes(), original)
                    self.assertNotIn(b'cloudflareinsights.com', original)


CONTACT_EMAIL = "@".join(("serwis", "pcmagik.pl"))
EXPECTED_POLICY = f"""Privacy policy

Last updated: 27 September 2026.

Who runs this site. lab.pcmagik.pl is run by PC Magik Mateusz Piekut, Elizy Orzeszkowej 12b, 05-660 Warka, Poland, NIP 797-197-26-95. Contact: {CONTACT_EMAIL}. We are the data controller for this site.

No accounts, no forms, no tracking cookies. This site has no sign-up and no contact form, and it sets no advertising or analytics cookies. Two things may be stored in your browser. Cloudflare, which delivers the site, sets a security cookie, cf_clearance, to protect the site from bots; it is strictly necessary and is not used to track you. The site itself stores only your choice of the “Pause motion” button (localStorage key lab-motion-paused), and only after you press it; it never leaves your browser.

Visitor statistics — Cloudflare Web Analytics. To know how many people visit and which pages they read, we use Cloudflare Web Analytics. Its script does not use cookies or local storage and does not fingerprint visitors. It sends Cloudflare: the page address, the referring page, browser and operating system type, device type, country, and page load timings. We see only aggregated counts. Cloudflare keeps unsampled data for 7 days and then aggregates it. Legal basis: our legitimate interest in knowing whether the site is read (Art. 6(1)(f) GDPR). Provider: Cloudflare, Inc. (privacy policy: https://www.cloudflare.com/privacypolicy/).

Hosting and delivery. The site is hosted on GitHub Pages (GitHub, Inc.) and delivered through Cloudflare. As with any website, their servers receive your IP address and request details to deliver the pages and protect them from abuse. To tell people from bots, Cloudflare runs a short check script in your browser and keeps the result in the cf_clearance cookie. The cookie is strictly necessary for security, so it does not require consent. Legal basis: Art. 6(1)(f) GDPR.

Embedded videos. Episode pages embed our YouTube videos in privacy-enhanced mode (youtube-nocookie.com). When the page loads, your browser connects to YouTube (Google) to show the player. YouTube may store data in your browser once you play the video. Google privacy policy: https://policies.google.com/privacy.

Links to other sites. Links to YouTube, GitHub, X, LinkedIn and Facebook lead to services with their own privacy policies.

Your rights. Under the GDPR you may ask for access to, correction or deletion of your data, restriction of processing, and you may object to processing. Write to {CONTACT_EMAIL}. You may also complain to the Polish supervisory authority, Prezes Urzędu Ochrony Danych Osobowych (https://uodo.gov.pl).

Changes. When this policy changes, we update the date at the top of this page."""


class PrivacyTest(unittest.TestCase):
    setUp = test_publication.PublicationTest.setUp
    episode = test_publication.PublicationTest.episode
    evidence = test_publication.PublicationTest.evidence
    publish = test_publication.PublicationTest.publish

    def test_P2_P3_exact_policy_shared_shell_and_packaging(self):
        for populated in (False, True):
            with self.subTest(populated=populated):
                self.feed['episodes'] = [self.episode('privacy', 19)] if populated else []
                result = self.publish()
                self.assertEqual(result.returncode, 0, result.stderr)
                privacy = self.root/'privacy/index.html'
                self.assertTrue(privacy.is_file(), '/privacy/ must be generated')
                from html import unescape
                markup = privacy.read_text()
                self.assertNotIn(CONTACT_EMAIL, markup)
                self.assertEqual(markup.count('serwis [at] pcmagik.pl'), 2)
                main = re.search(r'<main\b[^>]*>(.*?)</main>', markup, re.S)[1]
                visible = unescape(re.sub(r'<[^>]+>', '', main))
                self.assertEqual(' '.join(visible.split()), ' '.join(EXPECTED_POLICY.replace(CONTACT_EMAIL, 'serwis [at] pcmagik.pl').split()))
                self.assertIn('href="https://lab.pcmagik.pl/privacy/"', markup)
                home = (self.root/'index.html').read_text()
                wrappers = ['index.html', 'episodes/index.html', 'privacy/index.html', '404.html']
                wrappers += [f'episodes/{ep["slug"]}/index.html' for ep in self.feed['episodes']]
                for name in ['CNAME', '.nojekyll', 'README.md', 'LICENSE']:
                    (self.root/name).write_text('fixture')
                out = self.root/f'.tmp/privacy-{populated}'
                result = subprocess.run(['python3', str(self.root/'bin/package_site.py'), str(out)],
                                        capture_output=True, text=True)
                self.assertEqual(result.returncode, 0, result.stderr)
                for name in wrappers:
                    page = (self.root/name).read_text()
                    footer = re.search(r'<footer>.*?</footer>', page, re.S)[0]
                    self.assertRegex(footer, r'MIT license</a>\s*<a href="/privacy/">Privacy</a>')
                    self.assertEqual(footer, re.search(r'<footer>.*?</footer>', home, re.S)[0])
                    self.assertEqual((out/name).read_bytes(), (self.root/name).read_bytes())
                    self.assertNotIn(CONTACT_EMAIL, (out/name).read_text())
                # The new route uses the same shell, including mobile navigation.
                header = re.search(r'<header>.*?</header>', markup, re.S)[0]
                interior = (self.root/'404.html').read_text()
                self.assertEqual(header, re.search(r'<header>.*?</header>', interior, re.S)[0])
                beacon = [s for s in PageParser(markup).scripts if 'cloudflareinsights' in s.get('src', '')]
                self.assertEqual(len(beacon), 1)
                self.assertEqual(json.loads(beacon[0]['data-cf-beacon']),
                                 {'token': '07bc67564faa42ceb381c751c2b66861'})
                # A stale/missing privacy page must fail the public verification CLI.
                privacy.write_text(markup.replace('Privacy policy', 'Altered policy'))
                checked = subprocess.run(['python3', str(self.root/'bin/build_site.py'), '--check'],
                                         capture_output=True, text=True)
                self.assertNotEqual(checked.returncode, 0)
                self.assertIn('privacy/index.html', checked.stderr)
