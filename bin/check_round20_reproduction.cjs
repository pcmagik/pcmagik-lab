/* Exercise the public pages using the supplied measurement feed. */
const {chromium} = require('playwright');
const fs = require('node:fs');
const base = process.env.ROUND20_URL || 'http://127.0.0.1:8892';
(async () => {
  const browser = await chromium.launch({headless:true});
  const results = [];
  const check = (name, ok, detail) => results.push({name, ok, detail});
  try {
    for (const width of [1920,390]) {
      const page = await browser.newPage({viewport:{width,height:width===390?844:1080},reducedMotion:'reduce'});
      const feed = await (await page.request.get(`${base}/data/episodes.json`)).json();
      for (const ep of feed.episodes) {
        await page.goto(`${base}/episodes/${ep.slug}/`);
        const models = [...new Set(ep.measurements.map(r=>r.odtworzenie.model))];
        const sections = page.locator('#reproduce details');
        const tag = `${ep.slug}-${width}`;
        check(`${tag}-one-disclosure-per-model`,await sections.count()===models.length);
        check(`${tag}-initially-collapsed`,await page.locator('#reproduce details[open]').count()===0);
        check(`${tag}-settings-hidden`,await page.locator('#reproduce [data-field="engine"]:visible').count()===0);
        if (ep.slug.startsWith('13-') && width===390) {
          const height=await page.evaluate(()=>document.documentElement.scrollHeight);
          check(`${tag}-height`,height<=7806,height);
        }
        if (await sections.count()!==models.length) continue;
        check(`${tag}-names`,JSON.stringify(await sections.locator('summary').allTextContents())===JSON.stringify(models));
        if (ep.slug.startsWith('13-')) check(`${tag}-highlight`,await page.locator('#reproduce details.result-separated summary:visible').count()===1);
        const capture = async state => {
          if (/^(13|04)-/.test(ep.slug)) await page.screenshot({path:`.screenshots/runda20/${ep.slug}-${width}-${state}.png`,fullPage:true});
        };
        await capture('collapsed');
        await sections.first().locator('summary').click();
        check(`${tag}-click-opens-only-one`,await page.locator('#reproduce details[open]').count()===1 && await sections.first().locator('[data-field="engine"]').isVisible());
        await capture('one-open');
        await sections.first().locator('summary').click();
        await sections.first().locator('summary').focus();
        await page.keyboard.press('Shift+Tab');
        await page.keyboard.press('Tab');
        check(`${tag}-tab-focus`,await sections.first().locator('summary').evaluate(el=>el===document.activeElement));
        await page.keyboard.press('Enter');
        check(`${tag}-keyboard-opens`,await sections.first().getAttribute('open')!==null);
        await page.keyboard.press('Enter');
        check(`${tag}-keyboard-closes`,await page.locator('#reproduce details[open]').count()===0);
        check(`${tag}-no-overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
        check(`${tag}-touch-target`,(await sections.first().locator('summary').boundingBox()).height>=44);
      }
      await page.close();
    }
  } finally {await browser.close();}
  fs.writeFileSync('.claude/evidence/runda20/Z1-browser.json',JSON.stringify(results,null,2)+'\n');
  console.log(JSON.stringify({checks:results.length,passed:results.filter(r=>r.ok).length,failures:results.filter(r=>!r.ok)},null,2));
  if(results.some(r=>!r.ok)) process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
