async page => {
  const base=page.url().split('/').slice(0,3).join('/');
  const feed=await(await page.request.get(base+'/data/episodes.json')).json();
  const state=feed.episodes.length?'feed':'empty', failures=[], results=[], checked=new Map(), errors=[];
  const check=(id,ok,detail)=>{results.push({id,pass:ok,detail});if(!ok)failures.push({id,detail});};
  page.on('pageerror',e=>errors.push(e.message));
  await page.emulateMedia({reducedMotion:'reduce'});
  const episodes=feed.episodes.filter(e=>/^(01|02|04|13)-/.test(e.slug));
  const routes=['/','/episodes/',...episodes.map(e=>`/episodes/${e.slug}/`)];
  for(const width of [1920,390]) {
    await page.setViewportSize({width,height:width===390?844:1080});
    for(const route of routes) {
      await page.goto(base+route);
      await page.evaluate(async()=>{
        await document.fonts.ready;
        for(let y=0;y<document.body.scrollHeight;y+=650){scrollTo(0,y);await new Promise(r=>setTimeout(r,10));}
        for(const img of document.images){img.loading='eager';await img.decode().catch(()=>{});}
        scrollTo(0,0);if(document.activeElement instanceof HTMLElement)document.activeElement.blur();
      });
      const ep=episodes.find(e=>route===`/episodes/${e.slug}/`);
      const data=await page.evaluate(()=>({
        overflow:document.documentElement.scrollWidth>innerWidth,
        brokenImages:[...document.images].filter(e=>!e.complete||!e.naturalWidth).map(e=>e.src),
        hrefs:[...document.querySelectorAll('a[href]')].map(e=>e.href),
        heights:[...document.querySelectorAll('article.ep')].map(e=>[e.dataset.episode,e.getBoundingClientRect().height]),
        headings:[...document.querySelectorAll('h1')].map(e=>e.textContent),
        cards:[...document.querySelectorAll('article.ep')].map(e=>({slug:e.dataset.episode,title:e.querySelector('h3').innerText,images:e.querySelectorAll('img').length})),
        orphans:[...document.querySelectorAll('.method .m p')].flatMap(e=>{
          const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),lines=new Map();
          while(walker.nextNode())for(const m of walker.currentNode.textContent.matchAll(/\S+/g)){
            const r=document.createRange();r.setStart(walker.currentNode,m.index);r.setEnd(walker.currentNode,m.index+m[0].length);
            const b=r.getBoundingClientRect(),y=Math.round(b.y);lines.set(y,[...(lines.get(y)||[]),m[0]]);
          }
          const rows=[...lines.values()];return rows.length>1&&rows.at(-1).length===1?[e.textContent]:[];
        })
      }));
      const context=`${state} ${width} ${route}`;
      check('layout',!data.overflow,context);
      check('images',!data.brokenImages.length,{context,broken:data.brokenImages});
      check('P5',!data.orphans.length,{context,orphans:data.orphans});
      if(!feed.episodes.length) {
        check('P1',(await page.locator('body').innerText()).includes('First results will arrive with the first film.'),context);
        check('P1',!await page.locator('.episode-list,.result-number,.evidence-note').count(),context);
      }
      if(route==='/episodes/') {
        check('P2',data.heights.every(([,h])=>h<=(width===390?900:700)),{context,heights:data.heights});
        check('P2',data.cards.every(c=>c.images===1&&c.title===feed.episodes.find(e=>e.slug===c.slug).title),context);
      }
      if(ep) {
        check('P8',data.headings.length===1&&data.headings[0]===ep.title,context);
        const models=[...new Set(ep.measurements.map(r=>r.model))];
        check('P8',await page.locator('.episode-subject').innerText()===(models.length===1?models[0]:`${models.length} models`),context);
        if(ep.thesis.models.every(m=>m.class==='nakladaja-sie')&&!ep.thesis.pary.length)
          check('P3',!await page.locator('.result-hero .result-number').count(),context);
        else if(ep.kind==='para-wariantow')check('P3',await page.locator('.result-hero .result-number').count()>0,context);
      }
      for(const href of data.hrefs) {
        if(!href.startsWith(base+'/'))continue;
        const [key,hash]=href.slice(base.length).split('#');
        if(!checked.has(key)){const response=await page.request.get(base+key);checked.set(key,{status:response.status(),body:await response.text()});}
        const response=checked.get(key);
        check('links',response.status===200,{context,href,status:response.status});
        if(hash)check('anchors',response.body.includes(`id="${decodeURIComponent(hash)}"`),{context,href});
      }
      const name=route==='/'?'home':route==='/episodes/'?'list':route.split('/')[2].slice(0,2);
      await page.screenshot({path:`.screenshots/runda6-${state}-${name}-${width}.png`,fullPage:true});
    }
  }
  check('404',(await page.request.get(base+'/404.html')).status()===200,base);
  check('JS',!errors.length,errors);
  return {status:failures.length?'FAIL':'PASS',count:results.length,links:checked.size,failures,
    dimensions:results.filter(r=>r.id==='P2'&&typeof r.detail==='object')};
}
