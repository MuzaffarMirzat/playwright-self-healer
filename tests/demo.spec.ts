import { test, expect } from '@playwright/test';
import path from 'path';

const PAGE_URL = `file://${path.resolve(__dirname, '../demo-app/index.html')}`;

test('user can log in successfully', async ({ page }) => {
  await page.goto(PAGE_URL);

  await page.locator('#username-input').fill('testuser');
  await page.locator('#password-input').fill('secret123');
  await page.locator('#login-btn').click();

  await expect(page.locator('#success-banner')).toBeVisible();
});