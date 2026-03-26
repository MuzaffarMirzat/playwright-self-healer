import Anthropic from '@anthropic-ai/sdk';
import { CrawlResult, CandidateElement } from '../crawler/domCrawler';
import * as dotenv from 'dotenv';

dotenv.config();

export interface ReasoningResult {
  originalSelector: string;
  suggestedSelector: string;
  confidence: number;
  reasoning: string;
  fallbackSelectors: string[];
}

function buildPrompt(crawlResult: CrawlResult): string {
  const candidateList = crawlResult.candidates
    .map((c: CandidateElement, i: number) => {
      const attrs = [
        c.id ? `id="${c.id}"` : '',
        c.classes.length ? `class="${c.classes.join(' ')}"` : '',
        c.placeholder ? `placeholder="${c.placeholder}"` : '',
        c.text ? `text="${c.text}"` : '',
        c.ariaLabel ? `aria-label="${c.ariaLabel}"` : '',
        c.dataTestId ? `data-testid="${c.dataTestId}"` : '',
        c.type ? `type="${c.type}"` : '',
        c.role ? `role="${c.role}"` : '',
      ]
        .filter(Boolean)
        .join(' ');

      return `[${i + 1}] <${c.tag}> ${attrs}`;
    })
    .join('\n');

  return `You are an expert QA automation engineer specializing in Playwright test maintenance.

A Playwright test is failing because a UI element can no longer be found.

FAILED SELECTOR: ${crawlResult.failedSelector}

CURRENT ELEMENTS ON PAGE:
${candidateList}

Your job is to identify which element on the page is the most likely replacement for the failed selector.

Rules:
- Prefer matches by semantic meaning (placeholder text, aria-label, role) over structural matches
- If the failed selector was an ID, look for similar IDs or equivalent semantic attributes
- Assign a confidence score from 0 to 100
- If confidence is below 60, do not suggest a fix — flag it for human review instead
- Suggest up to 2 fallback selectors in order of preference

Respond ONLY with a valid JSON object in this exact format, no markdown, no explanation outside the JSON:
{
  "originalSelector": "${crawlResult.failedSelector}",
  "suggestedSelector": "the best CSS selector string",
  "confidence": 85,
  "reasoning": "one or two sentences explaining why this match was chosen",
  "fallbackSelectors": ["second best option", "third best option"]
}`;
}

export async function reasonAboutLocator(
  crawlResult: CrawlResult
): Promise<ReasoningResult> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  console.log('\n Sending candidates to Claude for reasoning...');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: buildPrompt(crawlResult),
      },
    ],
  });

  const rawText = response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text)
    .join('');

  console.log('\n Raw Claude response:');
  console.log(rawText);

  let parsed: ReasoningResult;
  try {
    parsed = JSON.parse(rawText.trim());
  } catch {
    throw new Error(`Claude returned invalid JSON:\n${rawText}`);
  }

  // Safety gate — if confidence too low, throw so agent knows to flag it
  if (parsed.confidence < 60) {
    throw new Error(
      `Low confidence fix (${parsed.confidence}%). Flagging for human review.\nReasoning: ${parsed.reasoning}`
    );
  }

  return parsed;
}