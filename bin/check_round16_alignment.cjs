/* Follow-up from visual review: header height and exact repeated-range wording. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true}),failures=[],checks=[];
 const check=async(name,fn)=>{try{await fn();checks.push(name);}catch(e){failures.push(name+': '+e.message);}};
 const base=process.argv[2]||'http://127.0.0.1:8892';
 try {
  const page=await browser.newPage({reducedMotion:'reduce'});
  for(const width of [1920,390]){
   await page.setViewportSize({width,height:1080});await page.goto(base);
   const home=await page.locator('article.ep .ep-h').first().boundingBox();
   await page.goto(base+'/episodes/');
   await check('C6 '+width+' header does not stretch over preview',async()=>{
    const listing=await page.locator('article.ep .ep-h').first().boundingBox();assert(listing.height<=home.height+2,JSON.stringify({home,listing}));
    const card=await page.locator('article.ep').first().boundingBox(),shot=await page.locator('article.ep .shot').first().boundingBox();assert(shot.y+shot.height<=card.y+card.height);
   });
  }
  const feed=await(await page.request.get(base+'/data/episodes.json')).json();
  const series=feed.episodes.find(e=>e.slug.startsWith('13-'));
  for(const number of ['01','02','04']){
   const ep=feed.episodes.find(e=>e.slug.startsWith(number+'-'));
   await page.goto(base+'/episodes/'+ep.slug+'/');
   const verdict=await page.locator('[data-metric-panel="effects"] .compare-summary').innerText();
   await page.goto(base+'/episodes/'+series.slug+'/');
   const panel=page.locator('.model-runs').filter({has:page.locator('summary').filter({hasText:ep.measurements[0].model})});
   await check('C4 '+number+' exact summary matches pair episode',async()=>assert.equal(await panel.locator('[data-metric-panel="effects"] .compare-summary').textContent(),verdict));
  }
  await check('C3 note immediately before its table',async()=>assert(await page.locator('.model-table-wrap').evaluate(el=>el.previousElementSibling.matches('p.measurement-note')&&el.previousElementSibling.textContent.startsWith('Sample sizes'))));
 }finally{await browser.close();}
 console.log(JSON.stringify({passed:checks.length,failures},null,2));if(failures.length)process.exitCode=1;
})();
