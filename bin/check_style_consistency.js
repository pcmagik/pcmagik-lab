async page => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('**/*', route => route.continue({headers:{...route.request().headers(),'Cache-Control':'no-cache'}}));
  const selectors=['body','.header-inner','.comparison','.compare-top h4','.metric-switch button[aria-pressed="true"]','.compare-label','.bar-track','.bare-bar','.karpathy-bar','.compare-value','.compare-summary','.run','.name b'];
  const properties=['fontFamily','fontSize','fontWeight','color','backgroundColor','backgroundImage','boxShadow','borderRadius','padding','height','position'];
  const results=[];
  for(const width of [1920,390]){
    await page.setViewportSize({width,height:1080});
    for(const metric of ['time','tokens','throughput','effects']){
      const styles=[];
      for(const route of ['/','/episodes/01-karpathy-vs-bare/']){
        await page.goto('http://127.0.0.1:8765'+route);
        await page.locator(`[data-metric="${metric}"]`).click();
        styles.push(await page.evaluate(({selectors,properties})=>Object.fromEntries(selectors.map(selector=>{
          const element=document.querySelector('[data-metric-panel]:not([hidden]) '+selector)||document.querySelector(selector);
          const style=getComputedStyle(element);
          return [selector,Object.fromEntries(properties.filter(p=>p!=='height'||selector==='.bar-track').map(p=>[p,style[p]]))];
        })),{selectors,properties}));

      }
      const differences=[];
      for(const selector of selectors)for(const prop of Object.keys(styles[0][selector]))if(styles[0][selector][prop]!==styles[1][selector][prop])differences.push(`${selector} ${prop}: ${styles[0][selector][prop]} != ${styles[1][selector][prop]}`);
      if(differences.length)throw Error(width+'px '+metric+' styles differ:\n'+differences.join('\n'));
      results.push('PASS '+width+'px '+metric+': homepage and episode use identical shared component styles');
    }
    await page.goto('http://127.0.0.1:8765/episodes/');
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Episode list overflows');
    if(!(await page.locator('a[href="/episodes/01-karpathy-vs-bare/"]').count()))throw Error('Episode list link missing');
    results.push('PASS '+width+'px: episode list link and layout');
  }
  return results;
}
