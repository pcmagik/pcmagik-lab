/* Run with playwright-cli run-code --filename=bin/check_round15.js.
   Serve isolated real/empty builds on 8890/8891. */
async page => {
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const report = [];
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const real = 'http://127.0.0.1:8890', empty = 'http://127.0.0.1:8891';
  const feed = await (await page.request.get(real + '/data/episodes.json')).json();
  const ep = feed.episodes.find(ep => ep.slug.startsWith('13-'));
  check(ep, 'Real episode 13 is required');
  const cases = [['home', real + '/'], ['list', real + '/episodes/'], ['episode13', real + '/episodes/' + ep.slug + '/'], ['empty', empty + '/']];
  const animations = () => document.getAnimations().filter(a => a.animationName?.startsWith('fx-')).length;
  for (const [name, url] of cases) {
    for (const width of [1920, 390]) {
      await page.setViewportSize({width, height: 1080});
      await page.emulateMedia({reducedMotion: 'no-preference'});
      await page.goto(url);
      await page.waitForTimeout(1300);
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), name + ' overflow ' + width);
      const selector = name === 'episode13' ? '.fx-pulse' : name === 'list' ? '.fx-comet' : '.fx-glass';
      check(await page.locator(selector).count() === 1, name + ' missing effect');
      if (name === 'home' || name === 'empty') {
        check(await page.locator('.fx-spotlight').count() === 4, 'Four process cards');
        check(await page.locator('.fx-aurora').count() === 1, 'Closing aurora');
      }
      check(await page.evaluate(() => getComputedStyle(document.body, '::after').backgroundImage.includes('feTurbulence')), 'Inline grain');
      await page.locator(selector).evaluate(el => el.scrollIntoView({block: 'center', behavior: 'instant'}));
      await page.waitForTimeout(1100);
      check(await page.evaluate(animations) > 0, name + ' animation must run');
      const angle1 = await page.locator(selector).evaluate(el => getComputedStyle(el, '::after').getPropertyValue('--fx-angle'));
      await page.screenshot({path: '.screenshots/runda15/' + name + '-' + width + '-a.png', fullPage: true});
      await page.waitForTimeout(1000);
      const angle2 = await page.locator(selector).evaluate(el => getComputedStyle(el, '::after').getPropertyValue('--fx-angle'));
      await page.screenshot({path: '.screenshots/runda15/' + name + '-' + width + '-b.png', fullPage: true});
      if (name !== 'episode13') check(angle1 !== angle2, name + ' comet moves');
      if (name === 'episode13') {
        const sizes = await page.locator(selector).evaluate(el => {
          const before = el.getBoundingClientRect();
          el.classList.remove('fx-border', 'fx-pulse');
          const after = el.getBoundingClientRect();
          el.classList.add('fx-border', 'fx-pulse');
          return [before.width, before.height, after.width, after.height];
        });
        check(sizes[0] === sizes[2] && sizes[1] === sizes[3], 'Result dimensions unchanged');
        report.push({name, width, sizes});
      }
      await page.locator('.motion-toggle').click();
      await page.waitForTimeout(100);
      check(await page.evaluate(animations) === 0, name + ' Pause removes animations');
      await page.locator(selector).hover();
      check(await page.evaluate(animations) === 0, 'Hover cannot restart paused motion');
      await page.emulateMedia({reducedMotion: 'reduce'});
      await page.reload();
      await page.waitForTimeout(200);
      await page.locator(selector).hover();
      check(await page.evaluate(animations) === 0, name + ' reduced motion removes animations');
      report.push({name, width, paused: 0, reduced: 0, overflow: false, angle1, angle2});
    }
  }
  await page.setViewportSize({width: 1920, height: 1080});
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.goto(real);
  await page.waitForTimeout(1600);
  const performanceResult = await page.evaluate(async () => {
    const longFrames = [], deltas = [];
    const observer = new PerformanceObserver(list => longFrames.push(...list.getEntries().map(e => e.duration)));
    observer.observe({type: 'long-animation-frame', buffered: false});
    let last;
    await new Promise(resolve => {
      const start = performance.now();
      function frame(now) {
        if (last) deltas.push(now - last);
        last = now;
        const progress = Math.min((now - start) / 6000, 1);
        window.scrollTo({top: (document.documentElement.scrollHeight - innerHeight) * progress, behavior: 'instant'});
        if (progress < 1) requestAnimationFrame(frame); else resolve();
      }
      requestAnimationFrame(frame);
    });
    await new Promise(resolve => setTimeout(resolve, 100));
    observer.disconnect();
    return {longFrames, frames: deltas.length, maxRafMs: Math.max(...deltas), supported: PerformanceObserver.supportedEntryTypes.includes('long-animation-frame')};
  });
  check(performanceResult.supported, 'Chrome long-frame observer supported');
  check(performanceResult.longFrames.length === 0, 'Long animation frames: ' + JSON.stringify(performanceResult));
  check(errors.length === 0, 'Browser errors: ' + errors.join(', '));
  console.log(JSON.stringify({report, performanceResult, errors}, null, 2));
}
