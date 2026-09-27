async page => {
  const base = page.url().split('/').slice(0,3).join('/');
  const feed = await (await page.request.get(base+'/data/episodes.json')).json();
  const results = [];
  await page.emulateMedia({reducedMotion:'reduce'});
  for (const width of [1920,390]) {
    await page.setViewportSize({width,height:width===390?844:1080});
    for (const route of ['/','/episodes/']) {
      await page.goto(base+route);
      await page.evaluate(async()=>{await document.fonts.ready; for(let y=0;y<document.body.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,10));}scrollTo(0,0);});
      const data=await page.evaluate(()=>{
        const orphans=[];
        for(const e of document.querySelectorAll('.method .m p')) {
          const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT), lines=new Map();
          while(walker.nextNode()) for(const m of walker.currentNode.textContent.matchAll(/\S+/g)) {
            const r=document.createRange();r.setStart(walker.currentNode,m.index);r.setEnd(walker.currentNode,m.index+m[0].length);
            const b=r.getBoundingClientRect(); const y=Math.round(b.y);lines.set(y,[...(lines.get(y)||[]),m[0]]);
          }
          const rows=[...lines.values()];if(rows.length>1&&rows.at(-1).length===1)orphans.push(rows.map(r=>r.join(' ')).join(' / '));
        }
        return {orphans, variantNumbers:[...document.querySelectorAll('.result-number.v-bare,.result-number.v-karpathy')].map(e=>({variant:e.classList.contains('v-bare')?'bare':'karpathy',color:getComputedStyle(e).color,text:e.innerText})), heights:[...document.querySelectorAll('article.ep')].map(e=>[e.dataset.episode,e.getBoundingClientRect().height]),
          singles:[...document.querySelectorAll('.runs')].filter(e=>e.children.length===1).map(e=>{const r=e.getBoundingClientRect(), c=e.firstElementChild.getBoundingClientRect(),shot=e.querySelector('.shot').getBoundingClientRect();return {card:Math.abs(c.x+c.width/2-r.x-r.width/2),shot:Math.abs(shot.x+shot.width/2-c.x-c.width/2)};})};
      });
      results.push({id:'P4',width,pass:data.variantNumbers.every(e=>e.color===(e.variant==='bare'?'rgb(255, 159, 69)':'rgb(94, 200, 255)')),ranges:data.variantNumbers});
      if(route==='/episodes/')results.push({id:'P2',width,pass:data.heights.every(([,h])=>h<=(width===390?900:700)),heights:data.heights});
      else {results.push({id:'P5',width,pass:!data.orphans.length,orphans:data.orphans}); results.push({id:'P6',width,pass:data.singles.every(x=>x.card<=2&&x.shot<=2),singles:data.singles});}
    }
  }
  return results;
}
