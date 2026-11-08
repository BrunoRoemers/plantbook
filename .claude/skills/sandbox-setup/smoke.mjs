import { chromium, devices } from 'playwright';

const [url = 'http://localhost:3000', out = 'smoke.png'] = process.argv.slice(2);

const browser = await chromium.launch();
const page = await browser.newPage({ ...devices['iPhone 13'] });
const res = await page.goto(url);
console.log(res.status(), await page.title());
await page.screenshot({ path: out, fullPage: true });
await browser.close();
