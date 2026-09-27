/* Final real-data checks: mobile source selection, actual image widths and links. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true}),report=[];
 const base=process.argv[2]||'http://127.0.0.1:8892';
 try {
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const feed=await(await page.request.get(base+'/data/episodes.json')).json();
 await page.goto(base+'/episodes/');
 for(const card of await page.locator('article.ep').all()){
  const slug=await card.getAttribute('data-episode');
  const ep=feed.episodes.find(e=>e.slug===slug),run=ep.runs.find(r=>!r.zrzut_pusty);
  const img=card.locator('.shot img');if(!await img.count())continue;
  await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());
  const geometry=await img.evaluate(el=>{const r=el.getBoundingClientRect(),s=el.closest('.shot').getBoundingClientRect();return {image:r.width,frame:s.width,height:r.height,natural:[el.naturalWidth,el.naturalHeight],source:el.currentSrc};});
  assert(Math.abs(geometry.image-geometry.frame)<=2,slug+' preview width');
  assert.equal(new URL(geometry.source).pathname,'/'+(run.zrzut_390_kadr||run.zrzut_390||run.zrzut));
  assert(Math.abs(geometry.height-geometry.image*geometry.natural[1]/geometry.natural[0])<=2,slug+' no letterboxing');
  report.push({slug,...geometry});
 }
 const links=new Set();
 for(const route of ['/','/episodes/','/404.html',...feed.episodes.map(e=>'/episodes/'+e.slug+'/')]){
  await page.goto(base+route);await page.waitForLoadState('networkidle');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route+' page overflow');
  for(const href of await page.locator('a[href^="/"]').evaluateAll(nodes=>nodes.map(el=>el.getAttribute('href').split('#')[0])))links.add(href);
 }
 for(const href of links)assert.equal((await page.request.get(base+href)).status(),200,href);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({report,links:links.size,errors},null,2));
 }finally{await browser.close();}
})();
