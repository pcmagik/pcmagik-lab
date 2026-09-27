async page => {
  const base=page.url().split('/').slice(0,3).join('/');
  const failures=[], results=[], errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  const check=(id, ok, detail)=>{results.push(`${ok?'PASS':'FAIL'} ${id} ${detail}`);if(!ok)failures.push(`${id} ${detail}`);};
  await page.route('**/*', r=>r.continue({headers:{...r.request().headers(),'Cache-Control':'no-cache'}}));
  await page.emulateMedia({reducedMotion:'reduce'});
  const routes=['/','/episodes/','/episodes/01-karpathy-vs-bare/','/episodes/02-qwen3.6-27b/'];
  for(const width of [1920,390]) {
    await page.setViewportSize({width,height:width===390?844:1080});
    const snapshots=[];
    for(const route of routes) {
      await page.goto(base+route);
      await page.evaluate(async()=>{await document.fonts.ready;for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,10));}scrollTo(0,0);});
      const data=await page.evaluate(()=>{
        const styles=e=>{const s=getComputedStyle(e);return Object.fromEntries(['fontSize','fontFamily','fontWeight','lineHeight','letterSpacing','padding','gap','display','borderRadius','backgroundColor','color','minHeight','height','width'].map(k=>[k,s[k]]));};
        const card=document.querySelector('.run');
        const components={};
        for(const sel of ['.run','.shot','.body','.name','.tag','.kv','.foot a'])components[sel]=styles(sel==='.run'?card:card.querySelector(sel));
        const eps=[...document.querySelectorAll('article.ep')].map(e=>e.getBoundingClientRect());
        const gaps=eps.slice(1).map((e,i)=>e.top-eps[i].bottom);
        const buttons=[...document.querySelectorAll('.metric-switch button')].map(e=>{const r=document.createRange();r.selectNodeContents(e);return {text:e.textContent,lines:[...r.getClientRects()].length,height:e.getBoundingClientRect().height};});
        const orphans=[];
        for(const e of document.querySelectorAll('h1,h2,h3,h4')){
          if(e.id==='hero-title')continue;
          const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT), words=[];
          while(walker.nextNode()){const node=walker.currentNode;for(const m of node.textContent.matchAll(/\S+/g)){const r=document.createRange();r.setStart(node,m.index);r.setEnd(node,m.index+m[0].length);words.push({text:m[0],y:Math.round(r.getBoundingClientRect().y)});}}
          const rows=new Map();for(const w of words)rows.set(w.y,[...(rows.get(w.y)||[]),w.text]);
          const lines=[...rows.values()];if(lines.length>1&&lines.at(-1).length===1)orphans.push(e.textContent);
        }
        const previews=Object.fromEntries([...document.querySelectorAll('.run')].map(run=>[run.querySelector('.shot').getAttribute('href'),Object.fromEntries(['.run','.shot','.body','.name','.tag','.kv','.foot a'].map(sel=>[sel,styles(sel==='.run'?run:run.querySelector(sel))]))]));
        return {components,previews,metricState:[...document.querySelectorAll('.metric-switch')].map(e=>[...e.querySelectorAll('button')].map(b=>[b.dataset.metric,b.getAttribute('aria-pressed')])),
          descriptions:[...document.querySelectorAll('.ep-h .ep-subtitle')].map(e=>e.textContent),
          effort:[...document.querySelectorAll('.kv,.run-result')].every(e=>/Effort requested: .+; received: .+/.test(e.textContent)),
          precision:!(/\d+\.\d{2}%/.test(document.body.innerText)),
          footers:[...document.querySelectorAll('.run .foot')].every(e=>{const rows={};for(const a of e.children){const y=a.getBoundingClientRect().y;rows[y]=(rows[y]||0)+1;}return new Set(Object.values(rows)).size===1;}),
          cardHeight:card.getBoundingClientRect().height,gaps,buttons,orphans,
          tracks:[...document.querySelectorAll('[data-metric-panel]:not([hidden]) .bar-track')].map(e=>e.getBoundingClientRect().width),
          dates:[...document.querySelectorAll('.ep-meta time')].every(e=>getComputedStyle(e).whiteSpace==='nowrap'),
          fakeArrow:getComputedStyle(document.querySelector('.hero-bottom')||document.body,'::after').content.includes('↗'),
          heading:document.querySelector('.ep-h h3')&&styles(document.querySelector('.ep-h h3')),
          result:document.querySelector('.result-number')&&styles(document.querySelector('.result-number')),
          overflow:document.documentElement.scrollWidth>innerWidth};
      });
      snapshots.push(data);
      check('B11',data.gaps.every(g=>g>=23)&&data.gaps.every(g=>Math.abs(g-data.gaps[0])<=1),`${width} ${route} gaps=${data.gaps}`);
      check('B13',data.orphans.length===0&&data.dates,`${width} ${route} orphans=${data.orphans.join(';')} nowrap=${data.dates}`);
      check('B5',data.effort&&data.precision,`${width} ${route} effort and one decimal`);
      check('B16',data.footers,`${width} ${route} balanced preview footer`);
      check('B12',data.descriptions.every(d=>d.includes('Published model outputs')),`${width} ${route} distinct descriptions`);
      check('B4',data.metricState.every(m=>['effects','checks'].includes(m[0][0])&&m.every((entry,i)=>entry[1]===String(i===0))),`${width} ${route} metric order/default`);
      check('B15',!data.fakeArrow,`${width} ${route} no pseudo-link`);
      check('B16',data.buttons.every(b=>b.lines===1)&&(width!==390||data.tracks.every(w=>w>=150)),`${width} ${route} buttons=${data.buttons.filter(b=>b.lines!==1).map(b=>b.text)} tracks=${data.tracks}`);
      check('layout',!data.overflow,`${width} ${route} no overflow`);
      for(const comparison of await page.locator('[data-comparison]').all()) {
        const keys=await comparison.locator('[data-metric]').evaluateAll(es=>es.map(e=>e.dataset.metric));
        for(const key of keys) {
          await comparison.locator(`[data-metric="${key}"]`).click();
          const panel=comparison.locator(`[data-metric-panel="${key}"]`);
          check('B4',await panel.isVisible(),`${width} ${route} ${key} switches`);
          if(width===390)check('B16',await panel.locator('.bar-track').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().width>=150)),`${width} ${route} ${key} tracks`);
        }
        await comparison.locator('[data-metric]').first().click();
      }
      await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,10));}scrollTo(0,0);});
      await page.locator('img').evaluateAll(es=>Promise.all(es.map(e=>e.decode().catch(()=>{}))));
      const name=route==='/'?'home':route==='/episodes/'?'list':route.split('/')[2];
    }
    for(const i of [2,3]){
      for(const [href,styles] of Object.entries(snapshots[i].previews))check('B2',JSON.stringify(snapshots[1].previews[href])===JSON.stringify(styles),`${width} shared preview ${href}`);
    }
    check('B12',['fontSize','fontWeight','fontFamily','color'].every(p=>snapshots[0].heading[p]===snapshots[1].heading[p]),`${width} list/home heading`);
    check('B3',JSON.stringify(snapshots[2].result)===JSON.stringify(snapshots[3].result),`${width} result styles`);
  }
  console.log(results.join('\n'));
  if(errors.length)failures.push(...errors);
  if(failures.length)throw Error(failures.join('\n'));
  return results;
}
