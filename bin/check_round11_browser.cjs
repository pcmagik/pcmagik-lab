const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const [base, source] = process.argv.slice(2);
  const browser = await chromium.launch({headless:true});
  const checks = [], failures = [];
  try {
    const page = await browser.newPage({reducedMotion:'reduce'});
    const feed = await (await page.request.get(base+'/data/episodes.json')).json();
    const check = async (name, fn) => {try {await fn(); checks.push(name);} catch(e) {failures.push(`${name}: ${e.message}`);}};
    for (const width of [1920,390]) {
      await page.setViewportSize({width,height:width===390?844:1080});
      if (!feed.episodes.length) {
        for (const route of ['/', '/episodes/', '/404.html']) {
          await page.goto(base+route);
          await check(`empty ${width} ${route}`, async()=>{
            assert.equal(await page.locator('#reproduce').count(),0);
            assert(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth));
          });
        }
      }
      for (const ep of feed.episodes) {
        await page.goto(`${base}/episodes/${ep.slug}/`);
        const section = page.locator('#reproduce');
        await check(`O1 ${width} ${ep.slug}`, async()=>{
          assert(await section.isVisible());
          assert.equal(await section.locator('h2').innerText(),'How to reproduce');
          assert.equal(await section.locator('tbody tr').count(),new Set(ep.measurements.map(r=>r.odtworzenie.model)).size);
          const rect=await section.boundingBox();
          const runs=await page.locator('#all-runs').boundingBox();
          assert(rect.y > runs.y + runs.height);
          if(await page.locator('.model-table').count()) {
            const table=await page.locator('.model-table').boundingBox();
            assert(rect.y >= table.y + table.height);
          }
        });
        await check(`O2 ${width} ${ep.slug}`, async()=>{
          const expected=[...new Set(ep.measurements.filter(r=>r.wariant==='karpathy').map(r=>r.odtworzenie.rules).filter(Boolean))];
          const links=section.getByRole('link',{name:'Karpathy rules file'});
          assert.equal(await links.count(),expected.length);
          for(let i=0;i<expected.length;i++) {
            const href=await links.nth(i).getAttribute('href');
            assert.equal(href,'/'+expected[i]);
            const response=await page.request.get(base+href);
            assert.equal(response.status(),200);
            assert.deepEqual(await response.body(),fs.readFileSync(path.join(source,expected[i])));
            if(width===390) {
              const box=await links.nth(i).boundingBox();
              assert(box.height>=44 && box.width>=44);
            }
          }
          const prompt=section.getByRole('link',{name:'Prompt ↗',exact:true});
          assert.equal(await prompt.getAttribute('href'),'/'+ep.prompt_file);
          const response=await page.request.get(base+'/'+ep.prompt_file);
          assert.equal(response.status(),200);
          assert.deepEqual(await response.body(),fs.readFileSync(path.join(source,ep.prompt_file)));
        });
        await check(`O3 ${width} ${ep.slug}`, async()=>{
          assert(!(await section.innerText()).includes('not measured yet'));
          const rows=section.locator('tbody tr');
          for(let i=0;i<await rows.count();i++) {
            const row=rows.nth(i), model=await row.getAttribute('data-model');
            const records=ep.measurements.filter(r=>r.odtworzenie.model===model).map(r=>r.odtworzenie);
            for(const field of ['quantization','kv_cache','engine']) {
              const cell=row.locator(`[data-field="${field}"]`);
              const titles=await cell.locator('[title]').evaluateAll(nodes=>nodes.map(n=>n.title).join('; '));
              for(const record of records) {
                assert(titles.includes(record[field].source));
                assert((await cell.innerText()).includes(record[field].value ?? 'not recorded'));
              }
            }
          }
        });
        await check(`O4 ${width} ${ep.slug}`, async()=>{
          const result=await section.evaluate(el=>{
            const scroll=el.querySelector('.reproduction-scroll');
            const before=scroll.scrollLeft;scroll.scrollLeft=120;
            const moved=scroll.scrollLeft>before;scroll.scrollLeft=0;
            return {page:document.documentElement.scrollWidth,viewport:innerWidth,
              scroll:scroll.scrollWidth,client:scroll.clientWidth,moved,
              fonts:[...el.querySelectorAll('th,td,a')].map(n=>parseFloat(getComputedStyle(n).fontSize)),
              cells:[...el.querySelectorAll('th,td')].every(n=>n.clientWidth>0 && n.textContent.trim())};
          });
          assert(result.page<=result.viewport,`page overflow ${result.page} > ${result.viewport}`);
          assert(result.cells && result.fonts.every(n=>n>=11));
          if(result.scroll>result.client) assert(result.moved,'table must scroll independently');
        });
        await page.evaluate(async()=>{
          await document.fonts.ready;
          for(const img of document.images){img.loading='eager';await img.decode().catch(()=>{});}
        });
        if(['01','04','13'].includes(ep.slug.slice(0,2))) {
          fs.mkdirSync('.screenshots',{recursive:true});
          await page.screenshot({path:`.screenshots/runda11-${ep.slug.slice(0,2)}-${width}.png`,fullPage:true});
          await section.screenshot({path:`.screenshots/runda11-${ep.slug.slice(0,2)}-${width}-settings.png`});
        }
      }
    }
    console.log(JSON.stringify({base,checks,failures},null,2));
    if(failures.length) process.exitCode=1;
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
