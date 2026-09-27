/* Contrast from rendered foreground and a glyph-free frozen background. */
const {chromium}=require('playwright');
const fs=require('node:fs');
const {spawnSync}=require('node:child_process');
const phase=process.argv[2]||'after';
const records=[];
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const discovery=await browser.newPage();const feed=await (await discovery.request.get('http://127.0.0.1:8876/data/episodes.json')).json();await discovery.close();
  const cases=[['home','http://127.0.0.1:8876/'],['list','http://127.0.0.1:8876/episodes/'],...['02','13'].map(n=>[n,'http://127.0.0.1:8876/episodes/'+feed.episodes.find(e=>e.slug.startsWith(n+'-')).slug+'/']),['empty','http://127.0.0.1:8877/']];
  for(const width of [1920,390])for(const [view,url] of cases){
   const page=await browser.newPage({viewport:{width,height:width===390?844:1080},hasTouch:width===390,isMobile:width===390});
   await page.goto(url);await page.waitForLoadState('networkidle');await page.waitForTimeout(3000);
   for(const [name,selector,text] of [['card','.ep:nth-child(2)','h3'],['closing','.closing, .episode-materials','h2, .eyebrow, .closing-bottom p, .study-note'],['process','.fx-spotlight','h3, p']]){
    const loc=page.locator(selector).first();if(!await loc.count())continue;await loc.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
    if(width===1920)await loc.hover();await page.waitForTimeout(1200);
    await page.evaluate(()=>{document.getAnimations().forEach(a=>a.pause());window.gsap?.globalTimeline.pause();});
    await page.screenshot({path:`.screenshots/runda18/${phase}/${view}-${name}-${width}-visible.png`});
    const boxes=await loc.locator(text).evaluateAll(els=>els.flatMap(el=>[el,...el.querySelectorAll('em')]).map(el=>{const b=el.getBoundingClientRect(),s=getComputedStyle(el);return {x:b.x,y:b.y,width:b.width,height:b.height,color:s.color,gradient:s.backgroundImage};}));
    await page.addStyleTag({content:'*, *::before, *::after { transition: none !important; }'});
    await loc.locator(text).evaluateAll(els=>els.forEach(el=>{el.style.color='transparent';el.style.backgroundImage='none';el.querySelectorAll('*').forEach(child=>{child.style.color='transparent';child.style.backgroundImage='none';});}));
    const path=`.screenshots/runda18/${phase}/${view}-${name}-${width}-contrast.png`;
    await page.screenshot({path});
    const p=spawnSync('python3',['bin/round18_contrast.py',path,JSON.stringify(boxes)],{encoding:'utf8'});
    if(p.status)throw Error(p.stderr);
    const values=JSON.parse(p.stdout);records.push({id:'K12',where:`${view}-${name}-${width}`,values,ok:values.every(v=>v>=4.5)});
    await page.reload();await page.waitForLoadState('networkidle');await page.waitForTimeout(1500);
   }
   await page.close();

  }
 }finally{await browser.close();}
 fs.writeFileSync(`.claude/evidence/runda18/${phase}-contrast-matrix.json`,JSON.stringify(records,null,2));console.log(JSON.stringify(records,null,2));if(records.some(r=>!r.ok))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
