async page => {
  const results = [], errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', route => route.continue({headers: {...route.request().headers(), 'Cache-Control':'no-cache'}}));
  await page.emulateMedia({reducedMotion:'reduce'});
  for (const width of [1920, 390]) {
    await page.setViewportSize({width, height:width === 390 ? 844 : 1080});
    for (const slug of ['01-karpathy-vs-bare', '02-qwen3.6-27b']) {
      const response = await page.goto('http://127.0.0.1:8766/episodes/'+slug+'/');
      if (!response.ok()) throw Error('Episode not served');
      const feed = await (await page.request.get('http://127.0.0.1:8766/data/episodes.json')).json();
      const ep = feed.episodes.find(e => e.slug === slug);
      if (await page.locator('[data-run]').count() !== ep.measurements.length) throw Error('Missing runs');
      const expected = slug.startsWith('01') ? '−22%' : 'Ranges overlap';
      if (await page.locator('.result-number').innerText() !== expected) throw Error('Incorrect headline');
      const hero = await page.locator('.result-hero').boundingBox();
      if (hero.y + hero.height > (width === 390 ? 844 : 1080)) throw Error('Result not on first screen');
      if (!(await page.locator('.result-hero').innerText()).includes(ep.measurements[0].model)) throw Error('Model missing');
      if (!(await page.locator('[data-metric-panel="effects"]').isVisible())) throw Error('Effects not selected');
      for (const key of ['time','tokens','throughput','thinking','lines','effects']) {
        await page.locator('[data-metric="'+key+'"]').click();
        if (!await page.locator('[data-metric-panel="'+key+'"]').isVisible()) throw Error('Broken metric switch');
      }
      if (await page.locator('.material-details, pre').count()) throw Error('Repeated raw materials');
      if (await page.locator('#task-prompt a[href*="github.com"]').count() !== 1) throw Error('Missing repository link');
      if ((await page.locator('h1').innerText()).includes('| PC Magik Lab')) throw Error('Title suffix');
      for (const run of ep.measurements) {
        for (const key of ['strona','zrzut']) if (run[key]) {
          if (!await page.locator('[data-run]').filter({has:page.locator('a[href="/'+run[key]+'"]')}).count()) throw Error('Missing output link '+run[key]);
          if (!(await page.request.get('http://127.0.0.1:8766/'+run[key])).ok()) throw Error('Broken output link');
        }
      }
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error('Horizontal overflow');
      await page.evaluate(() => scrollTo(0,0));
      await page.screenshot({path:'.screenshots/episode-results-'+slug+'-'+width+'.png',fullPage:true});
      results.push('PASS '+slug+' / '+width+': first-screen result, full cohort, all metrics, output links, layout');
    }
  }
  if (errors.length) throw Error(errors.join('\n'));
  return results;
}
