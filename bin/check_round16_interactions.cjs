const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true}),failures=[],checks=[];
 const check=async(name,fn)=>{try{await fn();checks.push(name);}catch(e){failures.push(name+': '+e.message);}};
 const base=process.argv[2]||'http://127.0.0.1:8892';
 try {
  for(const route of ['/','/episodes/','/episodes/13-jeden-model-z-dwunastu/']) {
   const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
   const page=await context.newPage();await page.goto(base+route);await page.waitForLoadState('networkidle');
   const menu=page.locator('.mobile-nav'),button=menu.locator('summary');
   await button.click();await page.keyboard.press('Escape');
   await check('C12 Esc '+route,async()=>{assert.equal(await menu.getAttribute('open'),null);assert(await button.evaluate(el=>el===document.activeElement));});
   await menu.evaluate(el=>el.open=false);await button.click();await page.touchscreen.tap(380,800);
   await check('C12 outside '+route,async()=>{assert.equal(await menu.getAttribute('open'),null);assert(await button.evaluate(el=>el===document.activeElement));});
   await menu.evaluate(el=>el.open=false);
   await page.locator('.motion-toggle').click();await page.reload();
   await check('C13 reload '+route,async()=>assert.equal(await page.locator('.motion-toggle').getAttribute('aria-pressed'),'true'));
   await page.goto(base+'/404.html');
   await check('C13 navigation '+route,async()=>{assert.equal(await page.locator('.motion-toggle').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('html').getAttribute('data-motion'),'paused');});
   await context.close();
  }
  const context=await browser.newContext();await context.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('Storage blocked');};Storage.prototype.setItem=()=>{throw new Error('Storage blocked');};});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.locator('.motion-toggle').click();
  await check('C13 denied storage remains functional',async()=>{assert.equal(errors.length,0);assert.equal(await page.locator('.motion-toggle').getAttribute('aria-pressed'),'true');});await context.close();
 }finally{await browser.close();}
 console.log(JSON.stringify({passed:checks.length,failures},null,2));if(failures.length)process.exitCode=1;
})();
