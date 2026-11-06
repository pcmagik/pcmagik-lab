/* Run against the full publication copy; requires Playwright on NODE_PATH. */
const {chromium} = require('playwright');
const fs = require('node:fs');
const base = process.env.ROUND25B_URL || 'http://127.0.0.1:8895';
(async () => {
  const browser = await chromium.launch({headless: true});
  const results = [];
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({viewport: {width, height: 1000}, reducedMotion: 'reduce'});
      await page.goto(`${base}/episodes/24-claude-code-lokalnie/`);
      await page.evaluate(() => document.fonts.ready);
      const checks = await page.evaluate(() => {
        const checks = [];
        const check = (name, ok, detail) => checks.push({name, ok, detail});
        const cards = [...document.querySelectorAll('.output-previews .run')];
        check('two representatives', cards.length === 2);
        for (const card of cards) {
          const bad = [card, ...card.querySelectorAll('*')].filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.width && ((el.clientWidth > 0 && el.scrollWidth > el.clientWidth) || rect.right > card.getBoundingClientRect().right + 1);
          }).map(el => `${el.tagName}.${el.className}`);
          check('representative has no overflow', bad.length === 0, bad);
        }
        const notes = [...document.querySelectorAll('.manual-checks')];
        check('three visible notes', notes.length === 3);
        for (const note of notes) {
          check('note separate from metrics/header', !note.closest('.kv, .run-result-head, strong, b'));
          check('normal note spacing', getComputedStyle(note).letterSpacing === 'normal' || getComputedStyle(note).letterSpacing === '0px');
          const header = note.parentElement.querySelector('.run-result-head, .kv');
          check('note below header/metrics', note.getBoundingClientRect().top >= header.getBoundingClientRect().bottom - 1);
        }
        for (const cohort of document.querySelectorAll('.cohort')) {
          const rows = [...cohort.querySelectorAll('.run-result')];
          const positions = rows.map(row => {
            const head = row.querySelector('.run-result-head').getBoundingClientRect();
            const label = row.querySelector('h4').getBoundingClientRect();
            const score = row.querySelector('.run-effects').getBoundingClientRect();
            check('Run N stays on one line', label.height <= parseFloat(getComputedStyle(row.querySelector('h4')).lineHeight) + 1);
            return [label.left-head.left, label.top-head.top, head.right-score.right, score.top-head.top];
          });
          check('same header positions within 2px', positions.every(pos => pos.every((v,i) => Math.abs(v-positions[0][i]) <= 2)), positions);
        }
        for (const label of document.querySelectorAll('.compare-label')) {
          check('label separated from sample', /\s+n=3/.test(label.textContent));
        }
        const hero = document.querySelector('.result-hero').textContent;
        check('each cohort once in result', (hero.match(/CLAUDE CODE/g)||[]).length === 1 && (hero.match(/PI AGENT/g)||[]).length === 1);
        check('equal range collapsed', !document.querySelector('.comparison').textContent.includes('29–29') && !hero.includes('29–29'));
        return checks;
      });
      results.push({width, checks});
      fs.mkdirSync('.screenshots/runda25b', {recursive: true});
      await page.screenshot({path: `.screenshots/runda25b/layout-${width}.png`, fullPage: true});
      await page.close();
    }
  } finally { await browser.close(); }
  console.log(JSON.stringify(results, null, 2));
  if (results.some(r => r.checks.some(c => !c.ok))) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
