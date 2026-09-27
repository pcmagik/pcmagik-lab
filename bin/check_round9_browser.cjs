/* Real publication acceptance: NODE_PATH must resolve the installed Playwright. */
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const base = process.argv[2] || 'http://127.0.0.1:8876';
  const point = process.argv[3] || 'all';
  const browser = await chromium.launch({headless: true});
  try {
    const page = await browser.newPage({reducedMotion: 'reduce'});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const feed = await (await page.request.get(base + '/data/episodes.json')).json();
    const heights = {}, fonts = {};
    fs.mkdirSync('.screenshots', {recursive:true});
    for (const width of [1920, 390]) {
      await page.setViewportSize({width, height:width === 390 ? 844 : 1080});
      heights[width] = {}; fonts[width] = [];
      const routes = [['home','/'], ['list','/episodes/'], ...feed.episodes.map(e=>[e.slug.slice(0,2), `/episodes/${e.slug}/`])];
      for (const [name, route] of routes) {
        await page.goto(base + route);
        await page.evaluate(async () => {
          await document.fonts.ready;
          for(let y=0;y<document.body.scrollHeight;y+=650) {scrollTo(0,y); await new Promise(r=>setTimeout(r,10));}
          for(const img of document.images) {img.loading='eager'; await img.decode().catch(()=>{});}
          scrollTo(0,0);
        });
        if (point === 'all' || point === 'U1') {
          const labels = await page.locator('.episode-number').allTextContents();
          const expected = name === 'list' ? feed.episodes.map(e=>'EP '+e.slug.slice(0,2)) : name === 'home' ? await page.locator('[data-episode]').evaluateAll(nodes=>nodes.map(n=>'EP '+n.dataset.episode.slice(0,2))) : ['EP '+name];
          assert.deepEqual(labels,expected,`U1 ${width} ${name}`);
          for(const label of await page.locator('.episode-number').all()) assert(await label.isVisible());
          if (!['home','list'].includes(name)) {
            const label = await page.locator('.episode-number').boundingBox(), h1 = await page.locator('h1').boundingBox();
            assert(label.y + label.height <= h1.y, 'U1 label above H1');
          }
        }
        if ((point === 'all' || point === 'U2') && await page.locator('.model-table').count()) {
          const runs = await page.locator('#all-runs').boundingBox(), table = await page.locator('.model-table').boundingBox();
          assert(runs.y + runs.height <= table.y, `U2 visual order ${width}`);
          await page.locator('.result-hero a[href="#all-runs"]').click();
          assert.equal(new URL(page.url()).hash,'#all-runs');
          assert(await page.locator('#all-runs').isVisible());
          await page.evaluate(()=>scrollTo(0,0));
        }
        if (point === 'all' || point === 'U3') {
          assert.equal(await page.locator('.result-number').count(), 0, `U3 no oversized number ${name} ${width}`);
          if (!['home','list'].includes(name)) {
            const hero = page.locator('.result-hero');
            assert.equal(await hero.count(),1);
            assert.equal(await hero.locator('.result-verdict').count(),1);
            assert(await hero.locator('.eyebrow').isVisible());
            assert(await hero.locator('.measurement-note').isVisible());
            assert(await hero.locator('a[href="#all-runs"]').isVisible());
            heights[width][name] = (await hero.boundingBox()).height;
            fonts[width].push(await hero.locator('.result-verdict').evaluate(e=>getComputedStyle(e).fontSize));
            assert(await hero.evaluate(e=>e.scrollHeight<=e.clientHeight), 'U3 clipped content');
          }
        }
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), `${name} horizontal overflow`);
        assert.equal(await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).length),0,`${name} broken images`);
        if (point === 'all') await page.screenshot({path:`.screenshots/runda9-${feed.episodes.length?'feed':'empty'}-${name}-${width}.png`,fullPage:true});
      }
      if ((point === 'all' || point === 'U3') && feed.episodes.length) {
        const h = Object.values(heights[width]);
        assert(Math.max(...h)-Math.min(...h)<=8, `U3 heights ${JSON.stringify(heights[width])}`);
        assert.equal(new Set(fonts[width]).size,1, 'U3 uniform verdict font');
      }
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({status:'PASS',point,heights,fonts},null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
