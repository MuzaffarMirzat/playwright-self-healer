import { crawlForCandidates } from '../crawler/domCrawler';
import { reasonAboutLocator } from './locatorReasoner';
import path from 'path';

const PAGE_URL = `file://${path.resolve(__dirname, '../../demo-app/index.html')}`;
const FAILED_SELECTOR = '#username-input';

async function main() {
  console.log('Step 1: Crawling page for candidates...');
  const crawlResult = await crawlForCandidates(PAGE_URL, FAILED_SELECTOR);

  console.log('\nStep 2: Asking Claude to reason about the fix...');
  const result = await reasonAboutLocator(crawlResult);

  console.log('\n Final reasoning result:');
  console.log(`  Original selector : ${result.originalSelector}`);
  console.log(`  Suggested fix     : ${result.suggestedSelector}`);
  console.log(`  Confidence        : ${result.confidence}%`);
  console.log(`  Reasoning         : ${result.reasoning}`);
  console.log(`  Fallbacks         : ${result.fallbackSelectors.join(', ')}`);
}

main().catch(console.error);