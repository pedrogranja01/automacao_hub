// Helper reutilizado pelos scripts de etapa: abre um Chromium com profile
// persistente em disco, para que login/cookies/MFA fiquem salvos entre
// chamadas separadas do Bash. Cada script deve chamar close() no final.
const path = require('path');
const { chromium } = require('playwright');

const PROFILE_DIR = path.join(__dirname, 'profile');

async function getPage() {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    headless: true,
    acceptDownloads: true,
    viewport: { width: 1440, height: 900 },
  });
  const page = context.pages()[0] || (await context.newPage());
  return { context, page };
}

module.exports = { getPage, PROFILE_DIR };
