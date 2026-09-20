async page => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  await page.goto('http://127.0.0.1:4173/');
  check(await page.locator('html').getAttribute('lang') === 'en', 'Page language');
  const report = [];
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({width, height: 1000});
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow at ' + width);
    check(await page.locator('.run').count() === 2, 'Both runs visible');
    report.push('PASS layout ' + width + 'px');
  }
  const urls = await page.locator('a[href], img[src], link[rel="icon"]').evaluateAll(elements => [...new Set(elements.map(el => el.href || el.src).filter(url => url.startsWith(location.origin) && !url.includes('#')))]);
  for (const url of urls) {
    const response = await page.request.get(url);
    check(response.ok(), 'Broken link: ' + url);
  }
  report.push('PASS ' + urls.length + ' unique local resources and links');
  check(await page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0)), 'Images loaded');
  const data = await (await page.request.get('http://127.0.0.1:4173/index.json')).json();
  for (let i=0; i<data[0].runs.length; i++) {
    const run = data[0].runs[i];
    const card = page.locator('.run').nth(i);
    check(await card.locator('.shot').getAttribute('href') === run.strona, 'Live output URL');
    const values = await card.locator('.kv b').allTextContents();
    check(Number(values[1].replaceAll(',', '')) === run.tokeny, 'Tokens match source');
    check(values[2] === run.myslenie_pct + '%', 'Thinking matches source');
    check(Number(values[3]) === run.linie, 'Code lines match source');
    const rounded = Math.round(run.sekundy);
    check(values[0] === Math.floor(rounded / 60) + ' min ' + rounded % 60 + ' s', 'Time matches source');
    await card.getByRole('link', {name: 'Open live demo'}).click();
    check(page.url().endsWith(run.strona), 'Live demo navigation');
    await page.goBack();
  }
  report.push('PASS both live demos and all displayed run metrics');
  await page.setViewportSize({width:390,height:844});
  await page.locator('.mobile-nav summary').click();
  await page.locator('.mobile-links').getByRole('link', {name:'Benchmarks'}).click();
  check(page.url().slice(page.url().indexOf('#')) === '#episodes', 'Mobile navigation');
  await page.locator('.mobile-nav summary').click();
  await page.goto('http://127.0.0.1:4173/');
  await page.keyboard.press('Tab');
  check(await page.locator('.skip').evaluate(el => el === document.activeElement), 'Keyboard skip link');
  await page.keyboard.press('Enter');
  check(page.url().slice(page.url().indexOf('#')) === '#main', 'Skip link target');
  report.push('PASS mobile menu and keyboard skip link');
  await page.emulateMedia({reducedMotion:'reduce'});
  check(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'Reduced motion');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('http://127.0.0.1:4173/');
  await page.screenshot({path:'.screenshots/glass-neon-mobile.png',fullPage:true});
  await page.setViewportSize({width:1440,height:1100});
  await page.screenshot({path:'.screenshots/glass-neon-desktop.png',fullPage:true});
  check(errors.length === 0, 'Browser errors: ' + errors.join(', '));
  report.push('PASS reduced motion; no browser JavaScript errors');
  return report;
}
