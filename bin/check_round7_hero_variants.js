async page => {
  const base=page.url().split('/').slice(0,3).join('/'),results=[];
  for(const width of [1920,390]) {
    await page.setViewportSize({width,height:1080});await page.goto(base+'/');
    results.push(...await page.locator('.telemetry-run small').evaluateAll((es,width)=>es.flatMap(e=>{
      const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),found=[];
      while(walker.nextNode())for(const word of walker.currentNode.textContent.match(/\b(?:BARE|KARPATHY)\b/g)||[]) {
        const color=getComputedStyle(walker.currentNode.parentElement).color;
        found.push({width,word,color,pass:color===(word==='BARE'?'rgb(255, 159, 69)':'rgb(94, 200, 255)')});
      }
      return found;
    }),width));
  }
  return {pass:results.length===4&&results.every(r=>r.pass),results};
}
