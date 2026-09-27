const {chromium} = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({headless:true});
  const failures=[], checks=[];
  try {
    const base=process.argv[2];
    const page=await browser.newPage({reducedMotion:'reduce'});
    const feed=await (await page.request.get(base+'/data/episodes.json')).json();
    for(const width of [1920,390]) {
      await page.setViewportSize({width,height:1080});
      for(const ep of feed.episodes) {
        await page.goto(`${base}/episodes/${ep.slug}/`);
        const result=await page.locator('.reproduction-table').evaluate(table=>{
          const collisions=[];
          for(const cell of table.querySelectorAll('tbody th, tbody td')) {
            const box=cell.getBoundingClientRect();
            for(const span of cell.querySelectorAll('span')) {
              const range=document.createRange();range.selectNodeContents(span);
              for(const rect of range.getClientRects()) {
                if(rect.right>box.right-4 || rect.left<box.left) collisions.push(cell.dataset.field);
              }
            }
          }
          return {collisions, table:table.getBoundingClientRect().width, container:table.parentElement.clientWidth};
        });
        try {
          assert.deepEqual(result.collisions,[],'text must stay inside its cell');
          if(width===1920) assert(result.table<=result.container+1,'all desktop columns must fit');
          checks.push(`${width} ${ep.slug}`);
        } catch(e) {failures.push(`${width} ${ep.slug}: ${e.message}`);}
      }
    }
    console.log(JSON.stringify({checks,failures},null,2));
    if(failures.length) process.exitCode=1;
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
