async page => {
  const result=[];
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for (const width of [1920,390]) {
    await page.setViewportSize({width,height:1080});
    for (const route of ['/','/episodes/01-karpathy-vs-bare/']) {
      await page.goto('http://127.0.0.1:8765'+route);
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.locator('[data-comparison]').scrollIntoViewIfNeeded();
      const body=await page.locator('body').innerText();
      for (const text of ['1.73%','2.52%','bare: n=5','karpathy: n=5']) if (!body.includes(text)) throw Error('Missing '+text);
      await page.locator('[data-metric="effects"]').click();
      const panel=page.locator('[data-metric-panel="effects"]');
      if (!(await panel.isVisible()) || !(await panel.innerText()).includes('22%')) throw Error('Effects panel failed');
      if (route !== '/') {
        if (await page.locator('[data-run]').count()!==10) throw Error('Full cohort not rendered');
      }
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
      if (overflow) throw Error('Horizontal page overflow '+width+' '+route);
      const urls=await page.locator('a[href],img[src],script[src],link[rel="stylesheet"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')||n.getAttribute('src')).filter(u=>u&&!u.startsWith('#')&&!u.startsWith('http')));
      for (const url of [...new Set(urls)]) {
        const response=await page.request.get(url.startsWith('/') ? 'http://127.0.0.1:8765'+url : page.url()+url);
        if (!response.ok()) throw Error('Broken link '+url+' '+response.status());
      }
      await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,30));}scrollTo(0,0)});
      await page.screenshot({path:'.screenshots/publication-'+(route==='/'?'home':'episode')+'-'+width+'.png',fullPage:true});
      result.push('PASS '+width+' '+route+': percentages, cohort, effects switch, local links, layout');
    }
  }
  if(errors.length) throw Error(errors.join('\n'));
  return result;
}
