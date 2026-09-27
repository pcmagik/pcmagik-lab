/* Verify aggregate results remain available through an accessible disclosure. */
const {chromium} = require('playwright');
const fs = require('node:fs');
const base = process.env.ROUND20_URL || 'http://127.0.0.1:8892';
(async () => {
  const browser=await chromium.launch({headless:true}), results=[];
  const check=(name,ok,detail)=>results.push({name,ok,detail});
  try {
    for(const width of [1920,390]) {
      const page=await browser.newPage({viewport:{width,height:width===390?844:1080},reducedMotion:'reduce'});
      const feed=await (await page.request.get(`${base}/data/episodes.json`)).json();
      const ep=feed.episodes.find(e=>e.slug.startsWith('13-'));
      const count=new Set(ep.measurements.map(r=>r.model)).size;
      await page.goto(`${base}/episodes/${ep.slug}/`);
      const rows=page.locator('.model-table tbody tr'), visible=page.locator('.model-table tbody tr:visible');
      const button=page.getByRole('button',{name:`Show all ${count} models ▸`,exact:true});
      check(`${width}-initial-one`,await visible.count()===1,await visible.count());
      check(`${width}-exception`,(await visible.allTextContents()).every(s=>s.includes('qwen3.8-27b')));
      check(`${width}-header`,await page.locator('.model-table thead').isVisible());
      check(`${width}-button`,await button.count()===1);
      check(`${width}-all-data-preserved`,await rows.count()===count);
      if(await button.count()!==1) {await page.close();continue;}
      const toggle=page.locator('[data-model-toggle]');
      check(`${width}-aria-collapsed`,await toggle.getAttribute('aria-expanded')==='false');
      const controlled=await toggle.getAttribute('aria-controls');
      check(`${width}-controls-table`,controlled && await page.locator(`[id="${controlled}"]`).count()===1);
      check(`${width}-touch-target`,(await toggle.boundingBox()).height>=44);
      await page.screenshot({path:`.screenshots/runda20/models-${width}-collapsed.png`,fullPage:true});
      await toggle.click();
      check(`${width}-click-all`,await visible.count()===count);
      check(`${width}-aria-expanded`,await toggle.getAttribute('aria-expanded')==='true');
      check(`${width}-collapse-label`,(await toggle.textContent()).includes('Show fewer models'));
      await page.screenshot({path:`.screenshots/runda20/models-${width}-expanded.png`,fullPage:true});
      await toggle.click();
      check(`${width}-click-collapse`,await visible.count()===1);
      await toggle.focus();await page.keyboard.press('Shift+Tab');await page.keyboard.press('Tab');
      check(`${width}-tab-focus`,await toggle.evaluate(el=>el===document.activeElement));
      await page.keyboard.press('Enter');
      check(`${width}-keyboard-open`,await visible.count()===count && await toggle.getAttribute('aria-expanded')==='true');
      await page.keyboard.press('Enter');
      check(`${width}-keyboard-close`,await visible.count()===1 && await toggle.getAttribute('aria-expanded')==='false');
      check(`${width}-no-overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.close();
    }
    const page=await browser.newPage({javaScriptEnabled:false});
    const feed=await (await page.request.get(`${base}/data/episodes.json`)).json();
    const ep=feed.episodes.find(e=>e.slug.startsWith('13-'));
    await page.goto(`${base}/episodes/${ep.slug}/`);
    check('no-js-data-accessible',await page.locator('.model-table tbody tr:visible').count()===new Set(ep.measurements.map(r=>r.model)).size);
  } finally {await browser.close();}
  fs.writeFileSync('.claude/evidence/runda20/Z2-browser.json',JSON.stringify(results,null,2)+'\n');
  console.log(JSON.stringify({checks:results.length,passed:results.filter(r=>r.ok).length,failures:results.filter(r=>!r.ok)},null,2));
  if(results.some(r=>!r.ok))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
