const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
(async()=>{
 const [base, shots] = process.argv.slice(2);
 const browser = await chromium.launch({headless:true});
 const checks=[], failures=[], measurements=[];
 const check=async(name,fn)=>{try {await fn();checks.push(name);}catch(e){failures.push(name+': '+e.message);}};
 try {
  const page=await browser.newPage({reducedMotion:'reduce'});
  const feed=await(await page.request.get(base+'/data/episodes.json')).json();
  for(const width of [1920,390]) {
   await page.setViewportSize({width,height:width===390?844:1080});
   for(const [route,label] of [['/','home'],['/episodes/','list'],...feed.episodes.map(ep=>['/episodes/'+ep.slug+'/',ep.slug.slice(0,2)])]) {
    await page.goto(base+route); await page.evaluate(()=>document.fonts.ready);
    await page.locator('footer').scrollIntoViewIfNeeded(); await page.evaluate(()=>scrollTo(0,0));
    await page.waitForTimeout(300);
    await check(`${width} ${label} page width`,async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)));
    if(label==='home') measurements.push({width,label,height:await page.evaluate(()=>document.documentElement.scrollHeight),heights:await page.locator('article.ep').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().height))});
    if(['home','list'].includes(label)) {
     await check(`G1/G2 ${width} ${label}`,async()=>{
      const html=await page.content();
      for(const ep of feed.episodes) if(ep.thesis) assert(!html.includes(ep.thesis.claim),'claim leaked: '+ep.slug);
      assert.equal(await page.locator('.result-verdict,.archive-verdict,[data-comparison],[data-metric]').count(),0);
      const cards=page.locator('article.ep');
      assert.equal(await cards.count(),label==='home'?Math.min(3,feed.episodes.length):feed.episodes.length);
      if(label==='home') {
       assert.equal(await cards.locator('img,picture,.runs,.kv').count(),0);
       assert(!/\d+ runs/.test(await cards.allTextContents().then(x=>x.join(' '))));
       const heights=await cards.evaluateAll(els=>els.map(el=>el.getBoundingClientRect().height));
       measurements.push({width,label,heights,height:await page.evaluate(()=>document.documentElement.scrollHeight)});
       if(heights.length) assert(Math.max(...heights)-Math.min(...heights)<=8,JSON.stringify(heights));
      }
      for(const href of await cards.locator('a.button').evaluateAll(els=>els.map(e=>e.getAttribute('href')))) {
       assert(/^\/episodes\/[^/]+\/$/.test(href));
       assert.equal((await page.request.get(base+href)).status(),200);
      }
     });
     if(label==='home' && width===1920 && feed.episodes.length) await check('G3 shorter home',async()=>assert(await page.evaluate(()=>document.documentElement.scrollHeight)<5795));
    } else {
     await check(`R1 ${width} ${label}`,async()=>{
      const result=await page.locator('.reproduction-table').evaluate(table=>{
       const cells=[...table.querySelectorAll('th,td')].filter(el=>el.getBoundingClientRect().height>0);
       const split=[];
       for(const cell of cells) {
        const walker=document.createTreeWalker(cell,NodeFilter.SHOW_TEXT);
        while(walker.nextNode()) {
         const node=walker.currentNode;
         for(const match of node.textContent.matchAll(/[\p{L}\p{N}_]+/gu)) {
          const range=document.createRange();range.setStart(node,match.index);range.setEnd(node,match.index+match[0].length);
          const tops=new Set([...range.getClientRects()].filter(r=>r.width>0).map(r=>Math.round(r.top)));
          if(tops.size>1) split.push(match[0]);
         }
        }
       }
       return {split,single:table.tBodies[0].rows.length===1,scroll:table.parentElement.scrollWidth-table.parentElement.clientWidth,
        display:getComputedStyle(table.tBodies[0].rows[0]).display};
      });
      measurements.push({width,label,...result});
      if(width===390) {
       assert.deepEqual(result.split,[],'words split across lines');
       if(result.single) {assert(result.scroll<=1,'inner horizontal scroll: '+result.scroll);assert.equal(result.display,'block');}
      } else assert.equal(result.display,'table-row');
     });
    }
    if(shots && ['home','list','01','13'].includes(label)) await page.screenshot({path:path.join(shots,`runda13-${feed.episodes.length?'feed':'empty'}-${label}-${width}.png`),fullPage:true});
   }
  }
 } finally {await browser.close();}
 console.log(JSON.stringify({checks,failures,measurements},null,2));
 if(failures.length) process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1);});
