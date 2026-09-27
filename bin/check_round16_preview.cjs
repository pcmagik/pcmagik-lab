/* Archive preview must retain the visible source area of the episode preview. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
  const base=process.argv[2]||'http://127.0.0.1:8892';
  await page.goto(base+'/episodes/02-qwen3.6-27b/');
  const reference=await page.locator('.run .shot').first().boundingBox();
  await page.goto(base+'/episodes/');
  for(const shot of await page.locator('.ep-compact .shot').all()){
   const box=await shot.boundingBox();
   assert(Math.abs(box.width/box.height-reference.width/reference.height)<0.02,JSON.stringify({reference,box}));
  }
  console.log('PASS desktop archive previews preserve episode preview proportions');
 }finally{await browser.close();}
})();
