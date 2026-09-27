/* Public-browser acceptance: real preview servers, no source introspection. */
const {chromium} = require('playwright');
const fs = require('node:fs');
const {spawnSync} = require('node:child_process');
const phase = process.argv[2] || 'after';
const out = `.screenshots/runda18/${phase}`;
fs.mkdirSync(out,{recursive:true});
const records=[];
function check(id, ok, value, where) { records.push({id,ok,value,where}); fs.writeFileSync(`.claude/evidence/runda18/${phase}.json`,JSON.stringify(records,null,2)); }
function pixels(mode, ...args) {
 const p=spawnSync('python3',['bin/round18_pixels.py',mode,...args.map(String)],{encoding:'utf8'});
 if(p.status) throw Error(p.stderr); return JSON.parse(p.stdout);
}
async function center(page, loc) {
 await loc.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 await page.mouse.move(0,0); await page.waitForTimeout(1200);
}
async function shot(page,name) {const path=`${out}/${name}.png`;await page.screenshot({path});return path;}
async function measureGlow(page,loc,name) {
 await loc.evaluate(e=>e.classList.add('r18-sample'));
 const style=await page.addStyleTag({content:'body * { visibility: hidden !important; } .r18-sample, .r18-sample * { visibility: visible !important; }'});
 const b=await loc.boundingBox();
 const value=pixels('glow',await shot(page,name+'-isolated'),JSON.stringify(b));
 await style.evaluate(e=>e.remove());await loc.evaluate(e=>e.classList.remove('r18-sample'));
 return value;
}
async function glow(page,loc,name) {
 await center(page,loc);
 const b=await loc.boundingBox();
 // Horizontal exterior strips avoid neighbouring cards and work on a 390px phone.
 await shot(page,name);return measureGlow(page,loc,name);
}
const loops=()=>{
 const visible=e=>{if(!e?.getBoundingClientRect)return false;const b=e.getBoundingClientRect();return b.bottom>0&&b.top<innerHeight&&b.right>0&&b.left<innerWidth;};
 const css=document.getAnimations().filter(a=>a.playState==='running'&&a.effect.getTiming().iterations===Infinity&&visible(a.effect.target));
 const gsap=window.gsap?.globalTimeline.getChildren(true,true,false).filter(t=>t.repeat()===-1&&t.isActive()&&t.targets().some(visible))||[];
 return {loops:css.length+gsap.length,comets:css.filter(a=>a.animationName==='fx-orbit').length,properties:[...new Set(css.flatMap(a=>a.effect.getKeyframes().flatMap(k=>Object.keys(k).filter(p=>!['offset','computedOffset','easing','composite'].includes(p)))))],p2:document.querySelectorAll('.ep.fx-engaged').length};
};
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const feed=await (await (await browser.newPage()).request.get('http://127.0.0.1:8876/data/episodes.json')).json();
  const cases=[['home','http://127.0.0.1:8876/'],['list','http://127.0.0.1:8876/episodes/'],...['02','13'].map(n=>[n,'http://127.0.0.1:8876/episodes/'+feed.episodes.find(e=>e.slug.startsWith(n+'-')).slug+'/']),['empty','http://127.0.0.1:8877/']];
  for(const width of [1920,390]) for(const [name,url] of cases){
   const page=await browser.newPage({viewport:{width,height:width===390?844:1080},isMobile:width===390,hasTouch:width===390});
   const key=`${name}-${width}`;
   await page.goto(url);await page.waitForLoadState('networkidle');await page.waitForTimeout(3000);
   const height=await page.evaluate(()=>document.documentElement.scrollHeight);
   const samples=[];
   for(let y=0;y<height;y+=width===390?650:900){
    await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(1000);
    samples.push(await page.evaluate(loops));
   }
   check('K1',samples.every(s=>s.loops<=2),Math.max(...samples.map(s=>s.loops)),key);
   check('K2',samples.every(s=>s.comets<=1),Math.max(...samples.map(s=>s.comets)),key);
   check('K9',samples.every(s=>s.properties.every(p=>['--fx-angle','transform','opacity'].includes(p))),[...new Set(samples.flatMap(s=>s.properties))],key);
   check('K13',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow',key);
   if(width===390&&name==='list')check('K11',samples.every(s=>s.p2<=1)&&samples.some(s=>s.p2===1),samples.map(s=>s.p2),key);
   const cards=page.locator('.ep');
   if(await cards.count()>1){
    const first=cards.first(), second=cards.nth(1);
    if(width===1920){
     const a=await glow(page,first,`${key}-latest-rest`), b=await glow(page,second,`${key}-second-rest`);
     check('K5',a>=2&&a<=5&&b<=1.5,{latest:a,other:b},key);
     const before=await second.evaluate(e=>e.getAnimations({subtree:true}).length);
     await second.hover();await page.waitForTimeout(800);
     check('K3',before===0,{before},key);
    }
    await center(page,second);
    if(width===1920)await second.hover();
    await page.waitForTimeout(800);
    const image=await shot(page,`${key}-second-active`), box=await second.boundingBox();
    const g=await measureGlow(page,second,`${key}-second-active`);check('K4',g>=5,g,key);
    if(width===1920){
     const counts=await page.evaluate(()=>[document.querySelectorAll('.ep')[1].getAnimations({subtree:true}).length,document.querySelector('.ep.fx-comet').getAnimations({subtree:true}).length]);
     check('K3',counts[0]>=1&&counts[1]===0,counts,key);
    }
   }
   const result=page.locator('.result-hero');
   if(await result.count()){
    const g=await glow(page,result,`${key}-result-rest`);check('K6',g>=5,g,key);
    const b=await result.boundingBox();const dimensions={resultWidth:b.width,resultHeight:b.height}; const baseline=phase==='before'?null:JSON.parse(fs.readFileSync('.claude/evidence/runda18/before.json')).find(r=>r.id==='K13'&&r.where===key&&r.value.resultWidth); check('K13',!baseline||(baseline.value.resultWidth===b.width&&baseline.value.resultHeight===b.height),dimensions,key);
    if(width===1920)await result.hover();await page.waitForTimeout(800);await shot(page,`${key}-result-active`);
   }
   const process=page.locator('.fx-spotlight').first();
   if(await process.count()){
    await center(page,process);const b=await process.boundingBox();const a=await shot(page,`${key}-process-rest`);
    if(width===1920)await process.hover();await page.waitForTimeout(800);const c=await shot(page,`${key}-process-active`);
    if(width===1920){const d=pixels('diff',a,c,JSON.stringify(b));check('K8',d>=4,d,key);}
   }
   const closing=page.locator('.closing, .episode-materials').first();
   if(await closing.count()){
    await center(page,closing);const b=await closing.boundingBox();
    const a=await shot(page,`${key}-aurora-a`);await page.waitForTimeout(3000);const c=await shot(page,`${key}-aurora-b`);
    // Sample a text-free horizontal strip at the top of the closing component.
    const region={x:b.x+24,y:b.y+12,width:b.width-48,height:12};
    const range=pixels('range',a,JSON.stringify(region)), diff=pixels('diff',a,c,JSON.stringify(region));
    check('K7',range>=25&&diff>=2,{range,diff},key);
    if(width===1920)await closing.hover();await page.waitForTimeout(800);await shot(page,`${key}-aurora-active`);
   }
   for(const mode of ['pause','reduce']){
    if(mode==='pause')await page.locator('.motion-toggle').click();else await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForTimeout(1000);
    const state=await page.evaluate(()=>({running:document.getAnimations().filter(a=>a.playState==='running').length,gsap:window.gsap?.globalTimeline.getChildren(true,true,false).filter(t=>t.repeat()===-1&&t.isActive()).length||0,arc:document.querySelector('.ep.fx-comet')?Number(getComputedStyle(document.querySelector('.ep.fx-comet'),'::after').opacity):1}));
    check('K10',state.running===0&&state.gsap===0&&state.arc>=.5,state,`${key}-${mode}`);
   }
   await page.close();
  }
 }finally{await browser.close();}
 fs.writeFileSync(`.claude/evidence/runda18/${phase}.json`,JSON.stringify(records,null,2));
 console.log(JSON.stringify({checks:records.length,failures:records.filter(r=>!r.ok)},null,2));
 if(records.some(r=>!r.ok))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
