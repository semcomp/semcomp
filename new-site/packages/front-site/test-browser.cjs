const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request =>
    console.log('REQUEST FAIL:', request.url(), request.failure().errorText)
  );

  await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
  const innerText = await page.evaluate(() => document.body.innerText);
  console.log('BODY TEXT LOG:', innerText.substring(0, 200));

  await browser.close();
})();
