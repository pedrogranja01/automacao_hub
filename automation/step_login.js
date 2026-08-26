const path = require('path');
const { getPage } = require('./connect');

(async () => {
  const { context, page } = await getPage();

  await page.goto('https://hub.xpi.com.br', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);

  const shot = path.join(__dirname, 'shots', '01_initial.png');
  await page.screenshot({ path: shot, fullPage: true });
  console.log('URL:', page.url());
  console.log('TITLE:', await page.title());
  console.log('SCREENSHOT:', shot);

  await context.close();
})().catch((err) => {
  console.error('STEP_ERROR', err);
  process.exit(1);
});
