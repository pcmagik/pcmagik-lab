/* Isolated P0/P1 rendering at phone width; natural P2 is covered by the scroll/state probes. */
const {chromium}=require('playwright');
const {spawnSync}=require('node:child_process');
const fs=require('node:fs');
const phase=process.argv[2]||'after';
(async()=>{const browser=await chromium.launch();const results=[];
try{for(const route of ['/','/episodes/']){
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 if(phase==='before')for(const [file,type] of [['lab.css','text/css'],['lab.js','text/javascript']]){
  const old=spawnSync('git',['show',`7fc8b8c:assets/${file}`],{encoding:'utf8'});if(old.status)throw Error(old.stderr);
  await page.route('**/assets/'+file,r=>r.fulfill({body:old.stdout,contentType:type}));
 }
 await page.goto('http://127.0.0.1:8876'+route);await page.waitForLoadState('networkidle');
 const values=[];
 for(const index of [0,1]){
  const card=page.locator('.ep').nth(index);
  await card.evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-540,behavior:'instant'}));await page.waitForTimeout(1500);
  // Reposition after the entrance tween; 90px keeps the whole card above the centre band.
  await card.evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-90,behavior:'instant'}));await page.waitForTimeout(500);
  // A neighbouring centre card naturally takes the accent. Isolate P0/P1 for photometry.
  await page.locator('.ep.fx-engaged').evaluateAll(cards=>cards.forEach(e=>e.classList.remove('fx-engaged')));
  await page.waitForTimeout(500);
  await card.evaluate(e=>e.classList.add('r18-sample'));
  const style=await page.addStyleTag({content:'body * {visibility:hidden!important}.r18-sample,.r18-sample * {visibility:visible!important}'});
  const b=await card.boundingBox(),path=`.screenshots/runda18/${phase}/touch-${route==='/'?'home':'list'}-${index}-rest.png`;
  await page.screenshot({path});
  const p=spawnSync('python3',['bin/round18_pixels.py','glow',path,JSON.stringify(b)],{encoding:'utf8'});if(p.status)throw Error(p.stderr);values.push(JSON.parse(p.stdout));
  await style.evaluate(e=>e.remove());await card.evaluate(e=>e.classList.remove('r18-sample'));
 }
 results.push({id:'K5',where:route+'390',latest:values[0],other:values[1],ok:values[0]>=2&&values[0]<=5&&values[1]<=1.5});await page.close();
}}finally{await browser.close();}fs.writeFileSync(`.claude/evidence/runda18/${phase}-touch.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));if(results.some(r=>!r.ok))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
