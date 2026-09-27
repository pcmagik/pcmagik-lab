/* Real-feed regression: shared episode result structure and measured geometry. */
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
 const base=process.argv[2] || 'http://127.0.0.1:8892';
 const browser=await chromium.launch({headless:true});
 const failures=[], checks=[], geometry=[];
 const check=async(name,fn)=>{try{await fn();checks.push(name);}catch(e){failures.push(name+': '+e.message);}};
 try {
 const page=await browser.newPage({reducedMotion:'reduce'});
 const feed=await (await page.request.get(base+'/data/episodes.json')).json();
 for(const width of [1920,1440,390]) {
  await page.setViewportSize({width,height:1080});
  for(const number of ['01','02','04','13']) {
   const ep=feed.episodes.find(e=>e.slug.startsWith(number+'-'));
   assert(ep,number+' real episode required');
   await page.goto(base+'/episodes/'+ep.slug+'/');
   await page.waitForLoadState('networkidle');
   await check(`C1 ${width} ${number} container`,async()=>assert.equal(await page.locator('.episode-results > .result-hero').count(),1));
   const boxes=await page.evaluate(()=>{
    const hero=document.querySelector('.result-hero');
    const container=hero.closest('.episode-results');
    const next=container?.querySelector('.model-details, .comparison');
    const rect=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x,w:r.width};};
    return {container:rect(container),hero:rect(hero),next:rect(next)};
   });
   geometry.push({width,episode:number,...boxes});
   if(number==='13') {
    await check('C3 '+width+' single heading',async()=>assert.equal(await page.getByRole('heading',{name:'Every run. Every result.',exact:true}).count(),1));
    await check('C3 '+width+' sample note adjacent to table',async()=>assert(await page.locator('.model-table-wrap').evaluate(el=>el.previousElementSibling?.textContent.includes('Sample sizes'))));
    await check('C16 '+width+' model count once',async()=>assert.equal((await page.locator('.episode-intro, .result-hero').innerText().catch(async()=> (await page.locator('.episode-intro').innerText())+(await page.locator('.result-hero').innerText()))).match(/12 models/g)?.length,1));
    await page.locator('.model-runs > summary').first().click();
    await check('C2 '+width+' no nested glass frame',async()=>{
     assert.equal(await page.locator('.model-runs > .episode-results.glass').count(),0);
     const radii=await page.locator('.model-runs').first().evaluate(el=>[parseFloat(getComputedStyle(el).borderRadius),parseFloat(getComputedStyle(el.querySelector('section')).borderRadius)]);
     assert(radii[1]<=radii[0]);
    });
    await check('C4 '+width+' cohort sizes',async()=>{
     for(const text of await page.locator('.model-runs .variant-sample, .model-runs .cohort-heading').allTextContents())assert.match(text,/n=\d+/);
    });
    await check('C4 '+width+' full verdict',async()=>assert(!(await page.locator('.compare-summary').allTextContents()).includes('Overlap')));
   }
   await check('C15 '+width+' '+number,async()=>{
    for(const value of await page.locator('[data-metric-panel="time"] .compare-value').allTextContents())assert.equal((value.match(/min:s/g)||[]).length,1);
   });
  }
  const baseline=geometry.find(r=>r.width===width&&r.episode==='02');
  for(const row of geometry.filter(r=>r.width===width))await check(`C1 ${width} ${row.episode} geometry`,async()=>{
   for(const key of ['container','hero','next'])for(const dim of ['x','w'])assert(row[key]&&Math.abs(row[key][dim]-baseline[key][dim])<=2,`${key}.${dim}: ${JSON.stringify(row[key])} vs ${JSON.stringify(baseline[key])}`);
  });
 }
 fs.mkdirSync('.tmp/runda16',{recursive:true});fs.writeFileSync('.tmp/runda16/results.json',JSON.stringify({checks,failures,geometry},null,2));
 console.log(JSON.stringify({passed:checks.length,failures,geometry},null,2));
 }finally{await browser.close();}
 if(failures.length)process.exitCode=1;
})();
