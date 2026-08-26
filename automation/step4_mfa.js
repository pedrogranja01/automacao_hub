const path = require('path');
const fs = require('fs');
const { getPage } = require('./connect');

const CODE = process.argv[2];

if (!CODE || !/^\d{4,8}$/.test(CODE)) {
  console.error('STEP_ERROR Uso: node step4_mfa.js <codigo-mfa>');
  process.exit(1);
}

async function dumpErrors(page, label) {
  const shot = path.join(__dirname, 'shots', `${label}.png`);
  await page.screenshot({ path: shot, fullPage: true });
  const bodyText = await page.locator('body').innerText().catch(() => '(falhou ao ler o texto da página)');
  console.log(`--- ${label} ---`);
  console.log('URL:', page.url());
  console.log('SCREENSHOT:', shot);
  console.log('BODY TEXT (primeiros 2000 chars):');
  console.log(bodyText.slice(0, 2000));
  console.log('---');
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
    await dumpErrors(page, '04_mfa_mismatch');
    await context.close();
    process.exit(1);
  }

  for (let i = 0; i < CODE.length; i++) {
    await digitInputs.nth(i).click();
    await page.keyboard.type(CODE[i], { delay: 80 });
  }

  await page.waitForTimeout(500);
  await dumpErrors(page, '04a_before_submit');

  await page.getByRole('button', { name: 'Confirmar e acessar conta' }).click();

  // Tira uma sequência de prints logo após o clique, pra pegar qualquer
  // toast/popup de erro que apareça e suma rápido.
  await page.waitForTimeout(1000);
  await dumpErrors(page, '04b_plus1s');
  await page.waitForTimeout(2000);
  await dumpErrors(page, '04c_plus3s');
  await page.waitForTimeout(3000);
  await dumpErrors(page, '04d_plus6s');

  await context.close();
})().catch((err) => {
  console.error('STEP_ERROR', err);
  process.exit(1);
});
