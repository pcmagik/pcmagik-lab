const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true}),failures=[],checks=[];
 const check=async(name,fn)=>{try{await fn();checks.push(name);}catch(e){failures.push(name+': '+e.message);}};
 const base=process.argv[2]||'http://127.0.0.1:8892',empty=process.argv[3]||'http://127.0.0.1:8893';
 try {
 for(const width of [1920,390]) {
  const context=await browser.newContext({viewport:{width,height:1080},reducedMotion:'reduce',hasTouch:width===390,isMobile:width===390});
  const page=await context.newPage();
  const styles=async()=>page.locator('article.ep').first().evaluate(el=>{
   const result={};const box=el.getBoundingClientRect();
   for(const selector of ['.chip','time','.button']){const node=el.querySelector(selector),s=getComputedStyle(node),r=node.getBoundingClientRect();result[selector]={font:s.fontFamily,size:s.fontSize,x:r.x-box.x};}
   return result;
  });
  await page.goto(base);await page.waitForLoadState('networkidle');const home=await styles();
  await page.goto(base+'/episodes/');await page.waitForLoadState('networkidle');const list=await styles();
  await check('C6 '+width+' shared typography and positions',async()=>{for(const key of Object.keys(home)){assert.equal(home[key].font,list[key].font);assert.equal(home[key].size,list[key].size);assert(Math.abs(home[key].x-list[key].x)<=2,JSON.stringify({home,list}));}});
  await check('C7 '+width+' screenshot destination label',async()=>{
   for(const shot of await page.locator('.ep-compact .shot').all()){
    assert(!(await shot.innerText()).toLowerCase().includes('explore live'));
    assert(!(await shot.evaluate(el=>getComputedStyle(el,'::after').content)).toLowerCase().includes('explore live'));
   }
  });
  if(width===390)await check('C11 mobile preview fills frame',async()=>{
   for(const shot of await page.locator('.ep-compact .shot').all())assert(await shot.evaluate(el=>{const img=el.querySelector('img');return !img||getComputedStyle(img).objectFit==='cover'||Math.abs(img.getBoundingClientRect().height-img.getBoundingClientRect().width*img.naturalHeight/img.naturalWidth)<2;}));
  });
  const fullHeading=await page.locator('.section-head').first().innerText();
  await page.goto(empty+'/episodes/');
  await check('C8 '+width+' empty archive heading',async()=>{assert.equal(await page.locator('.section-head').count(),1);assert.equal(await page.locator('.section-head').innerText(),fullHeading);assert.equal(await page.locator('main a[href="https://www.youtube.com/@PCMagikLab"]').count(),1);});
  for(const slug of ['02-qwen3.6-27b','13-jeden-model-z-dwunastu']) {
   await page.goto(base+'/episodes/'+slug+'/');
   if(slug.startsWith('13'))await page.locator('.model-runs > summary').first().click();
   await check('C9 '+width+' '+slug+' evidence links',async()=>{
    for(const foot of await page.locator('.run .foot, .run-result .foot').all()){
     const labels=await foot.locator('a').allTextContents();assert.deepEqual(labels.slice(0,3),['Live output ↗','Screenshot ↗','metrics.json']);
     assert.equal(await foot.locator('a[href$="metrics.json"]').count(),1);
    }
   });
   if(width===390) {
    await check('C5 '+slug+' reproduction has no inner scroll',async()=>assert(await page.locator('.reproduction-scroll').evaluate(el=>el.scrollWidth<=el.clientWidth)));
    await check('C10 '+slug+' aligned preview links',async()=>{
     const boxes=await page.locator('.run .foot').first().locator('a').evaluateAll(nodes=>nodes.slice(0,3).map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y};}));
     assert(boxes.every(b=>Math.abs(b.x-boxes[0].x)<2)||boxes.every(b=>Math.abs(b.y-boxes[0].y)<2));
     const shot=page.locator('.run .shot').first();assert(await shot.evaluate(el=>{const s=getComputedStyle(el,'::after');return ['none','normal','""'].includes(s.content)||s.position==='static';}));
     assert(await page.locator('.run .effort-note').first().evaluate(el=>parseFloat(getComputedStyle(el).minHeight)===0));
    });
    await check('C14 '+slug+' touch instruction',async()=>assert(!(await page.locator('.reproduction').innerText()).includes('Hover over')));
   }
  }
  await page.goto(base+'/404.html');
  await check('C17 '+width+' action gap',async()=>{
   const gap=await page.locator('main .button').evaluateAll(nodes=>nodes[1].getBoundingClientRect().x-nodes[0].getBoundingClientRect().right);
   const parentGap=await page.locator('main .button').first().evaluate(el=>parseFloat(getComputedStyle(el.parentElement).gap));assert(gap>=20||parentGap>=20);
  });
  await context.close();
 }
 }finally{await browser.close();}
 console.log(JSON.stringify({passed:checks.length,failures},null,2));if(failures.length)process.exitCode=1;
})();
