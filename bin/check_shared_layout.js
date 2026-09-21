async page => {
  const reports=[], failures=[], errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('**/*',r=>r.continue({headers:{...r.request().headers(),'Cache-Control':'no-cache'}}));
  const routes=['/','/episodes/','/episodes/01-karpathy-vs-bare/','/episodes/02-qwen3.6-27b/'];
  for(const width of [1920,390]) {
    await page.setViewportSize({width,height:width===390?844:1080});
    const shells=[], cards=[];
    for(const route of routes) {
      await page.goto('http://127.0.0.1:8766'+route);
      await page.evaluate(()=>scrollTo(0,0));
      const shell=await page.evaluate(()=>{
        const props=['fontFamily','fontSize','fontWeight','lineHeight','color','backgroundColor','backgroundImage','borderRadius','padding','gap','display','alignItems','justifyContent'];
        const styles=selector=>[...document.querySelectorAll(selector)].map(e=>{
          const s=getComputedStyle(e), b=e.getBoundingClientRect();
          return {tag:e.tagName,cls:e.className,text:e.children.length?'':e.textContent,styles:Object.fromEntries(props.map(p=>[p,s[p]])),width:b.width,height:b.height};
        });
        return {header:styles('header, header *'),footer:styles('footer, footer *'),body:styles('body').map(({styles})=>styles)};
      });
      shells.push(shell);
      for (const url of await page.locator('script[src],link[rel="stylesheet"],header img').evaluateAll(es=>es.map(e=>e.src||e.href))) {
        if(!(await page.request.get(url)).ok())failures.push('Asset failed '+url);
      }
      if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) failures.push(width+' overflow '+route);
      if(width===390){
        await page.locator('.mobile-nav summary').click();
        if(!await page.locator('.mobile-links').isVisible())failures.push('Menu failed '+route);
        await page.locator('.mobile-nav summary').click();
      }
      for(const url of await page.locator('header a').evaluateAll(es=>es.map(e=>({href:e.href,origin:e.origin,pathname:e.pathname,hash:e.hash})))){
        const link=url.href;
        if(url.origin==='http://127.0.0.1:8766'){
          const response=await page.request.get(url.origin+url.pathname);
          if(!response.ok())failures.push('Broken nav '+link);
          if(url.hash && !(await response.text()).includes('id="'+url.hash.slice(1)+'"'))failures.push('Missing nav anchor '+link);
        }
      }
      if(route.includes('/episodes/0')) {
        const card=await page.locator('.result-hero').boundingBox();
        cards.push({width:card.width,height:card.height});
        const overflow=await page.locator('.result-hero').evaluate(e=>e.scrollHeight>e.clientHeight||e.scrollWidth>e.clientWidth);
        if(overflow)failures.push('Card overflow '+route);
        if(card.y+card.height>(width===390?844:1080))failures.push('Card below first screen '+route);
      }
      if(route.includes('01-karpathy')) {
        if(await page.locator('h1').evaluate(e=>e.scrollWidth>e.clientWidth)) failures.push('Title overflow '+width);
        const title=page.locator('h1');
        if(await title.locator('br').count()!==1)failures.push('Missing explicit title break');
        // The final two words must stay on the same rendered line.
        const lines=await title.evaluate(e=>{
          const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),rects=[]; let n;
          while(n=walker.nextNode())for(const m of n.textContent.matchAll(/\S+/g)){const r=document.createRange();r.setStart(n,m.index);r.setEnd(n,m.index+m[0].length);rects.push({word:m[0],y:r.getBoundingClientRect().y});}
          return rects.slice(-2);
        });
        if(lines.length!==2||Math.abs(lines[0].y-lines[1].y)>1)failures.push('Orphan title ending '+width);
      }
      const name=route==='/'?'home':route==='/episodes/'?'list':route.split('/')[2];
      await page.screenshot({path:'.screenshots/shared-layout-'+name+'-'+width+'.png',fullPage:true});
    }
    for(let i=1;i<shells.length;i++)for(const key of ['header','footer','body'])if(JSON.stringify(shells[0][key])!==JSON.stringify(shells[i][key]))failures.push(width+' '+key+' differs: '+routes[i]);
    if(JSON.stringify(cards[0])!==JSON.stringify(cards[1]))failures.push(width+' card sizes differ: '+JSON.stringify(cards));
    reports.push({width,cards,pages:routes.length});
  }
  await page.emulateMedia({reducedMotion:'no-preference'});
  for (const route of routes.slice(1)) {
    await page.goto('http://127.0.0.1:8766'+route);
    await page.locator('.motion-toggle').click();
    if(await page.locator('.motion-toggle').getAttribute('aria-pressed')!=='true')failures.push('Pause failed '+route);
    await page.locator('.motion-toggle').click();
    if(await page.locator('.motion-toggle').getAttribute('aria-pressed')!=='false')failures.push('Resume failed '+route);
  }
  if(errors.length) failures.push(...errors);
  if(failures.length)throw Error(failures.join('\n'));
  return {status:'PASS',reports};
}
