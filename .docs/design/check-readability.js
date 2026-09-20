async page => {
 const results=[];
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('**/assets/*.css', async route => { const response = await route.fetch({headers:{'Cache-Control':'no-cache'}}); await route.fulfill({response}); });
 for(const width of [1920,390,320,480,481,768]){
  await page.setViewportSize({width,height:1080});
  for(const path of ['/','/episodes/','/episodes/01-karpathy-vs-bare/']){
   await page.goto('http://127.0.0.1:4173'+path+'?readability=3');
   const audit=async()=>await page.evaluate(()=>{
    const minimum=innerWidth<=480?12:11,bad=[];
    for(const e of document.querySelectorAll('body *')){
     if(!e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))continue;
     if([...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<minimum)bad.push({tag:e.tagName,cls:e.className,size:getComputedStyle(e).fontSize});
     for(const pseudo of ['::before','::after']){
      const s=getComputedStyle(e,pseudo);
      if(!['none','normal','""'].includes(s.content)&&s.display!=='none'&&parseFloat(s.fontSize)<minimum)bad.push({cls:e.className,pseudo,size:s.fontSize});
     }
    }
    return {belowMinimum:bad,overflow:document.documentElement.scrollWidth>innerWidth};
   });
   let check=await audit();if(check.belowMinimum.length||check.overflow)throw Error(JSON.stringify({width,path,...check}));
   for(const b of await page.locator('[data-metric]').all()){await b.click();check=await audit();if(check.belowMinimum.length||check.overflow)throw Error(JSON.stringify({width,path,...check}));}
   if(path==='/'&&[1920,390].includes(width)){
    await page.locator('[data-metric="time"]').click();
    for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=700){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(80);}
    await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`.screenshots/readability-after-${width}.png`,fullPage:true});
   }
   results.push({width,path,...check});
  }
 }
 return results.map(r=>`PASS ${r.width}px ${r.path}: 0 text/pseudo-elements below ${r.width<=480?12:11}px; no page overflow`);
}
