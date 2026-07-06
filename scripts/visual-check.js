const path = require('node:path');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');

const baseUrl = 'http://127.0.0.1:5173';
const outputDir = path.resolve(__dirname, '..', 'artifacts');
const viteBin = path.resolve(__dirname, '..', 'node_modules', 'vite', 'bin', 'vite.js');

async function clickByRole(page, name, index = 0) {
  await page.getByRole('button', { name }).nth(index).click();
}

async function waitForServer(server) {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < 30000) {
    if (server.exitCode !== null) {
      throw new Error(`Vite exited early with code ${server.exitCode}`);
    }

    try {
      const response = await fetch(baseUrl);
      if (response.ok) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  throw lastError || new Error('Timed out waiting for Vite');
}

async function run() {
  fs.mkdirSync(outputDir, { recursive: true });
  const server = spawn(process.execPath, [viteBin, '--host', '127.0.0.1'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'ignore',
    windowsHide: true,
  });

  await waitForServer(server);
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(outputDir, 'desktop-home.png'), fullPage: true });

    await clickByRole(page, '무료로 그룹 만들기');
    await clickByRole(page, '그룹 생성하고 초대하기');
    await page.screenshot({ path: path.join(outputDir, 'desktop-dashboard.png'), fullPage: true });

    await clickByRole(page, '내 취향 입력하기');
    await clickByRole(page, '일식');
    await clickByRole(page, '다음');
    await clickByRole(page, '그룹 분석 결과보기');
    await page.screenshot({ path: path.join(outputDir, 'desktop-analysis.png'), fullPage: true });

    await clickByRole(page, '추천 카드 보러가기');
    await page.screenshot({ path: path.join(outputDir, 'desktop-recommend.png'), fullPage: true });
    await page.getByRole('button', { name: '갈래', exact: true }).click();
    await page.screenshot({ path: path.join(outputDir, 'desktop-result-a.png'), fullPage: true });

    await clickByRole(page, 'B안 보기');
    await page.locator('.variant-b').waitFor();
    await page.screenshot({ path: path.join(outputDir, 'desktop-result-b.png'), fullPage: true });

    await clickByRole(page, '일정에 추가');
    await page.screenshot({ path: path.join(outputDir, 'desktop-schedule.png'), fullPage: true });

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
    await mobile.goto(baseUrl, { waitUntil: 'networkidle' });
    await mobile.screenshot({ path: path.join(outputDir, 'mobile-home.png'), fullPage: true });
    await mobile.getByRole('button', { name: '갈래 말래 체험' }).click();
    await mobile.screenshot({ path: path.join(outputDir, 'mobile-recommend.png'), fullPage: true });
  } finally {
    await browser.close();
    server.kill();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
