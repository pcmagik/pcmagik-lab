async page => {
  const base=page.url().split('/').slice(0,3).join('/'), results=[], failures=[];
  const check=(id,ok,detail)=>{results.push(`${ok?'PASS':'FAIL'} ${id} ${detail}`);if(!ok)failures.push(`${id} ${detail}`);};
  const feed=await (await page.request.get(base+'/data/episodes.json')).json();
  const by=n=>feed.episodes.find(e=>e.slug.startsWith(n+'-'));
  const routes=['/','/episodes/',...['01','13','14'].map(n=>`/episodes/${by(n).slug}/`)];
  await page.emulateMedia({reducedMotion:'reduce'});
  const links=new Set();
  for(const ep of feed.episodes){
    for(const key of ['prompt_file','task_file'])if(ep[key])links.add('/'+ep[key]);
    for(const r of ep.measurements){for(const key of ['strona','zrzut','zrzut_390','prompt'])if(r[key])links.add('/'+r[key]);if(r.checks)links.add('/'+r.checks.plik);}
  }
  for(const link of links){const response=await page.request.get(base+link);check('B8/B17',response.ok(),link);}
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const width of [1920,390]){
    await page.setViewportSize({width,height:width===390?844:1080});
    // The current three latest episodes do not include 13. Mount its same
    // rendered table under the home layout to verify the shared component CSS.
    await page.goto(base+'/episodes/');
    const aggregate=page.locator('.model-table').first();
    const tableMarkup=await aggregate.evaluate(e=>e.outerHTML);
    const tableStyles=async()=>page.locator('.model-table').first().evaluate(t=>Object.fromEntries(['caption','tbody th','td'].map(sel=>{const s=getComputedStyle(t.querySelector(sel));return [sel,[s.fontSize,s.fontWeight,s.padding,s.color]];})));
    const expectedTable=await tableStyles();
    await page.goto(base+'/');
    await page.locator('article.ep').first().evaluate((e,html)=>{e.innerHTML=html;},tableMarkup);
    check('D39',JSON.stringify(expectedTable)===JSON.stringify(await tableStyles()),`${width} aggregate table uses home CSS`);
    let shared;
    for(const route of routes){
      await page.goto(base+route);
      await page.evaluate(async()=>{await document.fonts.ready;for(let y=0;y<document.body.scrollHeight;y+=650){scrollTo(0,y);await new Promise(r=>setTimeout(r,5));}scrollTo(0,0);});
      await page.locator('img').evaluateAll(es=>Promise.all(es.filter(e=>e.getBoundingClientRect().height).map(e=>{e.loading='eager';return e.decode().catch(()=>{});} )));
      const data=await page.evaluate(()=>{
        const style=e=>{const s=getComputedStyle(e);return ['fontSize','fontFamily','color','backgroundColor','padding','height'].map(k=>s[k]);};
        return {height:document.documentElement.scrollHeight,overflow:document.documentElement.scrollWidth>innerWidth,
          shared:['nav[aria-label="Main navigation"]','footer'].map(sel=>document.querySelector(sel)?style(document.querySelector(sel)):null),
          cards:[...document.querySelectorAll('article.ep')].map(e=>[e.dataset.episode,e.getBoundingClientRect().height]),
          h1:document.querySelector('h1')?.innerText, body:document.body.innerText,
          result:document.querySelector('.result-hero')?.getBoundingClientRect().bottom,
          runHeights:[...document.querySelectorAll('.run-result')].filter(e=>e.getBoundingClientRect().height).map(e=>e.getBoundingClientRect().height)};
      });
      if(!shared)shared=data.shared;
      check('D39',JSON.stringify(shared)===JSON.stringify(data.shared),`${width} ${route} navbar/footer`);
      check('layout',!data.overflow,`${width} ${route} height=${data.height}`);
      if(route.includes(by('13').slug)){
        check('B9',data.h1===by('13').title,`${width} title`);
        check('B9',width!==1920||data.height<8000,`${width} height=${data.height}`);
        check('B9',data.body.includes(by('13').thesis.claim),`${width} claim`);
        check('B9',await page.locator('.model-summary').count()===by('13').thesis.summary.models,`${width} model rows`);
        check('B9',data.result<=(width===390?844:1080),`${width} first-screen result bottom=${data.result}`);
      }
      if(route.includes(by('01').slug))check('B8',Math.max(...data.runHeights)-Math.min(...data.runHeights)<=2,`${width} run heights ${data.runHeights}`);
      const name=route==='/'?'home':route==='/episodes/'?'list':route.split('/')[2].slice(0,2);
      results.push(`INFO ${width} ${route} cards=${JSON.stringify(data.cards)}`);
    }
    for(const ep of feed.episodes){
      await page.goto(`${base}/episodes/${ep.slug}/`);
      check('B10',!(await page.locator('body').textContent()).includes('not measured yet'),`${width} ${ep.slug} complete measurements`);
      for(const detail of await page.locator('.model-runs').all()){
        await detail.locator('summary').click();
        const count=await page.locator('.model-runs[open]').count();
        check('B5',count===1,`${width} ${ep.slug} one model open`);
      }
      for(const r of ep.measurements){
        const card=page.locator(`[data-run="${r.bieg}"]`);
        check('B7',await card.locator('h4').textContent()===`Run ${r.powtorzenie}`,`${width} ${r.bieg}`);
        if(ep.kind==='pixel')check('B10',(await card.textContent()).includes(`${r.checks.passed} / ${r.checks.total}`),`${width} ${r.bieg} checks`);
      }
    }
  }
  check('JS',errors.length===0,errors.join(';'));
  return {status:failures.length?'FAIL':'PASS',count:results.length,failures,results};
}
