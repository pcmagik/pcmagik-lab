async page => {
  const base=page.url().split('/').slice(0,3).join('/'), results=[], errors=[];
  await page.route('**/*',r=>r.continue({headers:{...r.request().headers(),'Cache-Control':'no-cache'}}));
  page.on('pageerror',e=>errors.push(e.message));
  const feed=await (await page.request.get(base+'/data/episodes.json')).json();
  const links=new Set();
  for(const width of [1920,390]){
    await page.setViewportSize({width,height:1080});
    await page.emulateMedia({reducedMotion:'reduce'});
    for(const route of ['/','/episodes/',...feed.episodes.map(e=>`/episodes/${e.slug}/`)]){
      await page.goto(base+route);
      const ep=feed.episodes.find(e=>route===`/episodes/${e.slug}/`);
      if(ep){
        if(await page.locator('[data-run]').count()!==ep.measurements.length)throw Error('Missing cohort '+route);
        for(const r of ep.measurements){
          const card=page.locator(`[data-run="${r.bieg}"]`);
          const thinking=(await card.locator('.run-metrics').textContent()).match(/(\d+\.\d)%thinking/);
          if(r.myslenie_pct!==null&&(!thinking||Math.abs(Number(thinking[1])-r.myslenie_pct)>0.050001))throw Error('Thinking precision '+r.bieg);
        }
      }else{
        const expected=route==='/'?Math.min(3,feed.episodes.length):feed.episodes.length;
        if(await page.locator('article.ep').count()!==expected)throw Error('Episode count');
      }
      if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow '+route);
      const urls=await page.locator('a[href],img[src],script[src],link[rel="stylesheet"]').evaluateAll(es=>es.map(e=>e.getAttribute('href')||e.getAttribute('src')).filter(u=>u&&!u.startsWith('#')&&!u.startsWith('http')).map(u=>new URL(u,location.href).href));
      for(const url of urls)links.add(url);
      results.push(`PASS ${width} ${route}: cohort, thinking, count, layout`);
    }
  }
  for(const url of links)if(!(await page.request.get(url)).ok())throw Error('Broken local link '+url);
  if(errors.length)throw Error(errors.join('\n'));
  return {status:'PASS',pages:results.length,links:links.size};
}
