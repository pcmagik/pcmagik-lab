// Run: playwright-cli -s=r24 run-code --filename=bin/test_round24_underline.js
// Open the local site first. The test measures rendered text, including descenders.
async page => {
  const base = await page.evaluate(() => location.origin + '/');
  await page.route('**/*', route => route.request().url().startsWith(base)
    ? route.continue() : route.abort());
  const feed = await (await page.request.get(base + 'data/episodes.json')).json();
  const results = [], failures = [];
  const check = (ok, message) => { if (!ok) failures.push(message); };
  await page.goto(base + `episodes/${feed.episodes[0].slug}/`, {waitUntil: 'domcontentloaded'});
  for (const width of [1440, 1024]) {
    await page.setViewportSize({width, height: 900});
    const links = page.locator('nav[aria-label="Main navigation"] a');
    for (let i = 0; i < await links.count(); i++) {
      const link = links.nth(i);
      await page.mouse.move(0, 0);
      const states = await link.getAttribute('aria-current') ? ['active', 'hover'] : ['hover'];
      for (const state of states) {
        if (state === 'hover') await link.hover();
        await link.evaluate(el => Promise.all(el.getAnimations({subtree: true}).map(a => a.finished)));
        const m = await link.evaluate(el => {
          const rect = el.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(el);
          const textBottom = Math.max(...Array.from(range.getClientRects(), r => r.bottom));
          const css = getComputedStyle(el, '::after');
          const top = rect.top + parseFloat(css.top);
          const height = parseFloat(css.height);
          const header = document.querySelector('header').getBoundingClientRect();
          return {text: el.textContent.trim(), textBottom, top, gap: top - textBottom,
            bottom: top + height, headerBottom: header.bottom, headerHeight: header.height,
            height, color: css.backgroundColor, transition: css.transition, transform: css.transform};
        });
        results.push({width, state, ...m});
        check(m.gap >= 3, `${width} ${state} ${m.text}: gap ${m.gap} < 3px`);
        check(m.bottom <= m.headerBottom, `${width} underline outside header`);
        check(m.headerHeight === 64, `${width} header height changed`);
        check(m.height === 2 && m.color === 'rgb(118, 255, 225)' &&
          m.transition === 'transform 0.35s' && m.transform === 'matrix(1, 0, 0, 1, 0, 0)',
          `${width} ${state} underline appearance changed: ${JSON.stringify(m)}`);
      }
    }
  }
  await page.setViewportSize({width: 390, height: 900});
  check(await page.locator('header').evaluate(el => el.getBoundingClientRect().height) === 62.390625,
    'Mobile header height changed');
  check(!await page.locator('nav[aria-label="Main navigation"]').isVisible(), 'Desktop menu visible on mobile');
  const menu = page.locator('.mobile-nav');
  await menu.locator('summary').click();
  check(await menu.getAttribute('open') !== null, 'Mobile menu does not open');
  const mobile = await menu.locator('a[aria-current]').evaluate(el => {
    const css = getComputedStyle(el);
    return {decoration: css.textDecorationLine, offset: css.textUnderlineOffset,
      thickness: css.textDecorationThickness, after: getComputedStyle(el, '::after').content};
  });
  check(mobile.decoration === 'underline' && mobile.offset === '6px' &&
    mobile.thickness === '2px' && mobile.after === 'none', 'Mobile underline changed');
  check(await menu.locator('a:visible').count() === 5, 'Mobile links missing');
  await menu.locator('summary').click();
  check(!await menu.locator('a').first().isVisible(), 'Mobile menu does not close');
  if (failures.length) throw new Error(JSON.stringify({results, mobile, failures}));
  return {results, mobile, failures};
}
