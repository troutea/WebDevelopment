import { test, expect } from '@playwright/test';

test('test-002', async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/100Projects/Quiz_Game/index.html');
  await expect(page.getByRole('button', { name: 'Start Quiz' })).toBeVisible();
  await page.getByRole('button', { name: 'Start Quiz' }).click();
  await page.getByRole('button', { name: 'London' }).click();
  await page.getByText('Score:').click();
  await page.getByText('Question 2 of').click();
  await page.getByRole('button', { name: 'Saturn' }).click();
  await page.getByText('Question 3 of').click();
  await page.getByText('Score:').click();
  await page.getByRole('button', { name: 'Pacific Ocean' }).click();
  await page.getByText('Score:').click();
  await page.getByText('Question 4 of').click();
  await page.getByRole('button', { name: 'Banana' }).click();
  await page.getByText('Score:').click();
  await page.getByText('Question 5 of').click();
  await page.getByRole('heading', { name: 'What is the chemical symbol' }).click();
  await page.locator('#progress').click();
  await page.getByRole('button', { name: 'Ag' }).click();
  await page.getByText('You scored 2out of').click();
  await page.getByText('Not bad! Try again to improve!').click();
  await page.getByRole('button', { name: 'Restart Quiz' }).click();
  await page.getByText('Question 1 of').click();
  await page.getByText('Score:').click();
});