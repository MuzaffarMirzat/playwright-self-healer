import { crawlForCandidates } from '../crawler/domCrawler';
import { reasonAboutLocator } from '../llm/locatorReasoner';
import { openFixPR } from './prAutomation';
import path from 'path';

const PAGE_URL = `file://${path.resolve(__dirname, '../../demo-app/index.html')}`;
const FAILED_SELECTOR = '#username-input';
const TEST_FILE_PATH = 'tests/demo.spec.ts';

async function main() {
  console.log('Step 1: Crawling page...');
  const crawlResult = await crawlForCandidates(PAGE_URL, FAILED_SELECTOR);

  console.log('\nStep 2: Reasoning with Claude...');
  const reasoningResult = await reasonAboutLocator(crawlResult);

  console.log('\nStep 3: Opening GitHub PR...');
  const prResult = await openFixPR(TEST_FILE_PATH, reasoningResult);

  console.log('\n Done! Full pipeline complete.');
  console.log(` PR URL: ${prResult.prUrl}`);
}

main().catch(console.error);