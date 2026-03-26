import { chromium } from '@playwright/test';

export interface FailedLocator {
  selector: string;
  action: string;
}

export interface CandidateElement {
  tag: string;
  id: string;
  classes: string[];
  text: string;
  ariaLabel: string;
  dataTestId: string;
  type: string;
  placeholder: string;
  role: string;
}

export interface CrawlResult {
  failedSelector: string;
  candidates: CandidateElement[];
  pageUrl: string;
}

export async function crawlForCandidates(
  pageUrl: string,
  failedSelector: string
): Promise<CrawlResult> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(pageUrl);
    await page.waitForLoadState('domcontentloaded');

    // Pull all interactive elements from the page
    const candidates = await page.evaluate(() => {
      const interactiveSelectors = [
        'input',
        'button',
        'a',
        'select',
        'textarea',
        '[role="button"]',
        '[onclick]',
      ];

      const elements: CandidateElement[] = [];

      interactiveSelectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          const htmlEl = el as HTMLElement;
          elements.push({
            tag: el.tagName.toLowerCase(),
            id: el.id || '',
            classes: Array.from(el.classList),
            text: htmlEl.innerText?.trim() || '',
            ariaLabel: el.getAttribute('aria-label') || '',
            dataTestId: el.getAttribute('data-testid') || '',
            type: el.getAttribute('type') || '',
            placeholder: el.getAttribute('placeholder') || '',
            role: el.getAttribute('role') || '',
          });
        });
      });

      return elements;
    });

    console.log(`\n Found ${candidates.length} candidate elements on page`);
    console.log('Candidates:');
    candidates.forEach((c, i) => {
      console.log(`  [${i + 1}] <${c.tag}> id="${c.id}" placeholder="${c.placeholder}" text="${c.text}"`);
    });

    return {
      failedSelector,
      candidates,
      pageUrl,
    };
  } finally {
    await browser.close();
  }
}