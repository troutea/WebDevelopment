import { test, expect } from '@playwright/test';

test('CodeGenTest', async ({ page }) => {
  await page.locator('body').click();
  await page.goto('http://127.0.0.1:5500/100Projects/Quiz_Game/index.html');
  await page.getByRole('button', { name: 'Start Quiz' }).click();
  await page.getByRole('button', { name: 'Paris' }).click();
  await page.getByRole('button', { name: 'Mars' }).click();
  await page.getByRole('button', { name: 'Pacific Ocean' }).click();
  await page.getByRole('button', { name: 'Banana' }).click();
  await page.getByRole('button', { name: 'Ag' }).click();
});