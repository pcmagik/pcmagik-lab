async page => {
 const base='http://127.0.0.1:4173';
 const check=(v,m)=>{if(!v)throw Error(m);};
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1920,height:1080});
 await page.emulateMedia({reducedMotion:'reduce'});
 const styleProbe=()=>Object.fromEntries(['body','.header-inner','h1','.scene','.hero-bottom','.comparison','.compare-row','.kv','.m','.closing'].map(selector=>{const el=document.querySelector(selector),s=getComputedStyle(el);return [selector,Object.fromEntries(['fontFamily','fontSize','lineHeight','padding','margin','gap','gridTemplateColumns','borderRadius','backgroundColor'].map(key=>[key,s[key]]))]}));
 await page.goto(base+'/.tmp/visual-reference/');
 const original=await page.evaluate(styleProbe);
 for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=800)await page.evaluate(y=>scrollTo(0,y),y);
 await page.evaluate(()=>scrollTo(0,0));
 await page.screenshot({path:'.screenshots/reference-neon-1920.png',fullPage:true});
 await page.goto(base);
 const updated=await page.evaluate(styleProbe);
 for(const [selector,styles] of Object.entries(original)){
  const current=updated[selector];
  for(const [property,value] of Object.entries(styles)){
   if(property==='fontSize')check(parseFloat(current[property])===Math.max(11,parseFloat(value)),`Font floor: ${selector}`);
   else if(property==='lineHeight'&&parseFloat(styles.fontSize)<11)check(Math.abs(parseFloat(current[property])-parseFloat(value)*11/parseFloat(styles.fontSize))<.1,`Line height: ${selector}`);
   else check(current[property]===value,`Original style changed: ${selector} ${property}`);
  }
 }
 check(await page.locator('.runs .shot img').count()===2,'Two previews');
 check(await page.locator('.runs img').evaluateAll(es=>es.every(e=>e.complete&&e.naturalWidth>0)),'Previews loaded');
 for(const [key,expected] of [['tokens','18,858–22,049'],['throughput','52.50–56.30'],['effects','129–155'],['time','5:38–7:00']]){
  await page.locator(`[data-metric="${key}"]`).click();
  const panel=page.locator(`[data-metric-panel="${key}"]`);check(await panel.isVisible(),'Metric panel visible');check((await panel.innerText()).includes(expected),'Range '+key);
 }
 check((await page.locator('.compare-summary:visible').innerText()).includes('ranges overlap'),'Time overlap');
 for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=800)await page.evaluate(y=>scrollTo(0,y),y);
 await page.evaluate(()=>scrollTo(0,0));
 await page.screenshot({path:'.screenshots/restored-neon-desktop.png',fullPage:true});
 const localUrls=await page.locator('a[href],img[src],script[src],link[href]').evaluateAll(es=>[...new Set(es.map(e=>e.href||e.src).filter(u=>typeof u==='string'&&u.startsWith(location.origin)))]);
 for(const url of localUrls)check((await page.request.get(url)).ok(),'Broken local URL '+url);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto(base);await page.getByRole('button',{name:'Rotate core'}).waitFor();
 await page.locator('[data-metric="effects"]').click();
 await page.waitForTimeout(650);
 check((await page.locator('[data-metric-panel="effects"] .bare-bar').getAttribute('style')).includes('100%'),'Animated bar reaches target');
 await page.getByRole('button',{name:'Pause motion'}).click();
 check(await page.locator('html').getAttribute('data-motion')==='paused','Pause');
 const before=(await page.locator('#neural-canvas').screenshot()).toString('base64');
 await page.getByRole('button',{name:'Rotate core'}).click();
 const after=(await page.locator('#neural-canvas').screenshot()).toString('base64');check(before!==after,'Rotate core updates image');
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [320,390,768,1024,1440,1920]){
  await page.setViewportSize({width,height:900});await page.goto(base);
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow '+width);
  if(width===390){
   await page.locator('.mobile-nav summary').click();await page.locator('.mobile-links a[href="#method"]').click();check(!await page.locator('.mobile-nav').evaluate(e=>e.open),'Mobile menu closes');
   for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=700)await page.evaluate(y=>scrollTo(0,y),y);
   await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'.screenshots/restored-neon-mobile.png',fullPage:true});
  }
 }
 const noJS=await page.context().browser().newContext({javaScriptEnabled:false,viewport:{width:1920,height:1080}});const fallback=await noJS.newPage();await fallback.goto(base);
 check((await fallback.locator('.compare-summary:visible').innerText()).includes('ranges overlap'),'Static ranges without JS');check(await fallback.locator('.runs .shot').count()===2,'Static previews');await noJS.close();
 await page.route('**/assets/vendor/**',r=>r.abort());await page.goto(base);await page.locator('[data-metric="effects"]').click();check(await page.locator('[data-metric-panel="effects"]').isVisible(),'Controls without GSAP/Three');await page.unroute('**/assets/vendor/**');
 // Optional blocked modules generate network errors, not page exceptions.
 check(errors.length===0,'JS exceptions '+errors.join('; '));
 await page.goto(base);return ['PASS original typography/spacing/layout', 'PASS 4 range controls, previews and local links', 'PASS pause/rotation, 6 widths, mobile menu', 'PASS no-JS and no-GSAP/Three fallback; no JS exceptions'];
}
