/* Final screenshots after loading previews and returning the header to the top. */
const {chromium}=require('playwright');
const base=process.env.ROUND20_URL||'http://127.0.0.1:8892';
(async()=>{
  const browser=await chromium.launch({headless:true});
  try {
    for(const width of [1920,390]) {
      const page=await browser.newPage({viewport:{width,height:width===390?844:1080},reducedMotion:'reduce'});
      for(const slug of ['13-jeden-model-z-dwunastu','04-glm-4.7-flash']) {
        await page.goto(`${base}/episodes/${slug}/`);
        await page.evaluate(async()=>{
          for(let y=0;y<document.body.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,30));}
          scrollTo(0,0);
        });
        const capture=async name=>{
          await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0);});
          await page.waitForTimeout(200);
          await page.screenshot({path:`.screenshots/runda20/${name}.png`,fullPage:true});
        };
        await capture(`${slug}-${width}-collapsed`);
        await page.locator('#reproduce details summary').first().click();
        await capture(`${slug}-${width}-one-open`);
        await page.locator('#reproduce details summary').first().click();
        if(slug.startsWith('13-')) {
          await capture(`models-${width}-collapsed`);
          await page.locator('[data-model-toggle]').click();
          await capture(`models-${width}-expanded`);
        }
      }
      await page.close();
    }
  } finally {await browser.close();}
  console.log('PASS: 12 full-page screenshots');
})().catch(e=>{console.error(e);process.exitCode=1;});
