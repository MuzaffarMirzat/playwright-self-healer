import { crawlForCandidates } from '../crawler/domCrawler';
import { reasonAboutLocator } from '../llm/locatorReasoner';
import { openFixPR } from '../github/prAutomation';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const FAILED_SELECTOR = process.env.FAILED_SELECTOR || '#username-input';
const TEST_FILE_PATH = process.env.TEST_FILE_PATH || 'tests/demo.spec.ts';
const PAGE_URL = process.env.PAGE_URL ||
  `file://${path.resolve(__dirname, '../../demo-app/index.html')}`;

async function main() {
  console.log('Self-Healer Agent starting...');
  console.log(`Failed selector: ${FAILED_SELECTOR}`);
  console.log(`Test file: ${TEST_FILE_PATH}`);
  console.log(`Page URL: ${PAGE_URL}`);

  try {
    console.log('\n[1/3] Crawling page for candidates...');
    const crawlResult = await crawlForCandidates(PAGE_URL, FAILED_SELECTOR);

    console.log('\n[2/3] Reasoning with Claude...');
    const reasoningResult = await reasonAboutLocator(crawlResult);

    console.log('\n[3/3] Opening GitHub PR...');
    const prResult = await openFixPR(TEST_FILE_PATH, reasoningResult);

    console.log('\n Agent completed successfully');
    console.log(` PR: ${prResult.prUrl}`);
    console.log(` Branch: ${prResult.branchName}`);
    console.log(` Confidence: ${reasoningResult.confidence}%`);

  } catch (error) {
    console.error('\n Agent failed:', error);
    console.error('Manual review required');
    process.exit(1);
  }
}

main();