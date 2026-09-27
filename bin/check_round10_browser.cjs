/* Exercise the navigation on the real publication and the empty site. */
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const base = process.argv[2];
  const browser = await chromium.launch({headless:true});
  const failures = [], checks = [];
  try {
    const page = await browser.newPage({reducedMotion:'reduce'});
    const feed = await (await page.request.get(base+'/data/episodes.json')).json();
    const routes = [['home','/'],['list','/episodes/'],['404','/404.html'],...feed.episodes.map(e=>[e.slug.slice(0,2),`/episodes/${e.slug}/`])];
    for (const width of [1920,390]) {
      await page.setViewportSize({width,height:width===390?844:1080});
      const normalized = [];
      for (const [name, route] of routes) {
        await page.goto(base+route);
        if(width===390) await page.locator('.mobile-nav summary').click();
        const menu=page.locator(width===390?'.mobile-links':'nav[aria-label="Main navigation"]');
        const links=menu.locator('a');
        const run=async (point, fn)=>{try{await fn();checks.push(`${point} ${width} ${name}`);}catch(e){failures.push(`${point} ${width} ${name}: ${e.message}`);}};
        await run('N1',async()=>{
          assert.equal(await menu.locator('sup').count(),feed.episodes.length?1:0);
          assert.equal(await links.first().locator('sup').count(),0);
          if(feed.episodes.length) assert.equal(await menu.locator('sup').innerText(),String(feed.episodes.length).padStart(2,'0'));
        });
        await run('N2',async()=>{
          assert.deepEqual(await links.allTextContents(),['Benchmarks',`Episodes${feed.episodes.length?' '+String(feed.episodes.length).padStart(2,'0'):''}`,'The process','Repository ↗',...(width===390?['YouTube ↗']:[])]);
          assert.deepEqual(await links.evaluateAll(a=>a.map(e=>e.getAttribute('href'))),[name==='home'?'#episodes':'/#episodes','/episodes/','/#method','https://github.com/pcmagik/pcmagik-lab',...(width===390?['https://www.youtube.com/@PCMagikLab']:[])]);
          assert.equal((await page.request.get(base+'/episodes/')).status(),200);
        });
        await run('N3',async()=>{
          const active=['home','404'].includes(name)?null:name==='list'?'page':'true';
          assert.equal(await links.nth(1).getAttribute('aria-current'),active);
          assert.equal(await menu.locator('[aria-current]').count(),active?1:0);
          if(active){
            assert(await links.nth(1).isVisible());
            const style=await links.nth(1).evaluate(e=>{const s=getComputedStyle(e);return [s.color,s.textDecorationLine];});
            assert.notEqual(style[0],await links.first().evaluate(e=>getComputedStyle(e).color));
            assert(style[1].includes('underline'));
          }
        });
        normalized.push(await menu.evaluate(e=>e.outerHTML.replace(/ aria-current="[^"]*"/g,'').replace('href="#episodes"','href="/#episodes"')));
        await page.evaluate(async()=>{
          await document.fonts.ready;
          for(const img of document.images){img.loading='eager';await img.decode().catch(()=>{});}
        });
        if(['home','list','13'].includes(name)) await page.screenshot({path:`.screenshots/runda12-${feed.episodes.length?'feed':'empty'}-${name}-${width}.png`,fullPage:false});
        if(!['home','404','list'].includes(name)) await run('N2-click',async()=>{
          await links.nth(2).click();
          await page.waitForURL(base+'/#method');
          await page.waitForFunction(()=>Math.abs(document.querySelector('#method').getBoundingClientRect().top)<innerHeight);
          assert(await page.evaluate(()=>scrollY>0));
        });
      }
      try{assert.equal(new Set(normalized).size,1);}catch(e){failures.push(`N4 ${width}: different menus`);}
    }
    console.log(JSON.stringify({base,checks,failures},null,2));
    if(failures.length) process.exitCode=1;
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
