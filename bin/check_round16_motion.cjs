/* Run the unchanged round-15 assertions against round-16 fixtures.
   Round 15 tests default motion on each navigation; isolate its storage.
   Persistence itself is covered separately by check_round16_interactions.cjs. */
const {chromium}=require('playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext();
  await context.addInitScript(()=>{try{localStorage.removeItem('lab-motion-paused');}catch(_){}});
  const page=await context.newPage();
  for(const file of ['bin/check_round15.js','bin/check_round15_hover.js']){
   const source=fs.readFileSync(file,'utf8').replaceAll('127.0.0.1:8890','127.0.0.1:8892').replaceAll('127.0.0.1:8891','127.0.0.1:8893').replaceAll('.screenshots/runda15/','.screenshots/runda16/regression15/');
   const run=eval('('+source+'\n)');console.log(file,await run(page));
  }
 }finally{await browser.close();}
})();
