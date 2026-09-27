async page => {
  const base=page.url().split('/').slice(0,3).join('/'),results=[];
  for(const width of [1920,390]) {
    await page.setViewportSize({width,height:width===390?844:1080});await page.goto(base+'/episodes/');
    results.push(await page.evaluate(()=>({width:innerWidth,viewport:innerHeight,document:document.documentElement.scrollHeight,footer:document.querySelector('footer').getBoundingClientRect().bottom,pass:document.documentElement.scrollHeight===innerHeight&&Math.abs(document.querySelector('footer').getBoundingClientRect().bottom-innerHeight)<=1})));
  }
  return {pass:results.every(r=>r.pass),results};
}
