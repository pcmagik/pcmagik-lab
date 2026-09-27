/* Measure the actual embedded frame, without depending on YouTube availability. */
const {chromium} = require('playwright');
const fs = require('node:fs');
const base = process.env.ROUND19_URL || 'http://127.0.0.1:8891';
(async () => {
  const browser = await chromium.launch({headless: true});
  const results = [];
  try {
    const page = await browser.newPage();
    await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({body: '<p>Test iframe — geometry only</p>', contentType: 'text/html'}));
    const feed = await (await page.request.get(`${base}/data/episodes.json`)).json();
    const ep = feed.episodes.find(ep => ep.youtube);
    if (!ep) throw Error('Test feed must contain a YouTube episode');
    for (const width of [1920, 390]) {
      await page.setViewportSize({width, height: width === 390 ? 844 : 1080});
      await page.goto(`${base}/episodes/${ep.slug}/`);
      const geometry = await page.locator('.episode-video iframe').evaluate(el => {
        const r = el.getBoundingClientRect();
        return {width: r.width, height: r.height, left: r.left, right: r.right, ratio: getComputedStyle(el).aspectRatio};
      });
      const ok = geometry.ratio === '9 / 16' && Math.abs(geometry.height / geometry.width / (16 / 9) - 1) <= .01 && geometry.width <= 440 && geometry.left >= 0 && geometry.right <= width;
      results.push({width, ok, geometry});
    }
  } finally { await browser.close(); }
  const output = JSON.stringify(results, null, 2);
  if (process.argv[2]) fs.writeFileSync(process.argv[2], output + '\n');
  console.log(output);
  if (!results.every(r => r.ok)) process.exitCode = 1;
})().catch(error => {console.error(error); process.exitCode = 1;});
