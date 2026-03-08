import { chromium, type Browser, type Page } from 'playwright';

export async function getBrowserContext() {
  const browser = await chromium.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  return { browser, context };
}

export async function applySpotlight(page: Page) {
  await page.evaluate(() => {
    // Hide cookie banners
    const cookieSelectors = ['[id*="cookie" i]', '[class*="cookie" i]', '[id*="consent" i]', '[class*="consent" i]', '.didomi-popup', '#onetrust-banner-sdk', '.cmp-container'];
    cookieSelectors.forEach(sel => {
      try {
        const banners = document.querySelectorAll(sel);
        banners.forEach(b => (b as HTMLElement).style.display = 'none');
      } catch(e) {}
    });

    // Spotlight core elements
    const highlights = document.querySelectorAll('h1, button, a.button, .btn, input[type="search"]');
    highlights.forEach(el => {
      const htmlEl = el as HTMLElement;
      const text = htmlEl.innerText?.toLowerCase() || '';
      const cookieKeywords = ['cookie', 'consent', 'privacy', 'banner', 'accept', 'allow', 'agree'];
      const isCookieRelated = cookieKeywords.some(k => text.includes(k));
      if (!isCookieRelated) {
        htmlEl.style.outline = '8px solid #ef4444';
        htmlEl.style.outlineOffset = '2px';
      }
    });
  });
}

export async function captureSlices(page: Page): Promise<string[]> {
  const pool: string[] = [];
  const scrolls = [0, 1000, 2000];

  for (const y of scrolls) {
    try {
      await page.evaluate((scrollToY) => {
        window.scrollTo(0, scrollToY);
        const main = document.querySelector('main') || document.querySelector('#main') || document.body;
        if (main && scrollToY > 0) main.scrollTop = scrollToY;
      }, y);
      await page.waitForTimeout(1000);
      const b = await page.screenshot({ type: 'jpeg', quality: 70, fullPage: false });
      pool.push(b.toString('base64'));
    } catch (e) {
      console.error(`[BrowserCore] Slice at ${y} failed:`, e);
    }
  }
  while (pool.length < 3) pool.push(pool[0] || "");
  return pool;
}

export async function captureElementScreenshot(page: Page, selector: string): Promise<string | null> {
  try {
    const el = await page.$(selector);
    if (el) {
      await el.evaluate(node => {
        const htmlEl = node as HTMLElement;
        htmlEl.style.outline = '10px solid #ef4444';
        htmlEl.style.outlineOffset = '4px';
        htmlEl.style.boxShadow = '0 0 0 10000px rgba(239, 68, 68, 0.15)'; // Spotlight effect
        htmlEl.scrollIntoView({ block: 'center' });
      });
      await page.waitForTimeout(300);
      const buffer = await el.screenshot({ type: 'jpeg', quality: 80 });
      // Reset style after
      await el.evaluate(node => (node as HTMLElement).style.outline = '');
      return buffer.toString('base64');
    }
  } catch (e) {}
  return null;
}
