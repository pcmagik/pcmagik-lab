async page => {
  const base=page.url().split('/').slice(0,3).join('/');
  const feed=await(await page.request.get(base+'/data/episodes.json')).json(), results=[];
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:390,height:844});
  for(const ep of feed.episodes.filter(e=>/^(01|02|05)-/.test(e.slug))) {
    await page.goto(base+`/episodes/${ep.slug}/`);
    const crops=await page.locator('.shot img').evaluateAll(async es=>Promise.all(es.map(async e=>{
      e.loading='eager'; await e.decode();
      const scale=e.clientWidth/e.naturalWidth,position=parseFloat(getComputedStyle(e).objectPosition.split(' ')[1])/100;
      const start=(e.naturalHeight-e.clientHeight/scale)*position;
      return {start,end:start+e.clientHeight/scale,source:e.currentSrc};
    })));
    for(let i=0;i<ep.runs.length;i++) {
      const raw=await page.context().newPage();
      await raw.setViewportSize({width:390,height:1600});
      await raw.goto(base+'/'+ep.runs[i].strona);await raw.evaluate(()=>document.fonts.ready);
      const heading=await raw.locator('h1').first().boundingBox();await raw.close();
      results.push({episode:ep.slug,variant:ep.runs[i].wariant,crop:crops[i],heading,
        pass:!!heading&&crops[i].start<=heading.y&&crops[i].end>=heading.y+heading.height});
    }
  }
  return {note:'DOM coordinates diagnose legacy crops; final crop bounds must come from the screenshot producer.',results};
}
