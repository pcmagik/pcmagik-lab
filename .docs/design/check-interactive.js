async page => {
  const base = 'http://127.0.0.1:4177';
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

  await page.goto(episode);
  await page.getByRole('button', { name: 'output tokens', exact: true }).waitFor();
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width}`);
    check(await page.locator('.run').count() === 2, 'Both outputs remain present');
  }
  report.push('PASS layouts: 320, 390, 768, 1024, 1440px');

  const specifications = [
    ['Effects', ['129–155 effects', '101–121 effects'], '22% fewer counted effects on average'],
    ['Time', ['338–420 s', '248–479 s'], 'time ranges overlap'],
    ['output tokens', ['18,858–22,049 output tokens', '14,333–24,268 output tokens'], 'output-token ranges overlap'],
    ['tok/s', ['52.50–56.30 tok/s', '50.69–57.84 tok/s'], 'tok/s ranges overlap']
  ];
  for (const [name, values, summary] of specifications) {
    const button = page.getByRole('button', { name, exact: true });
    await button.focus();
    await page.keyboard.press('Enter');
    check(await button.getAttribute('aria-pressed') === 'true', `${name} announced as selected`);
    check(await page.locator('.compare-value').allTextContents().then(actual => actual.join('|') === values.join('|')), `${name} measured ranges`);
    check((await page.locator('.compare-summary').textContent()).includes(summary), `${name} source-backed interpretation`);
    const bounds = await page.locator('.bar-fill').evaluateAll(bars => bars.map(bar => ({left:bar.getBoundingClientRect().left,right:bar.getBoundingClientRect().right})));
    check(name === 'Effects' ? bounds[1].right < bounds[0].left : Math.max(bounds[0].left,bounds[1].left) <= Math.min(bounds[0].right,bounds[1].right), `${name} range overlap represented correctly`);
    check(await button.evaluate(el => getComputedStyle(el).outlineStyle) !== 'none', 'Visible keyboard focus');
  }
  report.push('PASS all four measured ranges, units, interpretations and interval geometry');

  const colors = await page.locator('.bar-fill').evaluateAll(bars => bars.map(bar => getComputedStyle(bar).backgroundColor));
  check(colors.join('|') === 'rgb(255, 159, 69)|rgb(94, 200, 255)', 'Film variant colors');
  check(!await page.locator('body').innerText().then(text => /26.2%|20.6%|02 measured runs|Do better rules/.test(text)), 'Old single-run claims removed');
  check(await page.locator('link[rel="canonical"]').getAttribute('href') === 'https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/', 'Canonical URL');
  for (const property of ['og:title','og:description','og:image']) check(await page.locator(`meta[property="${property}"]`).getAttribute('content'), property);
  report.push('PASS film colors, removed claims and social metadata');

  const urls = await page.locator('a[href], img[src], script[src], link[href]').evaluateAll(elements => [...new Set(elements.map(el => el.href || el.src).filter(url => typeof url === 'string' && url.startsWith(location.origin) && !url.includes('#')))]);
  for (const url of urls) check((await page.request.get(url)).ok(), `Broken local resource: ${url}`);
  const data = await (await page.request.get(base + '/assets/homepage-benchmarks.json')).json();
  for (const [i,variant] of ['bare','karpathy'].entries()) {
    const cohort = data.cohorts[variant];
    const run = cohort.runs.find(row => row.id === cohort.representative);
    const card = page.locator('.run').nth(i);
    const values = await card.locator('.kv b').allTextContents();
    check(Number(values[1].replaceAll(',', '')) === run.output_tokens, 'Representative output tokens');
    check(values[2] === run.thinking_percent + '%', 'Representative thinking');
    check(Number(values[3].replaceAll(',', '')) === run.lines_of_code, 'Representative lines');
    check(await card.locator('.shot img').getAttribute('src') === '/' + cohort.preview, 'Representative preview');
    await card.getByRole('link', {name:'Full-page preview'}).click();
    check(await page.locator(`#preview-${variant}`).getAttribute('open') !== null, 'Preview opens on episode page');
    await page.locator(`#preview-${variant} summary`).click();
  }
  await page.getByRole('link',{name:'Test materials'}).click();
  check(page.url().endsWith('#materials'), 'Materials stay on episode page');
  await page.getByRole('link',{name:'Read the test prompt'}).click();
  check(await page.locator('#task-prompt').getAttribute('open') !== null, 'Prompt opens on episode page');
  check((await page.locator('.prompt-text').textContent()).includes('the model reloaded before every run'), 'Exact measured prompt');
  await page.locator('#task-prompt summary').click();
  for (const variant of ['bare','Karpathy']) {
    await page.locator('.archive-details').evaluate(el => {el.open=true;});
    await page.getByRole('link',{name:`Open archived ${variant} demo`}).click();
    check(page.url().endsWith(`_${variant.toLowerCase()}_pi/index.html`), 'Archived live demo unchanged');
    await page.goBack();
  }
  report.push(`PASS ${urls.length} local resources, representative data, inline materials and both archived demos`);

  for (const path of ['/', '/episodes/', '/episodes/01-karpathy-vs-bare/']) {
    await page.goto(base + path);
    check(await page.locator('a[href*="/series/"]').count() === 0, 'No standalone research links');
    if (path === '/' || path === '/episodes/01-karpathy-vs-bare/') check((await page.locator('.research-teaser, .series-context').innerText()).includes('11 other local models'), 'Research context preserved without separate page');
    const local = await page.locator('a[href], img[src], script[src], link[href]').evaluateAll(elements => [...new Set(elements.map(el => el.href || el.src).filter(url => typeof url === 'string' && url.startsWith(location.origin)))]);
    for (const url of local) {
      const response = await page.request.get(url);
      check(response.ok(), `Broken resource: ${url}`);
      const hash = url.includes('#') ? url.slice(url.indexOf('#')) : '';
      if (hash) check((await response.text()).includes(`id="${hash.slice(1)}"`), `Broken anchor: ${url}`);
    }
    check(await page.locator('html').getAttribute('lang') === 'en', `${path}: English`);
    if (path === '/') {
      check(await page.locator('.series-model, .comparison, #materials').count() === 0, 'Homepage contains no full research or episode archive');
      check(await page.locator('.episode-card').count() === 1, 'Only the one real episode, within three-card limit');
      check((await page.locator('#method').innerText()).includes('93%'), 'Homepage preserves repeatability context');
      await page.getByRole('link', {name:'View all episodes'}).click();
      check(page.url() === base + '/episodes/', 'Full archive navigation');
    }
    if (path === '/episodes/') {
      check(await page.locator('.episode-card').count() === 1, 'Complete real catalog');
      await page.locator('.episode-card h3 a').click();
      check(page.url() === episode, 'Episode card opens full result');
    }

  }
  check((await page.request.get(base + '/series/04-seria-modeli-n3/')).status() === 404, 'Unpublished series route removed');
  check((await page.request.get(base + '/series/04-seria-modeli-n3/index.html')).status() === 404, 'Unpublished series file removed');
  check(!data.series04 && data.series_context.model_count === 11, 'Public data contains context only, no unpublished model table');
  report.push('PASS homepage/episode/archive separation, real cards, links and fragment targets');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.locator('.mobile-nav summary').click();
  await page.locator('.mobile-links').getByRole('link', { name: 'Benchmarks' }).click();
  check(page.url().endsWith('#episodes'), 'Mobile menu navigation');
  check(await page.locator('.mobile-nav').getAttribute('open') === null, 'Mobile menu closes after navigation');
  await page.goto(base);
  await page.keyboard.press('Tab');
  check(await page.locator('.skip').evaluate(el => el === document.activeElement), 'Keyboard skip link');
  await page.keyboard.press('Enter');
  check(page.url().endsWith('#main'), 'Skip target');
  report.push('PASS mobile navigation and skip link');

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

  const browser = page.context().browser();
  for (const scenario of ['no-javascript', 'no-webgl', 'no-gsap', 'no-three', 'no-data']) {
    const context = await browser.newContext({ javaScriptEnabled: scenario !== 'no-javascript', viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    try {
      if (scenario === 'no-webgl') await context.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...args) { return type.startsWith('webgl') ? null : original.call(this, type, ...args); };
      });
      if (scenario === 'no-gsap') await context.route('**/assets/vendor/gsap-*/**', route => route.abort());
      if (scenario === 'no-three') await context.route('**/assets/vendor/three-*/**', route => route.abort());
      if (scenario === 'no-data') await context.route('**/assets/homepage-benchmarks.json', route => route.fulfill({ status: 500, body: 'unavailable' }));
      const fallbackPage = await context.newPage();
      const fallbackErrors = [];
      fallbackPage.on('pageerror', error => fallbackErrors.push(error.message));
      await fallbackPage.goto(base);
      check(await fallbackPage.locator('h1').isVisible(), `${scenario}: heading remains visible`);
      if (['no-javascript', 'no-webgl', 'no-three'].includes(scenario)) check(await fallbackPage.locator('.scene-fallback').isVisible(), `${scenario}: static sculpture visible`);
      check(await fallbackPage.locator('.episode-card').count() === 1, `${scenario}: latest result available`);
      await fallbackPage.locator('.episode-card h3 a').click();
      check(await fallbackPage.locator('.run').count() === 2, `${scenario}: both outputs available`);
      if (scenario !== 'no-javascript' && scenario !== 'no-data') {
        await fallbackPage.getByRole('button', { name: 'output tokens', exact: true }).click();
        check((await fallbackPage.locator('.compare-value').allTextContents()).join('|') === '18,858–22,049 output tokens|14,333–24,268 output tokens', `${scenario}: data interaction independent`);
      } else check(await fallbackPage.locator('.metric-switch').isVisible() === false, `${scenario}: unavailable controls hidden`);
      await fallbackPage.getByRole('link', {name:'Read the test prompt'}).click();
      if (scenario !== 'no-javascript') check(await fallbackPage.locator('#task-prompt').getAttribute('open') !== null, `${scenario}: prompt opens`);
      await fallbackPage.locator('.archive-details summary').click();
      await fallbackPage.getByRole('link', { name: 'Open archived bare demo' }).click();
      check(fallbackPage.url().includes('_bare_pi/index.html'), `${scenario}: live demo still opens`);
      check(fallbackErrors.length === 0, `${scenario}: uncaught errors: ${fallbackErrors.join(', ')}`);
      report.push(`PASS fallback: ${scenario}`);
    } finally { await context.close(); }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base);
  await page.getByRole('button', { name: 'Rotate core' }).waitFor();
  for (const route of [base, base+'/episodes/', episode]) {
  await page.goto(route);
  for (const width of [320,390,768,1024,1440,1920]) {
    await page.setViewportSize({width,height:1000});
    if(width === 390) await page.locator('.material-details, .archive-details').evaluateAll(details => details.forEach(el => {el.open=true;}));
    const failures = await page.evaluate(() => {
      const visible = el => el.checkVisibility() && el.getBoundingClientRect().width > 0;
      const small = [...document.querySelectorAll('body *')].filter(el => visible(el) && [...el.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim()) && parseFloat(getComputedStyle(el).fontSize) < 11);
      const targets = [...document.querySelectorAll('a,button,summary')].filter(el => visible(el) && !el.classList.contains('skip') && (el.getBoundingClientRect().width < 44 || el.getBoundingClientRect().height < 44));
      return {small:small.map(el=>el.className),targets:targets.map(el=>el.textContent.trim()),overflow:document.documentElement.scrollWidth > innerWidth};
    });
    check(!failures.small.length && !failures.targets.length && !failures.overflow, `Readability at ${route} / ${width}: ${JSON.stringify(failures)}`);
    await page.locator('.material-details, .archive-details').evaluateAll(details => details.forEach(el => {el.open=false;}));
  }
  }
  report.push('PASS three pages: minimum 11px text and 44×44px targets at six widths, including open materials');
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(base);
  await page.getByRole('button', {name:'Rotate core'}).waitFor();
  async function captureFullPage(path) {
    // Paint every glass layer and load lazy previews before full-page capture.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 650) {
      await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), y);
      await page.waitForTimeout(80);
    }
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(200);
    await page.screenshot({ path, fullPage: true });
  }
  await captureFullPage('.screenshots/homepage-corrected-desktop.png');
  await page.setViewportSize({ width: 390, height: 844 });
  await captureFullPage('.screenshots/homepage-corrected-mobile.png');
  for (const [name, url] of [['episode',episode], ['episodes',base+'/episodes/']]) {
    await page.goto(url);
    await page.setViewportSize({width:1440,height:1000});
    await captureFullPage(`.screenshots/${name}-desktop.png`);
    await page.setViewportSize({width:390,height:844});
    await captureFullPage(`.screenshots/${name}-mobile.png`);
  }
  check(errors.length === 0, 'Uncaught browser errors: ' + errors.join(', '));
  report.push('PASS no uncaught JavaScript errors; desktop/mobile screenshots saved');
  return report;
}
