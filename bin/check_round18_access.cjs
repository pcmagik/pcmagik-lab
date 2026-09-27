/* Contrast from rendered foreground and a glyph-free frozen background. */
const {chromium}=require('playwright');
const fs=require('node:fs');
const {spawnSync}=require('node:child_process');
const phase=process.argv[2]||'after';
const records=[];
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of [1920,390]){
   const page=await browser.newPage({viewport:{width,height:width===390?844:1080},hasTouch:width===390,isMobile:width===390});
   await page.goto('http://127.0.0.1:8876/');await page.waitForLoadState('networkidle');await page.waitForTimeout(3000);
   for(const [name,selector,text] of [['card','.ep:nth-child(2)','h3'],['closing','.closing','h2, .eyebrow, .closing-bottom p']]){
    const loc=page.locator(selector);await loc.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
    if(width===1920)await loc.hover();await page.waitForTimeout(1200);
    await page.evaluate(()=>{document.getAnimations().forEach(a=>a.pause());window.gsap?.globalTimeline.pause();});
    const boxes=await loc.locator(text).evaluateAll(els=>els.flatMap(el=>[el,...el.querySelectorAll('em')]).map(el=>{const b=el.getBoundingClientRect(),s=getComputedStyle(el);return {x:b.x,y:b.y,width:b.width,height:b.height,color:s.color,gradient:s.backgroundImage};}));
    await page.addStyleTag({content:'*, *::before, *::after { transition: none !important; }'});
    await loc.locator(text).evaluateAll(els=>els.forEach(el=>{el.style.color='transparent';el.style.backgroundImage='none';el.querySelectorAll('*').forEach(child=>{child.style.color='transparent';child.style.backgroundImage='none';});}));
    const path=`.screenshots/runda18/${phase}/${name}-${width}-contrast.png`;
    await page.screenshot({path});
    const p=spawnSync('python3',['bin/round18_contrast.py',path,JSON.stringify(boxes)],{encoding:'utf8'});
    if(p.status)throw Error(p.stderr);
    const values=JSON.parse(p.stdout);records.push({id:'K12',where:`${name}-${width}`,values,ok:values.every(v=>v>=4.5)});
    await page.reload();await page.waitForLoadState('networkidle');await page.waitForTimeout(1500);
   }
   const frames=await page.evaluate(async()=>{
    if(!PerformanceObserver.supportedEntryTypes.includes('long-animation-frame'))throw Error('Long Animation Frame unsupported');
    const frames=[];const observer=new PerformanceObserver(l=>frames.push(...l.getEntries().map(e=>e.duration)));observer.observe({type:'long-animation-frame',buffered:false});
    await new Promise(resolve=>{const start=performance.now();function tick(now){const p=Math.min((now-start)/6000,1);scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*p,behavior:'instant'});if(p<1)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});
    await new Promise(r=>setTimeout(r,100));observer.disconnect();return frames;
   });records.push({id:'K13',where:`home-${width}`,frames,ok:frames.length===0});await page.close();
  }
 }finally{await browser.close();}
 fs.writeFileSync(`.claude/evidence/runda18/${phase}-access.json`,JSON.stringify(records,null,2));console.log(JSON.stringify(records,null,2));if(records.some(r=>!r.ok))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
