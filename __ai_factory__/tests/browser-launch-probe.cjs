const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', chromiumSandbox: true, timeout: 15000 });
  console.log('EDGE_LAUNCH_OK');
  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
