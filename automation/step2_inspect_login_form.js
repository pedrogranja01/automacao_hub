const path = require('path');
const { getPage } = require('./connect');

(async () => {
  const { context, page } = await getPage();

  await page.goto('https://hub.xpi.com.br', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  const shot = path.join(__dirname, 'shots', '02_login_form.png');
  await page.screenshot({ path: shot, fullPage: true });

  // Varre a página principal e todos os iframes atrás de campos de input/botões,
  // pra eu conseguir identificar os seletores certos sem chutar.
  async function dumpFrame(frame, label) {
    const info = await frame.evaluate(() => {
      const describe = (el) => ({
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        name: el.getAttribute('name'),
        type: el.getAttribute('type'),
        placeholder: el.getAttribute('placeholder'),
        ariaLabel: el.getAttribute('aria-label'),
        text: (el.innerText || el.value || '').trim().slice(0, 60),
      });
      return {
        inputs: Array.from(document.querySelectorAll('input')).map(describe),
        buttons: Array.from(document.querySelectorAll('button, [role="button"]')).map(describe),
      };
    });
    console.log(`--- FRAME: ${label} (${frame.url()}) ---`);
    console.log(JSON.stringify(info, null, 2));
  }

  await dumpFrame(page.mainFrame(), 'main');
  for (const frame of page.frames()) {
    if (frame === page.mainFrame()) continue;
    try {
      await dumpFrame(frame, frame.name() || 'iframe');
    } catch (e) {
      console.log(`--- FRAME: ${frame.url()} (could not inspect: ${e.message}) ---`);
    }
  }

  console.log('SCREENSHOT:', shot);
  await context.close();
})().catch((err) => {
  console.error('STEP_ERROR', err);
  process.exit(1);
});
