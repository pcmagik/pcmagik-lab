/* Verify real-feed teaser geometry and retain full-page visual evidence. */
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({headless:true});
  const base = process.argv[2], out = '.screenshots/runda17', results = [];
  fs.mkdirSync(out, {recursive:true});
  try {
    for (const width of [1920,390]) {
      const page = await browser.newPage({viewport:{width,height:1080}, reducedMotion:'reduce'});
      const views = {};
      for (const [name,route] of [['home','/'],['list','/episodes/']]) {
        await page.goto(base+route);
        await page.waitForLoadState('networkidle');
        await page.locator('footer').scrollIntoViewIfNeeded();
        await page.evaluate(() => scrollTo(0,0));
        if (name==='list') {
          assert.equal(await page.locator('img').count(),0);
          assert(!(await page.content()).includes('Explore live'));
        }
        views[name] = await page.locator('article.ep').evaluateAll(cards => cards.map(card => {
          const b = card.getBoundingClientRect(), fields = {};
          for (const selector of ['.chip','time','h3','.ep-subtitle','.button']) {
            const el = card.querySelector(selector), r = el.getBoundingClientRect(), s = getComputedStyle(el);
            fields[selector] = {font:s.fontFamily,size:s.fontSize,weight:s.fontWeight,line:s.lineHeight,x:r.x-b.x,y:r.y-b.y,width:r.width,height:r.height};
          }
          return {slug:card.dataset.episode, fields};
        }));
        await page.screenshot({path:`${out}/${name}-${width}-full.png`,fullPage:true});
        await page.locator('article.ep').first().screenshot({path:`${out}/${name}-${width}-card.png`});
        assert.equal(await page.locator('article.fx-comet').count(),1);
        assert.equal(await page.locator('article.fx-border').count(),views[name].length);
      }
      let maxDelta=0;
      for (const card of views.home) {
        const other = views.list.find(c=>c.slug===card.slug);
        assert(other);
        for (const [selector,field] of Object.entries(card.fields)) {
          for (const [key,value] of Object.entries(field)) {
            const actual=other.fields[selector][key];
            if (typeof value==='number') {
              const delta=Math.abs(value-actual); maxDelta=Math.max(maxDelta,delta);
              assert(delta<=2,`${width} ${card.slug} ${selector} ${key}: ${value} vs ${actual}`);
            } else assert.equal(actual,value);
          }
        }
      }
      results.push({width,compared:views.home.length,maxDelta,views});
      await page.goto(base+'/episodes/'+views.home[0].slug+'/');
      assert(await page.locator('img[data-preview]').count()>0);
      await page.close();
    }
    console.log(JSON.stringify({passed:true,results},null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
