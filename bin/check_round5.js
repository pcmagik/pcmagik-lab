async page => {
  const base=page.url().split('/').slice(0,3).join('/'), failures=[], results=[];
  const check=(id,ok,detail)=>{results.push(`${ok?'PASS':'FAIL'} ${id} ${detail}`);if(!ok)failures.push(`${id} ${detail}`);};
  const feed=await (await page.request.get(base+'/data/episodes.json')).json();
  const by=n=>feed.episodes.find(e=>e.slug.startsWith(n+'-'));
  const routes=['/','/episodes/',...['01','13','14','17'].map(n=>`/episodes/${by(n).slug}/`)];
  await page.route('**/*', r=>r.continue({headers:{...r.request().headers(),'Cache-Control':'no-cache'}}));
  await page.emulateMedia({reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const width of [1920,390]){
    await page.setViewportSize({width,height:width===390?844:1080});
    let resultWidth;
    for(const route of routes){
      await page.goto(base+route);
      await page.evaluate(async()=>{await document.fonts.ready;for(let y=0;y<document.body.scrollHeight;y+=650){scrollTo(0,y);await new Promise(r=>setTimeout(r,5));}scrollTo(0,0);});
      await page.locator('img').evaluateAll(es=>Promise.all(es.filter(e=>e.getBoundingClientRect().height).map(e=>{e.loading='eager';return e.decode().catch(()=>{});} )));
      const ep=feed.episodes.find(e=>route===`/episodes/${e.slug}/`);
      const data=await page.evaluate(()=>{
        const visible=e=>e.getBoundingClientRect().height>0;
        const orphans=[];
        for(const e of document.querySelectorAll('h1,h2,h3,h4,.compare-label,.result-repeat,.result-number + span,.compare-footer > span,.model-runs > summary,footer p,.ep-subtitle')){
          if(!visible(e)||e.id==='hero-title')continue;
          const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT), lines=new Map();
          while(walker.nextNode()){
            const node=walker.currentNode;
            for(const m of node.textContent.matchAll(/\S+/g)){
              const r=document.createRange();r.setStart(node,m.index);r.setEnd(node,m.index+m[0].length);
              const box=r.getBoundingClientRect();if(!box.height)continue;
              const y=Math.round(box.y);lines.set(y,[...(lines.get(y)||[]),m[0]]);
            }
          }
          const rows=[...lines.values()];
          if(rows.length>1&&rows.at(-1).length===1)orphans.push(e.className+': '+rows.map(r=>r.join(' ')).join(' / '));
        }
        return {orphans,overflow:document.documentElement.scrollWidth>innerWidth,
          colors:[...document.querySelectorAll('.compare-label')].map(e=>[e.textContent,getComputedStyle(e).color]),
          body:document.body.innerText,
          singles:[...document.querySelectorAll('.runs,.cohort-grid')].filter(e=>e.children.length===1&&visible(e)).map(e=>{const r=e.getBoundingClientRect(),c=e.firstElementChild.getBoundingClientRect();return Math.abs((c.x+c.width/2)-(r.x+r.width/2))<2;}),
          result:document.querySelector('.result-hero')?.getBoundingClientRect().width,
          preview:[...document.querySelectorAll('.shot')].filter(visible).map(e=>e.getBoundingClientRect().height)};
      });
      check('B13',!data.orphans.length,`${width} ${route} ${data.orphans.join('; ')}`);
      check('layout',!data.overflow,`${width} ${route}`);
      check('N2',data.colors.every(([t,c])=>c===(t.includes('KARPATHY')?'rgb(94, 200, 255)':t.includes('BARE')?'rgb(255, 159, 69)':'rgb(167, 139, 250)')),`${width} ${route}`);
      check('N5',!/\b1 models\b/.test(data.body),`${width} ${route}`);
      check('N7',!data.body.includes('seria/badania/')&&!data.body.includes('received effort unknown'),`${width} ${route}`);
      check('N8',data.singles.every(Boolean),`${width} ${route}`);
      if(ep){
        if(resultWidth===undefined)resultWidth=data.result;
        check('N10',Math.abs(data.result-resultWidth)<2,`${width} ${route} width=${data.result}`);
        const intro=page.locator('.episode-intro');
        const first=ep.opis.split(/(?<=[.!?])\s+(?=[A-Z])/)[0];
        check('N3',(await intro.innerText()).includes(first),`${width} ${route} description`);
        const models=[...new Set(ep.measurements.map(r=>r.model))];
        if(models.length===1)check('N3',(await intro.innerText()).includes(models[0]),`${width} ${route} model`);
        if(ep.slug.startsWith('17')){
          check('N3',(await intro.innerText()).includes(ep.measurements.find(r=>r.powtorzenie===3).bieg),`${width} named run`);
          check('N3',(await intro.locator('.story-evidence a').boundingBox()).height>=44,`${width} accessible evidence link`);
        }
        if(ep.slug.startsWith('13')){
          for(const sel of ['.model-summary','.model-runs']){
            const text=await page.locator(sel).filter({hasText:'qwen/qwen3.8-27b'}).textContent();
            check('N4',text.includes('3 of 5 runs (lowest, middle, highest'),`${width} ${sel}`);
          }
        }
        if(width===390&&ep.slug.startsWith('01')){
          const crops=await page.locator('.shot img').evaluateAll(es=>es.map(e=>{const scale=e.clientWidth/e.naturalWidth,position=parseFloat(getComputedStyle(e).objectPosition.split(' ')[1])/100;const start=(e.naturalHeight-e.clientHeight/scale)*position;return [start,start+e.clientHeight/scale];}));
          check('N12',crops.every(([a,b])=>a<=500&&b>=700),`${width} hero crop source bounds=${JSON.stringify(crops)}`);
        }
      }else{
        for(const card of await page.locator('article.ep').all()){
          const slug=await card.getAttribute('data-episode'), item=feed.episodes.find(e=>e.slug===slug);
          check('N6',(await card.locator('h3').innerText())===item.title.replace(' | PC Magik Lab',''),`${width} ${slug}`);
          const link=card.locator('.result-hero > a');
          if(await link.count())check('N13',(await link.getAttribute('href')).endsWith('#all-runs'),`${width} ${slug}`);
        }
      }
      const name=route==='/'?'home':route==='/episodes/'?'list':route.split('/')[2].slice(0,2);
      await page.screenshot({path:`.screenshots/runda5-${name}-${width}.png`,fullPage:true});
    }
  }
  check('JS',!errors.length,errors.join(';'));
  return {status:failures.length?'FAIL':'PASS',count:results.length,failures};
}
