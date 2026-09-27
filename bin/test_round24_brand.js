// Run with playwright-cli run-code after opening the site's root URL.
async page => {
  const base = page.url();
  const response = await page.request.get(base + 'data/episodes.json');
  if (!response.ok()) throw new Error('Cannot read episode feed');
  const feed = await response.json();
  const paths = ['index.html', 'episodes/', 'privacy/', '404.html',
    ...feed.episodes.map(episode => `episodes/${episode.slug}/`)];
  const results = [];
  await page.route('https://static.cloudflareinsights.com/**', route =>
    route.fulfill({body: '', contentType: 'application/javascript'}));
  for (const width of [1920, 390]) {
    await page.setViewportSize({width, height: 1080});
    for (const path of paths) {
      await page.goto(base + path);
      const actual = await page.locator('.brand').evaluate(brand => {
        const lab = getComputedStyle(brand.querySelector('span span'));
        const name = getComputedStyle(brand.querySelector('span:last-child'));
        return {text: brand.textContent, lab: lab.fontWeight,
          name: name.fontWeight, color: lab.color};
      });
      if (actual.text !== 'PC MAGIK LAB' || actual.lab !== '700' ||
          actual.lab !== actual.name || actual.color !== 'rgb(160, 166, 185)') {
        throw new Error(`${width} ${path}: ${JSON.stringify(actual)}`);
      }
      results.push({width, path, ...actual});
    }
  }
  return results;
}
