async page => {
  const base=page.url().split('/').slice(0,3).join('/');
  const feed=await (await page.request.get(base+'/data/episodes.json')).json(),results=[];
  await page.setViewportSize({width:390,height:844});
  for(const ep of feed.episodes.filter(e=>/^(01|02|05)-/.test(e.slug))) {
    await page.goto(base+`/episodes/${ep.slug}/`);
    const images=await page.locator('.shot img').evaluateAll(async es=>Promise.all(es.map(async e=>{
      e.loading='eager';await e.decode();return {source:e.currentSrc,width:e.naturalWidth,height:e.naturalHeight,fit:getComputedStyle(e).objectFit};
    })));
    for(let i=0;i<ep.runs.length;i++) {
      const run=ep.runs[i],im=images[i];
      results.push({episode:ep.slug,variant:run.wariant,...im,pass:!!run.zrzut_390_kadr&&im.source===base+'/'+run.zrzut_390_kadr&&im.width===390&&im.height===390&&im.fit==='contain'});
    }
  }
  return {pass:results.length===6&&results.every(r=>r.pass),note:'Checks full display of producer crops. Inspect the six images for heading content; original page coordinates cannot locate a heading inside an already cropped image.',results};
}
