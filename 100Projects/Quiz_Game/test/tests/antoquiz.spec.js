import { test, expect } from '@playwright/test';

//anonymos function
test("Manual Created Playwright test", async ({browser,page})=>
{

// const context = await browser.newContext();
// const page = await context.newPage();
await page.goto('http://127.0.0.1:5500/100Projects/Quiz_Game/index.html');
await page.title('Quiz Game');
expect(page).toHaveTitle("Quiz Game")
console.log(await page.title());
//await page.pause();
await page.locator('#start-btn').click();
await expect(page.locator('#start-btn')).toContainText('Start Quiz');
await expect(page.locator('#current-question')).toHaveText('1');
const current = await page.locator('#current-question').textContent();
console.log(current);
await page.pause();
});
