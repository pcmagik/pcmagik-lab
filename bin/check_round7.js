async page => {
  const base=page.url().split('/').slice(0,3).join('/');
  const feed=await (await page.request.get(base+'/data/episodes.json')).json();
  const empty=!feed.episodes.length, results=[];
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [1920,390]) {
    await page.setViewportSize({width,height:width===390?844:1080});
    const routes=['/','/episodes/',...feed.episodes.filter(e=>/^(02|04|05|13)-/.test(e.slug)).map(e=>`/episodes/${e.slug}/`)];
    for(const route of routes) {
      await page.goto(base+route); await page.evaluate(()=>document.fonts.ready);
      const checks=await page.evaluate(({empty,route})=>{
        const out=[],add=(id,pass,detail)=>out.push({id,pass,detail}), rect=e=>e.getBoundingClientRect();
        if(route==='/') {
          if(empty) {
            const section=document.querySelector('#episodes'), nums=[...document.querySelectorAll('.section-number')].map(e=>parseInt(e.textContent));
            const p=section.querySelector('p.ep-subtitle'), next=document.querySelector('#method');
            const gap=rect(next).top-rect(section).bottom;
            add('Q1',nums.join(',')==='1,2'&&!!section.querySelector('h2')&&!!section.querySelector('a[href*="youtube.com"]')&&parseFloat(getComputedStyle(p).fontSize)>=parseFloat(getComputedStyle(document.querySelector('.section-aside')).fontSize)&&gap<=160,{nums,gap,heading:!!section.querySelector('h2')});
            add('Q2',!document.querySelector('nav sup')?.textContent.trim(),document.querySelector('nav').innerText);
            add('Q3',!document.querySelector('.method .m p').textContent.includes('not measured yet'),document.querySelector('.method .m p').textContent);
            const link=[...document.querySelectorAll('a')].find(e=>e.textContent.includes('Read the task'));
            add('Q5-link',!link||!link.getAttribute('href').startsWith('/episodes/'),link?.getAttribute('href'));
          }
          // Remove only transforms while measuring text rows in rotated decorative cards.
          const cards=[...document.querySelectorAll('.telemetry')], saved=cards.map(e=>e.style.transform);
          cards.forEach(e=>e.style.transform='none');
          const orphans=[];
          for(const e of document.querySelectorAll('.telemetry small,.telemetry strong,.telemetry .tiny-label')) {
            const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),lines=[];
            while(walker.nextNode()) for(const m of walker.currentNode.textContent.matchAll(/\S+/g)) {
              if(!/[\p{L}\p{N}]/u.test(m[0]))continue;
              const r=document.createRange();r.setStart(walker.currentNode,m.index);r.setEnd(walker.currentNode,m.index+m[0].length);
              const b=r.getBoundingClientRect();
              let line=lines.find(l=>Math.min(l.bottom,b.bottom)-Math.max(l.top,b.top)>Math.min(l.height,b.height)/2);
              if(!line){line={top:b.top,bottom:b.bottom,height:b.height,words:[]};lines.push(line);}
              line.words.push(m[0]);
            }
            const rows=lines.map(l=>l.words);if(rows.length>1&&rows.at(-1).length===1)orphans.push(rows);
          }
          cards.forEach((e,i)=>e.style.transform=saved[i]);add('Q5-labels',!orphans.length,orphans);
          if(!empty) {
            const a=document.querySelector('.telemetry-run'),slug=a.getAttribute('href').split('/')[2];
                        add('Q6-label',true,{slug,label:a.querySelector('strong').textContent});
          }
        }
        if(empty&&route==='/episodes/')add('Q4',Math.abs(rect(document.querySelector('footer')).bottom-innerHeight)<=1,{bottom:rect(document.querySelector('footer')).bottom,viewport:innerHeight});
        const labels=[...document.querySelectorAll('th,.v-bare,.v-karpathy')].filter(e=>['BARE','KARPATHY'].includes(e.textContent.trim())&&rect(e).height&&rect(e).width);
        if(labels.length)add('Q7',labels.every(e=>getComputedStyle(e).color===(e.textContent.trim()==='BARE'?'rgb(255, 159, 69)':'rgb(94, 200, 255)')),labels.map(e=>({text:e.textContent,color:getComputedStyle(e).color})));
        const overlap=[...document.querySelectorAll('.result-hero')].filter(e=>e.textContent.includes('Ranges overlap')&&!e.querySelector('.result-number'));
        if(overlap.length) {
          const gaps=overlap.map(e=>{const r=rect(e),a=rect(e.firstElementChild),end=rect(e.querySelector(".measurement-note")),b=rect(e.lastElementChild);return Math.max(a.top-r.top,r.bottom-end.bottom-(b.top>=end.bottom?b.height:0),b.top-end.bottom);});
          add('Q8',gaps.every(g=>g<=80),gaps);
        }
        const heading=document.querySelector('#task-prompt h2');
        if(heading) {
          const buttons=[...heading.parentElement.querySelectorAll('a.button')],gaps=buttons.slice(1).map((e,i)=>{const a=rect(buttons[i]),b=rect(e);return b.top>=a.bottom?b.top-a.bottom:b.left-a.right;});
          add('Q9',buttons.length>=2&&gaps.every(g=>g>=8),gaps);
        }
        return out;
      },{empty,route});
      for(const check of checks) {
        if(check.id==='Q6-label') {
          const ep=feed.episodes.find(e=>e.slug===check.detail.slug),models=[...new Set(ep.measurements.map(r=>r.model))];
          check.pass=models.length>1?check.detail.label===`${models.length} models`:check.detail.label.toLowerCase().replaceAll(' ','-')===models[0].split('/').at(-1).toLowerCase();check.id='Q6';
        }
        results.push({width,route,...check});
      }
    }
  }
  return {pass:results.every(r=>r.pass),results};
}
