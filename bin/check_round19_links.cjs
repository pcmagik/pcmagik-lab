/* Compare rendered evidence links across representative and every-run cards. */
const {chromium} = require('playwright');
const fs = require('node:fs');
const base = process.env.ROUND19_URL || 'http://127.0.0.1:8891';
(async () => {
  const browser = await chromium.launch({headless: true});
  const results = [];
  try {
    const page = await browser.newPage();
    await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({body: 'Test iframe'}));
    const feed = await (await page.request.get(`${base}/data/episodes.json`)).json();
    for (const width of [1920, 390]) {
      await page.setViewportSize({width, height: width === 390 ? 844 : 1080});
      for (const number of ['01', '02', '04']) {
        const ep = feed.episodes.find(e => e.slug.startsWith(number + '-'));
        if (!ep) throw Error(`Missing episode ${number}`);
        await page.goto(`${base}/episodes/${ep.slug}/`);
        const values = await page.evaluate(() => {
          const collect = selector => Array.from(document.querySelectorAll(selector), foot => {
            const f = foot.getBoundingClientRect();
            const styles = getComputedStyle(foot);
            return {available: f.width, gap: parseFloat(styles.columnGap) || 0, links: Array.from(foot.querySelectorAll('a'), a => {
              const s = getComputedStyle(a), r = a.getBoundingClientRect();
              return {text: a.textContent, color: s.color, weight: s.fontWeight, size: s.fontSize, width: r.width, height: r.height, top: r.top - f.top};
            })};
          });
          return {previews: collect('.output-previews .foot'), runs: collect('.run-result .foot')};
        });
        const reference = values.runs[0].links;
        const styleEqual = values.previews.length === 2 && [...values.previews, ...values.runs].every(foot => foot.links.every(link => {
          const other = reference.find(r => r.text === link.text);
          return other && ['color', 'weight', 'size'].every(key => link[key] === other[key]);
        }));
        const layoutOK = [...values.previews, ...values.runs].every(foot => {
          // Widths in the single-column regression stretch to the card width;
          // use text ranges to determine whether the three labels actually fit.
          return foot.links.every(link => link.height >= 44) && foot.links.every(link => Math.abs(link.top - foot.links[0].top) < 1);
        });
        results.push({episode: number, width, ok: styleEqual && layoutOK, styleEqual, layoutOK, values});
      }
    }
  } finally { await browser.close(); }
  if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify(results.map(({values, ...r}) => r), null, 2));
  if (!results.every(r => r.ok)) process.exitCode = 1;
})().catch(error => {console.error(error); process.exitCode = 1;});
