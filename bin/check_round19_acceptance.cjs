/* End-to-end assertions against the real publication feed and generated HTML. */
const {chromium} = require('playwright');
const fs = require('node:fs');
const base = process.env.ROUND19_URL || 'http://127.0.0.1:8891';
(async () => {
  const browser = await chromium.launch({headless: true});
  const results = [], errors = [];
  fs.mkdirSync('.screenshots/runda19', {recursive: true});
  const check = (name, ok, detail) => {results.push({name, ok, detail});};
  try {
    const request = await browser.newPage();
    const feed = await (await request.request.get(`${base}/data/episodes.json`)).json();
    const episodes = [...feed.episodes].sort((a,b) => b.published.localeCompare(a.published) || b.slug.localeCompare(a.slug));
    for (const width of [1920, 390]) {
      const page = await browser.newPage({viewport: {width, height: width === 390 ? 844 : 1080}, isMobile: width === 390, hasTouch: width === 390, reducedMotion: 'reduce'});
      page.on('pageerror', e => errors.push(e.message));
      await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({contentType: 'text/html', body: '<body style="background:#111827;color:white;font:20px system-ui;display:grid;place-content:center;height:90vh;text-align:center">Test iframe<br>9:16<br>Geometry only</body>'}));
      const cases = [['home','/'], ['list','/episodes/'], ...episodes.map(ep => [ep.slug, `/episodes/${ep.slug}/`, ep])];
      for (const [name,path,ep] of cases) {
        const response = await page.goto(base + path);
        check(`${name}-${width}-http`, response.status() === 200, response.status());
        const markup = await page.content();
        check(`${name}-${width}-no-run-date`, !markup.includes('Run date'));
        check(`${name}-${width}-no-overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        if (ep) {
          const published = await page.locator('.episode-intro time').getAttribute('datetime');
          check(`${name}-${width}-publication`, published === ep.published, published);
          const titles = await page.locator('[title]').evaluateAll(elements => elements.map(el => el.title));
          check(`${name}-${width}-titles-no-paths`, titles.every(t => !t.includes('seria/')), titles);
          const sources = [...new Set(ep.measurements.flatMap(r => Object.values(r.odtworzenie || {}).filter(v => v && typeof v === 'object' && v.source).map(v => v.source)))];
          for (const source of sources) {
            const dates = source.match(/\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?/g) || [];
            const prefix = source.split(' (')[0];
            check(`${name}-${width}-source-preserved`, titles.some(t => t.includes(prefix) && dates.every(d => t.includes(d))), {source, dates});
          }
        } else {
          const cards = await page.locator('[data-episode]').evaluateAll(elements => elements.map(el => ({slug: el.dataset.episode, date: el.querySelector('time')?.dateTime, label: el.querySelector('time')?.textContent})));
          const expected = name === 'home' ? episodes.slice(0,3) : episodes;
          check(`${name}-${width}-cards`, JSON.stringify(cards) === JSON.stringify(expected.map(ep => ({slug: ep.slug, date: ep.published, label: `Published ${ep.published}`}))), cards);
          if (name === 'home') check(`${name}-${width}-latest`, await page.locator('.telemetry-run time').getAttribute('datetime') === episodes[0].published);
        }
        // Trigger lazy previews before taking the full-page evidence screenshot.
        await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) {scrollTo(0,y); await new Promise(r => setTimeout(r,30));} scrollTo(0,0); });
        await page.waitForTimeout(150);
        await page.screenshot({path: `.screenshots/runda19/${name}-${width}.jpg`, fullPage: true, type: 'jpeg', quality: 70});
        if (name === 'home') {
          await page.locator('[data-episode]').first().screenshot({path: `.screenshots/runda19/card-${width}.png`});
          await page.locator('.telemetry-run').screenshot({path: `.screenshots/runda19/latest-${width}.png`});
        }
        if (ep?.youtube) await page.locator('.episode-video').screenshot({path: `.screenshots/runda19/player-${width}.png`});
        if (ep?.slug.startsWith('02-')) {
          await page.locator('.episode-intro').screenshot({path: `.screenshots/runda19/intro-${width}.png`});
          await page.locator('.output-previews .run').first().screenshot({path: `.screenshots/runda19/links-${width}.png`});
        }
      }
      await page.close();
    }
    check('no-js-errors', !errors.length, errors);
  } finally { await browser.close(); }
  fs.writeFileSync('.claude/evidence/runda19/acceptance.json', JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify({checks: results.length, passed: results.filter(r => r.ok).length, failures: results.filter(r => !r.ok)}, null, 2));
  if (!results.every(r => r.ok)) process.exitCode = 1;
})().catch(error => {console.error(error); process.exitCode = 1;});
