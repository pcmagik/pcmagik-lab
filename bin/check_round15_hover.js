/* Exercise the actual CSS transform after the existing GSAP entrance completes. */
async page => {
  await page.setViewportSize({width: 1920, height: 1080});
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.goto('http://127.0.0.1:8890/');
  const card = page.locator('.ep.fx-border').first();
  await card.evaluate(el => el.scrollIntoView({block: 'center', behavior: 'instant'}));
  await page.mouse.move(0, 0);
  await page.waitForTimeout(1600);
  const before = await card.boundingBox();
  await card.hover();
  await page.waitForTimeout(500);
  const after = await card.boundingBox();
  const lift = after.y - before.y;
  if (lift > -4 || lift < -6) throw Error('Expected 4–6px lift; measured ' + lift);
  return {lift};
}
