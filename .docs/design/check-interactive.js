async page => {
  const base = 'http://127.0.0.1:4174';
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
  await page.getByRole('button', { name: 'Tokens', exact: true }).waitFor();
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

  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width}`);
    check(await page.locator('.run').count() === 2, 'Both outputs remain present');
  }
  report.push('PASS layouts: 320, 390, 768, 1024, 1440px');

  const specifications = [
    ['Time', ['26 min 34 s', '19 min 37 s'], 'Karpathy took 26.2% less time in this run.'],
    ['Tokens', ['60,318', '47,903'], 'Karpathy used 20.6% fewer tokens in this run.'],
    ['Throughput', ['37.84 tok/s', '40.70 tok/s'], 'Karpathy had 7.6% higher throughput in this run.']
  ];
  for (const [name, values, summary] of specifications) {
    const button = page.getByRole('button', { name, exact: true });
    await button.focus();
    await page.keyboard.press('Enter');
    check(await button.getAttribute('aria-pressed') === 'true', `${name} announced as selected`);
    check(await page.locator('.compare-value').allTextContents().then(actual => actual.join('|') === values.join('|')), `${name} values`);
    check(await page.locator('.compare-summary').textContent() === summary, `${name} baseline and difference`);
    const widths = await page.locator('.bar-fill').evaluateAll(bars => bars.map(bar => bar.getBoundingClientRect().width));
    check(name === 'Throughput' ? widths[1] > widths[0] : widths[0] > widths[1], `${name} bar proportions`);
    check(await button.evaluate(el => getComputedStyle(el).outlineStyle) !== 'none', 'Visible keyboard focus');
  }
  report.push('PASS all three metrics, units, percentages, bar direction and keyboard focus');

  const urls = await page.locator('a[href], img[src], script[src], link[href]').evaluateAll(elements => [...new Set(elements.map(el => el.href || el.src).filter(url => typeof url === 'string' && url.startsWith(location.origin) && !url.includes('#')))]);
  for (const url of urls) check((await page.request.get(url)).ok(), `Broken local resource: ${url}`);
  const data = await (await page.request.get(base + '/index.json')).json();
  for (let i = 0; i < data[0].runs.length; i++) {
    const run = data[0].runs[i];
    const card = page.locator('.run').nth(i);
    const values = await card.locator('.kv b').allTextContents();
    check(Number(values[1].replaceAll(',', '')) === run.tokeny, 'Original tokens preserved');
    check(values[2] === run.myslenie_pct + '%', 'Original thinking preserved');
    check(Number(values[3]) === run.linie, 'Original code lines preserved');
    const seconds = Math.round(run.sekundy);
    check(values[0] === `${Math.floor(seconds / 60)} min ${seconds % 60} s`, 'Original times preserved');
    await card.getByRole('link', { name: 'Open live demo' }).click();
    check(page.url().endsWith(run.strona), 'Live demo navigation');
    await page.goBack();
  }
  report.push(`PASS ${urls.length} local links/resources, both live demos, original run metrics`);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.locator('.mobile-nav summary').click();
  await page.locator('.mobile-links').getByRole('link', { name: 'Benchmarks' }).click();
  check(page.url().endsWith('#episodes'), 'Mobile menu navigation');
  await page.locator('.mobile-nav summary').click();
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
      if (scenario === 'no-data') await context.route('**/index.json', route => route.fulfill({ status: 500, body: 'unavailable' }));
      const fallbackPage = await context.newPage();
      const fallbackErrors = [];
      fallbackPage.on('pageerror', error => fallbackErrors.push(error.message));
      await fallbackPage.goto(base);
      check(await fallbackPage.locator('h1').isVisible(), `${scenario}: heading remains visible`);
      check(await fallbackPage.locator('.run').count() === 2, `${scenario}: both outputs available`);
      if (scenario !== 'no-javascript' && scenario !== 'no-data') {
        await fallbackPage.getByRole('button', { name: 'Tokens', exact: true }).click();
        check((await fallbackPage.locator('.compare-value').allTextContents()).join('|') === '60,318|47,903', `${scenario}: data interaction independent`);
      } else check(await fallbackPage.locator('.metric-switch').isVisible() === false, `${scenario}: unavailable controls hidden`);
      if (['no-javascript', 'no-webgl', 'no-three'].includes(scenario)) {
        check(await fallbackPage.locator('.scene-fallback').isVisible(), `${scenario}: static sculpture visible`);
      }
      await fallbackPage.locator('.run').first().getByRole('link', { name: 'Open live demo' }).click();
      check(fallbackPage.url().includes('_bare_pi/index.html'), `${scenario}: live demo still opens`);
      check(fallbackErrors.length === 0, `${scenario}: uncaught errors: ${fallbackErrors.join(', ')}`);
      report.push(`PASS fallback: ${scenario}`);
    } finally { await context.close(); }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base);
  await page.getByRole('button', { name: 'Rotate core' }).waitFor();
  await page.screenshot({ path: '.screenshots/interactive-neon-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '.screenshots/interactive-neon-mobile.png', fullPage: true });
  check(errors.length === 0, 'Uncaught browser errors: ' + errors.join(', '));
  report.push('PASS no uncaught JavaScript errors; desktop/mobile screenshots saved');
  return report;
}
