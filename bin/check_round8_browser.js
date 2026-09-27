async page => {
  const base=page.url().split('/').slice(0,3).join('/');
  const feed=await(await page.request.get(base+'/data/episodes.json')).json();
  const ep=feed.episodes.find(e=>e.slug.startsWith('13-')), results=[], screenshots=[], errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [1920,390]) {
    await page.setViewportSize({width,height:width===390?844:1080});
    for(const [name,route] of [['home','/'],...(ep?[['13',`/episodes/${ep.slug}/`]]:[])]) {
      await page.goto(base+route);
      await page.evaluate(async()=>{
        await document.fonts.ready;
        for(let y=0;y<document.body.scrollHeight;y+=650){scrollTo(0,y);await new Promise(r=>setTimeout(r,10));}
        for(const img of document.images){img.loading='eager';await img.decode().catch(()=>{});}
        scrollTo(0,0);
      });
      const data=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,
        text:document.body.textContent,tables:document.querySelectorAll('.model-table').length,
        broken:[...document.images].filter(e=>!e.complete||!e.naturalWidth).length}));
      if(data.overflow||data.broken)throw Error(`${width} ${name} layout/images ${JSON.stringify(data)}`);
      const counts={verdict:(data.text.match(/no demonstrated difference/gi)||[]).length,n:(data.text.match(/n=3/g)||[]).length};
      if(ep&&name==='home'&&(data.tables||counts.verdict>3||counts.n>3))throw Error('R1 '+JSON.stringify(counts));
      if(name==='13') {
        if(counts.verdict>5||counts.n>5)throw Error('R3 '+JSON.stringify(counts));
        const contrast=await page.locator('.model-table').evaluate(table=>{
          const other=table.querySelector('.result-separated'), overlap=table.querySelector('tr:has(.result-overlap)');
          const h=[...table.querySelectorAll('thead th')].filter(e=>e.textContent.includes('n='));
          return {background:getComputedStyle(other).backgroundColor,otherBackground:getComputedStyle(overlap).backgroundColor,
            headers:h.map(e=>({text:e.textContent,visible:e.getBoundingClientRect().height>0})),resultColor:getComputedStyle(other.querySelector('td:last-child')).color,
            overlapColor:getComputedStyle(overlap.querySelector('td:last-child')).color};
        });
        if(contrast.background===contrast.otherBackground||contrast.resultColor===contrast.overlapColor||contrast.headers.some(h=>!h.visible))throw Error('R2 contrast/headers '+JSON.stringify(contrast));
        results.push({width,contrast});
        for(const model of ep.thesis.models) {
          const row=page.locator('.model-summary').filter({hasText:model.model});
          for(const v of ['bare','karpathy']) {
            const r=model[v], expected=`${r.min.toLocaleString('en-US')}–${r.max.toLocaleString('en-US')}`;
            if(!(await row.locator('.v-'+v).textContent()).includes(expected))throw Error('Range mismatch '+model.model);
          }
        }
        // Each accordion and all metric switches remain usable after abbreviation.
        for(const detail of await page.locator('.model-runs').all()) {
          await detail.locator('summary').click();
          for(const button of await detail.locator('[data-metric]').all()) {
            await button.click();
            const key=await button.getAttribute('data-metric');
            if(!await detail.locator(`[data-metric-panel="${key}"]`).isVisible())throw Error('Metric switch '+key);
          }
          await detail.locator('[data-metric="effects"]').click();
          await detail.locator('summary').click();
        }
        await page.evaluate(()=>scrollTo(0,0));
      }
      const path=`.screenshots/runda8-${ep?'feed':'empty'}-${name}-${width}.png`;
      await page.screenshot({path,fullPage:true});screenshots.push(path);
      results.push({width,name,counts,pass:true});
    }
  }
  if(errors.length)throw Error(errors.join('\n'));
  return {status:'PASS',results,screenshots};
}
