async page => {
  const base=page.url().split('/').slice(0,3).join('/');
  const feed=await(await page.request.get(base+'/data/episodes.json')).json(),state=feed.episodes.length?'feed':'empty',paths=[];
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [1920,390]) {
    await page.setViewportSize({width,height:width===390?844:1080});
    const routes=[['home','/'],['list','/episodes/'],...feed.episodes.filter(e=>/^(02|13)-/.test(e.slug)).map(e=>[e.slug.slice(0,2),`/episodes/${e.slug}/`])];
    for(const [label,route] of routes) {
      await page.goto(base+route);await page.evaluate(async()=>{
        await document.fonts.ready;
        for(let y=0;y<document.body.scrollHeight;y+=650){scrollTo(0,y);await new Promise(r=>setTimeout(r,15));}
        for(const img of document.images){img.loading='eager';await img.decode().catch(()=>{});}
        scrollTo(0,0);if(document.activeElement instanceof HTMLElement)document.activeElement.blur();
      });
      const path=`.screenshots/runda7-${state}-${label}-${width}.png`;
      await page.screenshot({path,fullPage:true});paths.push(path);
    }
  }
  return paths;
}
