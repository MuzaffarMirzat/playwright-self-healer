# Playwright Self-Healer

An AI agent that automatically detects broken Playwright selectors and opens a GitHub PR with the fix — no human intervention required.

## How it works

When a Playwright test fails due to a UI change, the agent:

1. Crawls the live page and extracts all interactive elements
2. Sends the failed selector + candidates to Claude AI for reasoning
3. Gets back a suggested fix with a confidence score
4. Opens a GitHub PR with the patched test file and detailed explanation

## Demo

> Tests fail because a developer renamed UI elements.
> The agent detects the broken selectors, reasons about the fix, and opens a PR automatically.

![Demo](docs/demo.gif)

## Tech stack

- [Playwright](https://playwright.dev/) — browser automation and test runner
- [Claude AI](https://anthropic.com) — LLM reasoning for locator matching
- [Octokit](https://github.com/octokit/rest.js) — GitHub API for PR automation
- [TypeScript](https://www.typescriptlang.org/) — type-safe implementation
- [GitHub Actions](https://github.com/features/actions) — CI/CD trigger

## Project structure
```
src/
├── crawler/        # DOM snapshot and candidate extraction
├── llm/            # Claude AI reasoning layer
├── github/         # PR automation via GitHub API
└── agent/          # Orchestrator that ties it all together
tests/
└── demo.spec.ts    # Sample Playwright test
demo-app/
└── index.html      # Simple app used for demonstration
.github/
└── workflows/      # GitHub Actions CI/CD pipeline
```

## Getting started

### Prerequisites

- Node.js 18+
- Anthropic API key
- GitHub Personal Access Token with `repo` and `workflow` scopes

### Installation
```bash
git clone https://github.com/YOUR_USERNAME/playwright-self-healer.git
cd playwright-self-healer
npm install
npx playwright install chromium
```

### Configuration

Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```
```bash
ANTHROPIC_API_KEY=your_key_here
GITHUB_TOKEN=your_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=playwright-self-healer
```

### Run the demo

**Step 1 — Run the tests (they pass):**
```bash
npx playwright test
```

**Step 2 — Simulate a UI change by editing `demo-app/index.html`:**

Change these IDs to break the tests:
- `username-input` → `username-field`
- `login-btn` → `submit-btn`
- `welcome-msg` → `success-banner`

**Step 3 — Run the agent manually:**
```bash
npx ts-node src/agent/index.ts
```

**Step 4 — Check your GitHub repo for the auto-generated PR**

### Automated via CI

Push any change to a branch — if tests fail, the agent triggers automatically via GitHub Actions and opens a fix PR.

## Confidence scoring

The agent uses Claude to assign a confidence score to every fix:

| Score | Action |
|-------|--------|
| 90–100% | High confidence — PR opened with strong reasoning |
| 60–89% | Medium confidence — PR opened with caveats |
| Below 60% | Low confidence — flagged for human review, no PR opened |

## What it can fix

- Renamed CSS selectors and IDs
- Changed button or link text
- Moved elements in the DOM
- Updated `aria-label` or `data-testid` attributes
- Timeout failures on slow-loading elements

## What requires human review

- Actual product bugs (API failures, logic errors)
- Full page redesigns with no matching elements
- Low confidence matches with multiple ambiguous candidates

## Author
Muzaffar