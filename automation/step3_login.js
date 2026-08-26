const path = require('path');
const fs = require('fs');
const { getPage } = require('./connect');

const LOGIN = process.env.XPI_LOGIN;
const SENHA = process.env.XPI_SENHA;

if (!LOGIN || !SENHA) {
  console.error('STEP_ERROR Defina XPI_LOGIN e XPI_SENHA no ambiente antes de rodar.');
  process.exit(1);
}

(async () => {
  const { context, page } = await getPage();

  await page.goto('https://hub.xpi.com.br', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);

  await page.locator('input[name="account"]').fill(LOGIN);
  await page.locator('input[name="password"]').fill(SENHA);

  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Acessar' }).click();

  await page.waitForTimeout(5000);

  const shot = path.join(__dirname, 'shots', '03_after_login.png');
  await page.screenshot({ path: shot, fullPage: true });

  async function dumpFrame(frame, label) {
    const info = await frame.evaluate(() => {
      const describe = (el) => ({
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        name: el.getAttribute('name'),
        type: el.getAttribute('type'),
        placeholder: el.getAttribute('placeholder'),
        ariaLabel: el.getAttribute('aria-label'),
        text: (el.innerText || el.value || '').trim().slice(0, 80),
      });
      return {
        inputs: Array.from(document.querySelectorAll('input')).map(describe),
        buttons: Array.from(document.querySelectorAll('button, [role="button"]')).map(describe),
      };
    });
    console.log(`--- FRAME: ${label} (${frame.url()}) ---`);
    console.log(JSON.stringify(info, null, 2));
  }

  console.log('URL after submit:', page.url());
  await dumpFrame(page.mainFrame(), 'main');
  console.log('SCREENSHOT:', shot);

  // Salva a URL pra o próximo passo (MFA) navegar direto pra cá, sem
  // precisar refazer o login (e sem o usuário ter que colar a URL enorme).
  fs.writeFileSync(path.join(__dirname, 'last_url.txt'), page.url());

  // O profile fica salvo em disco, então o próximo passo (MFA) reabre a
  // mesma sessão em progresso mesmo depois deste processo terminar.
  await context.close();
})().catch((err) => {
  console.error('STEP_ERROR', err);
  process.exit(1);
});
