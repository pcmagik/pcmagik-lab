async page => {
  const base = 'http://127.0.0.1:4178';
  const episode = base + '/episodes/01-karpathy-vs-bare/';
  const report = [];
  const errors = [];
  const check = (value, message) => { if (!value) throw new Error(message); };
  page.on('pageerror', error => errors.push(error.message));
  await page.context().addInitScript(() => {
    window.__testDrawCalls = 0;
    for (const method of ['drawElements', 'drawArrays']) {
      const original = WebGL2RenderingContext.prototype[method];
      WebGL2RenderingContext.prototype[method] = function (...args) {
        window.__testDrawCalls++;
        return original.apply(this, args);
      };
    }
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base);
  const playAlignment = await page.locator('.header-youtube').evaluate(el => {
    const button = el.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(el);
    const icon = range.getBoundingClientRect();
    return { offset: Math.abs((button.left + button.right - icon.left - icon.right) / 2), width: button.width, height: button.height };
  });
  check(playAlignment.offset <= 1 && playAlignment.width >= 44 && playAlignment.height >= 44, 'Navbar play icon is centered in its accessible target');
  await page.getByRole('button', { name: 'Rotate core' }).waitFor();
  await page.waitForFunction(() => window.__testDrawCalls > 0);
  const firstDraws = await page.evaluate(() => window.__testDrawCalls);
  await page.waitForTimeout(200);
  check(await page.evaluate(() => window.__testDrawCalls) > firstDraws, 'WebGL scene must animate');
  check(await page.locator('html').getAttribute('lang') === 'en', 'English page');
  await page.getByRole('button', { name: 'Pause motion' }).click();
  await page.waitForTimeout(150);
  const pausedDraws = await page.evaluate(() => window.__testDrawCalls);
  const pausedTransform = await page.locator('.telemetry-hardware').evaluate(el => getComputedStyle(el).transform);
  await page.waitForTimeout(250);
  check(await page.evaluate(() => window.__testDrawCalls) === pausedDraws, 'Pause stops WebGL draws');
  check(await page.locator('.telemetry-hardware').evaluate(el => getComputedStyle(el).transform) === pausedTransform, 'Pause stops floating cards');
  const rotateButton = page.getByRole('button', { name: 'Rotate core' });
  await rotateButton.focus();
  const imageBefore = (await page.locator('#neural-canvas').screenshot()).toString('base64');
  await page.keyboard.press('Enter');
  const imageAfter = (await page.locator('#neural-canvas').screenshot()).toString('base64');
  check(imageBefore !== imageAfter, 'Keyboard rotation changes rendered pixels while paused');
  report.push('PASS animated WebGL, pause, keyboard-controlled rotation');


  const feed = await (await page.request.get(base + '/data/episodes.json')).json();
  const published = await (await page.request.get(base + '/assets/homepage-benchmarks.json')).json();
  check(JSON.stringify(published) === JSON.stringify(feed), 'Snapshot exactly reflects publisher feed');
  for (const route of ['/', '/episodes/', '/episodes/01-karpathy-vs-bare/']) {
    await page.goto(base + route);
    check(await page.locator('html').getAttribute('lang') === 'en', 'English UI');
    const urls = await page.locator('a[href],img[src],script[src],link[href]').evaluateAll(elements => [...new Set(elements.map(el=>el.href||el.src).filter(url=>typeof url==='string' && url.startsWith(location.origin)))]);
    for (const url of urls) {
      const response=await page.request.get(url);
      check(response.ok(), 'Broken local resource: '+url);
      if (url.includes('#')) check((await response.text()).includes('id="'+url.split('#')[1]+'"'), 'Broken fragment: '+url);
    }
    if (route === '/') {
      check(await page.locator('.episode-card').count() === Math.min(3,feed.episodes.length), 'Latest cards from feed');
      check(await page.locator('.comparison, .series-model').count() === 0, 'Homepage remains gateway');
    }
  }
  await page.goto(episode);
  const entry=feed.episodes.find(ep=>ep.slug==='01-karpathy-vs-bare');
  check(await page.locator('h1').innerText() === entry.title, 'Episode title from feed');
  check(await page.locator('.run').count() === entry.runs.length, 'All published outputs');
  check(await page.locator('[data-comparison]').count() === 0, 'Two representatives are not a full repeated-run cohort');
  check(!await page.locator('body').innerText().then(value=>/22%|129–155|101–121/.test(value)), 'No stale cohort statistics');
  for (const [i,run] of entry.runs.entries()) {
    const card=page.locator('.run').nth(i);
    const values=await card.locator('.kv b').allTextContents();
    check(values[0] === run.sekundy.toLocaleString('en-US')+' s', 'Time from feed');
    check(values[1] === run.tokeny.toLocaleString('en-US'), 'Output tokens from feed');
    check(values[2] === run.myslenie_pct+'%', 'Thinking from feed without substituting another source');
    check(values[3] === run.linie.toLocaleString('en-US'), 'Lines from feed');
    check(await card.locator('img').getAttribute('src') === '/'+run.zrzut, 'Publisher screenshot');
    await card.getByRole('link',{name:'Read prompt'}).click();
    check(await page.locator('#prompt-'+i).getAttribute('open') !== null, 'Prompt opens inline');
    const prompt=await (await page.request.get(base+'/'+run.prompt)).text();
    check(await page.locator('#prompt-'+i+' pre').textContent() === prompt, 'Exact local prompt');
    await card.getByRole('link',{name:'Open live output'}).click();
    check(page.url() === base+'/'+run.strona, 'Live output is the supplied representative');
    await page.goBack();
  }
  report.push('PASS feed-only cards, exact snapshot, title, all published metrics, prompt, screenshot and live output links');

  // This private fixture is built by the same hook; it never enters the public catalog.
  await page.goto(base+'/.tmp/browser-fixture/episodes/first/');
  for (const [name, expected] of [['Effects','7–7 effects|7–7 effects'],['Time','12.5–12.5 s|12.5–12.5 s'],['output tokens','111–321 output tokens|112–113 output tokens'],['tok/s','25.68–25.68 tok/s|25.68–25.68 tok/s']]) {
    const button=page.getByRole('button',{name,exact:true});
    await button.focus();await page.keyboard.press('Enter');
    check(await button.getAttribute('aria-pressed') === 'true','Metric selection announced');
    check((await page.locator('[data-metric-panel]:visible .compare-value').allTextContents()).join('|') === expected,'Generated '+name+' ranges');
    check(await button.evaluate(el=>getComputedStyle(el).outlineStyle) !== 'none','Visible keyboard focus');
  }
  report.push('PASS future repeated-run feed: all four generated metric panels and keyboard controls');

  await page.setViewportSize({width:390,height:844});await page.goto(base);
  await page.locator('.mobile-nav summary').click();
  await page.locator('.mobile-links').getByRole('link',{name:'Benchmarks'}).click();
  check(page.url().endsWith('#episodes') && await page.locator('.mobile-nav').getAttribute('open') === null,'Mobile menu closes');
  await page.goto(base);await page.keyboard.press('Tab');
  check(await page.locator('.skip').evaluate(el=>el===document.activeElement),'Skip link focused');
  await page.keyboard.press('Enter');check(page.url().endsWith('#main'),'Skip navigation');
  report.push('PASS mobile navigation and keyboard skip link');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base);
  await page.getByRole('button', { name: 'Rotate core' }).waitFor();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Motion reduced' }).waitFor();
  await page.waitForTimeout(200);
  const reducedDraws = await page.evaluate(() => window.__testDrawCalls);
  await page.waitForTimeout(250);
  check(await page.evaluate(() => window.__testDrawCalls) === reducedDraws, 'Live reduced-motion change stops WebGL');
  check(await page.evaluate(() => window.gsap.globalTimeline.getChildren(true, true, true).filter(tween => tween.isActive()).length) === 0, 'Reduced motion stops GSAP');
  check(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'Reduced motion disables smooth scroll');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForTimeout(250);
  check(await page.evaluate(() => window.__testDrawCalls) > reducedDraws, 'Motion resumes after preference changes');
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(250);
  const offscreenDraws = await page.evaluate(() => window.__testDrawCalls);
  await page.waitForTimeout(250);
  check(await page.evaluate(() => window.__testDrawCalls) === offscreenDraws, 'Offscreen scene stops drawing');
  check(await page.evaluate(() => window.gsap.getTweensOf('.telemetry-hardware, .telemetry-run').every(tween => tween.paused())), 'Offscreen ambient tweens paused');
  report.push('PASS runtime reduced motion, resume and offscreen rendering suspension');


  const browser=page.context().browser();
  for (const scenario of ['no-javascript','no-webgl','no-gsap','no-three','no-data']) {
    const context=await browser.newContext({javaScriptEnabled:scenario!=='no-javascript',viewport:{width:390,height:844},reducedMotion:'reduce'});
    try {
      if(scenario==='no-webgl') await context.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:original.call(this,type,...args);};});
      if(scenario==='no-gsap') await context.route('**/assets/vendor/gsap-*/**',route=>route.abort());
      if(scenario==='no-three') await context.route('**/assets/vendor/three-*/**',route=>route.abort());
      if(scenario==='no-data') await context.route('**/assets/homepage-benchmarks.json',route=>route.abort());
      const fallbackPage=await context.newPage();const problems=[];
      fallbackPage.on('pageerror',error=>problems.push(error.message));
      await fallbackPage.goto(base);
      check(await fallbackPage.locator('.episode-card').count()===feed.episodes.length,scenario+': static latest cards');
      if(['no-javascript','no-webgl','no-three'].includes(scenario)) check(await fallbackPage.locator('.scene-fallback').isVisible(),scenario+': sculpture fallback');
      await fallbackPage.locator('.episode-card h3 a').first().click();
      check(await fallbackPage.locator('.run').count()===entry.runs.length,scenario+': outputs available');
      await fallbackPage.locator('#prompt-0 summary').click();
      check(await fallbackPage.locator('#prompt-0 pre').isVisible(),scenario+': prompt available');
      check(!problems.length,problems.join(', '));
      report.push('PASS fallback: '+scenario);
    } finally { await context.close(); }
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const route of [base,base+'/episodes/',episode]) {
    await page.goto(route);
    for(const width of [320,390,768,1024,1440,1920]) {
      await page.setViewportSize({width,height:1000});
      if(width===390) await page.locator('.material-details').evaluateAll(items=>items.forEach(el=>{el.open=true;}));
      const failures=await page.evaluate(()=>{
        const visible=el=>el.checkVisibility()&&el.getBoundingClientRect().width>0;
        const small=[...document.querySelectorAll('body *')].filter(el=>visible(el)&&[...el.childNodes].some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim())&&parseFloat(getComputedStyle(el).fontSize)<11);
        const targets=[...document.querySelectorAll('a,button,summary')].filter(el=>visible(el)&&!el.classList.contains('skip')&&(el.getBoundingClientRect().width<44||el.getBoundingClientRect().height<44));
        return {small:small.map(el=>el.className),targets:targets.map(el=>el.textContent),overflow:document.documentElement.scrollWidth>innerWidth};
      });
      check(!failures.small.length&&!failures.targets.length&&!failures.overflow,route+' / '+width+': '+JSON.stringify(failures));
      await page.locator('.material-details').evaluateAll(items=>items.forEach(el=>{el.open=false;}));
    }
  }
  report.push('PASS three pages: 11px minimum text, 44×44px targets, no overflow at six widths');
  for(const [name,url] of [['homepage-corrected',base],['episodes',base+'/episodes/'],['episode',episode]]) {
    for(const [device,width] of [['desktop',1440],['mobile',390]]) {
      await page.setViewportSize({width,height:1000});await page.goto(url);
      const height=await page.evaluate(()=>document.documentElement.scrollHeight);
      for(let y=0;y<height;y+=650){await page.evaluate(top=>scrollTo({top,behavior:'instant'}),y);await page.waitForTimeout(80);}
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(200);
      await page.screenshot({path:'.screenshots/'+name+'-'+device+'.png',fullPage:true});
    }
  }
  check(errors.length===0,'Uncaught errors: '+errors.join(', '));
  report.push('PASS no uncaught JavaScript errors; desktop/mobile screenshots saved');
  return report;
}
