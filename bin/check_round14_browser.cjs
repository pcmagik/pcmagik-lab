/* Verify real publication pages, links and preview geometry. */
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
(async () => {
 const [base, shots] = process.argv.slice(2);
 const browser = await chromium.launch({headless:true});
 const checks=[], failures=[], geometry=[];
 const check=async(name,fn)=>{try {await fn(); checks.push(name);}catch(e){failures.push(name+': '+e.message);}};
 try {
  const page=await browser.newPage({reducedMotion:'reduce'});
  const feed=await (await page.request.get(base+'/data/episodes.json')).json();
  for(const width of [1920,390]) {
   await page.setViewportSize({width,height:width===390?844:1080});
   for(const [route,label] of [['/','home'],['/episodes/','list']]) {
    await page.goto(base+route); await page.evaluate(()=>document.fonts.ready);
    await page.locator('footer').scrollIntoViewIfNeeded(); await page.evaluate(()=>scrollTo(0,0));
    await page.waitForTimeout(300);
    await check(`${width} ${label} width`,async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)));
    await check(`B1 ${width} ${label}`,async()=>{
     assert(!(await page.content()).includes('Test materials'));
     for(const button of await page.locator('article.ep a.button').all()) {
      assert.equal(await button.innerText(),'See the results →');
      assert.equal((await page.request.get(base+await button.getAttribute('href'))).status(),200);
     }
    });
    await check(`B2 ${width} ${label}`,async()=>assert(!(await page.content()).includes('Newest run dates first')));
    if(label==='list') for(const card of await page.locator('article.ep').all()) {
     const slug=await card.getAttribute('data-episode');
     const box=await card.locator('.shot').evaluate(el=>{
      const img=el.querySelector('img'); if(!img) return null;
      const rect=r=>({x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right});
      const label=el.querySelector('.shot-label');
      let button;
      if(label) button=rect(label.getBoundingClientRect());
      else {
       const p=getComputedStyle(el,'::after'), r=el.getBoundingClientRect();
       const w=parseFloat(p.width)+parseFloat(p.paddingLeft)+parseFloat(p.paddingRight)+2*parseFloat(p.borderLeftWidth);
       const h=parseFloat(p.height)+parseFloat(p.paddingTop)+parseFloat(p.paddingBottom)+2*parseFloat(p.borderTopWidth);
       const right=r.right-parseFloat(p.right), bottom=r.bottom-parseFloat(p.bottom);
       button={x:right-w,y:bottom-h,width:w,height:h,right,bottom};
      }
      return {image:rect(img.getBoundingClientRect()),button,shot:rect(el.getBoundingClientRect())};
     });
     geometry.push({width,slug,...box});
     if(width===390 && box) await check(`B4 ${slug}`,async()=>{
      const a=box.image,b=box.button;
      assert(Number.isFinite(b.y),'button rectangle missing');
      assert(b.y>=a.bottom || b.bottom<=a.y || b.x>=a.right || b.right<=a.x,'Explore live overlaps preview');
      assert(b.height>=44,'touch target below 44px');
     });
    }
    if(shots) await page.screenshot({path:path.join(shots,`${feed.episodes.length?'feed':'empty'}-${label}-${width}.png`),fullPage:true});
   }
  }
  for(const ep of feed.episodes) await check('B3 '+ep.slug,async()=>{
   await page.goto(base+'/episodes/'+ep.slug+'/');
   const prompt=page.locator('a').filter({hasText:/^Prompt(?: ↗)?$/});
   assert.equal(await prompt.count(),1);
   assert.equal(await page.locator('#materials a').filter({hasText:/^Prompt(?: ↗)?$/}).count(),1);
   for(const link of await page.locator('a').filter({hasText:/^(?:Prompt|Karpathy rules file)(?: ↗)?$/}).all())
    assert.equal((await page.request.get(base+await link.getAttribute('href'))).status(),200);
   const rules=ep.measurements.some(r=>r.wariant==='karpathy' && r.odtworzenie?.rules);
   if(rules) assert(await page.locator('#reproduce a').filter({hasText:'Karpathy rules file'}).count()>0);
  });
 } finally {await browser.close();}
 console.log(JSON.stringify({checks,failures,geometry},null,2));
 if(failures.length) process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1);});
