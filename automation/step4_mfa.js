const path = require('path');
const fs = require('fs');
const { getPage } = require('./connect');

const CODE = process.argv[2];

if (!CODE || !/^\d{4,8}$/.test(CODE)) {
  console.error('STEP_ERROR Uso: node step4_mfa.js <codigo-mfa>');
  process.exit(1);
}

(async () => {
  const mfaUrl = fs.readFileSync(path.join(__dirname, 'last_url.txt'), 'utf8').trim();

  const { context, page } = await getPage();
  await page.goto(mfaUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);

  const digitInputs = page.locator('input[type="text"]');
  const count = await digitInputs.count();
  if (count !== CODE.length) {
    console.error(`STEP_ERROR Encontrei ${count} caixas de dígito na tela, mas o código tem ${CODE.length} caracteres.`);
    const shot = path.join(__dirname, 'shots', '04_mfa_mismatch.png');
    await page.screenshot({ path: shot, fullPage: true });
    console.error('SCREENSHOT:', shot);
    await context.close();
    process.exit(1);
  }

  for (let i = 0; i < CODE.length; i++) {
    await digitInputs.nth(i).click();
    await page.keyboard.type(CODE[i], { delay: 80 });
  }

  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Confirmar e acessar conta' }).click();
  await page.waitForTimeout(6000);

  const shot = path.join(__dirname, 'shots', '04_after_mfa.png');
  await page.screenshot({ path: shot, fullPage: true });
  console.log('URL after MFA:', page.url());
  console.log('TITLE:', await page.title());
  console.log('SCREENSHOT:', shot);

  await context.close();
})().catch((err) => {
  console.error('STEP_ERROR', err);
  process.exit(1);
});
