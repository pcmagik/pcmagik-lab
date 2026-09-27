/* Capture real pages and focused views for side-by-side visual review. */
const {chromium}=require('playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const base=process.argv[2]||'http://127.0.0.1:8892',out='.screenshots/runda16';
 fs.mkdirSync(out,{recursive:true});
 try {
 for(const width of [1920,390]){
  const context=await browser.newContext({viewport:{width,height:1080},reducedMotion:'reduce',isMobile:width===390,hasTouch:width===390});
  const page=await context.newPage();
  for(const [name,route] of [['home','/'],['list','/episodes/'],['02','/episodes/02-qwen3.6-27b/'],['13','/episodes/13-jeden-model-z-dwunastu/']]){
   await page.goto(base+route);await page.waitForLoadState('networkidle');
   await page.locator('footer').scrollIntoViewIfNeeded();await page.evaluate(()=>scrollTo(0,0));
   await page.screenshot({path:`${out}/${name}-${width}-full.png`,fullPage:true});
   if(['home','list'].includes(name))await page.locator('article.ep').first().screenshot({path:`${out}/${name}-${width}-card.png`});
   else {
    await page.locator('.episode-results').first().evaluate(el=>el.scrollIntoView({block:'start'}));
    await page.screenshot({path:`${out}/${name}-${width}-results.png`});
   }
   if(name==='13'){
    await page.locator('.model-runs > summary').first().click();
    await page.locator('.model-runs').first().screenshot({path:`${out}/13-${width}-expanded.png`});
    await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${out}/13-${width}-expanded-full.png`,fullPage:true});
   }
  }
  await context.close();
 }
 }finally{await browser.close();}
 console.log('PASS screenshots: 1920/390 home, list, 02, 13 and expanded model');
})();
