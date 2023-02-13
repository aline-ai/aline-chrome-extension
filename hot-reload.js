// this is a work in progress

const puppeteer = require('puppeteer-core');
const extensionId = "lgnnhhfnmnchpeceagjibjigjkamjljh";

// Open the Extension's background page
(async () => {
  // Insure that the browser is running with the remote debugging port 21222 open 
  const browserURL = 'http://127.0.0.1:21222';
  const browser = await puppeteer.connect({browserURL});

  const page = await browser.newPage();
  await page.goto('chrome://extensions/');
  // get the toggle button
  const element = await page
    .evaluateHandle(`document.
      querySelector("body > extensions-manager")
      .shadowRoot
      .querySelector("#items-list")
      .shadowRoot.querySelector("#${extensionId}")
      .shadowRoot
      .querySelector("#enableToggle")`);
  // hit toggle button twice
  await element.click();
  await element.click();
  await page.close();
  await browser.disconnect();
})();

