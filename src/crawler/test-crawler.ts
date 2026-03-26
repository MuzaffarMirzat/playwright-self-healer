import { crawlForCandidates } from './domCrawler';
import path from 'path';

const PAGE_URL = `file://${path.resolve(__dirname, '../../demo-app/index.html')}`;
const FAILED_SELECTOR = '#username-input';

async function main() {
  console.log(`Testing crawler against: ${PAGE_URL}`);
  console.log(`Simulating failure for selector: ${FAILED_SELECTOR}\n`);

  const result = await crawlForCandidates(PAGE_URL, FAILED_SELECTOR);

  console.log('\n Crawl complete. Raw result:');
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);