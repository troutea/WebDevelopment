import { test, expect } from '@playwright/test';

const URL = 'http://127.0.0.1:5500/100Projects/Quiz_Game/index.html';

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
});


//anonymos function
test("Manual Created Playwright test first page", async ({browser,page})=>
{

// const context = await browser.newContext();
// const page = await context.newPage();
await page.goto('http://127.0.0.1:5500/100Projects/Quiz_Game/index.html');
await page.title('Quiz Game');
expect(page).toHaveTitle("Quiz Game")
console.log(await page.title());
await page.pause();
//await page.locator('#start-btn').click();
await expect(page.locator('#start-btn')).toContainText('Start Quiz');
await expect(page.locator('#current-question')).toHaveText('1');
const current = await page.locator('#current-question').textContent();
console.log(current);
await expect(page.locator('#current-question')).toHaveText('1');
await expect(page.locator('#total-questions')).toHaveText('5');
//await expect(answers(page)).toHaveText(['London', 'Berlin', 'Paris', 'Madrid']);
//await page.pause();
});

test.only('Start Quiz shows question 1 with the right initial state', async ({browser, page }) => {
    await page.locator('#start-btn').click();
    await page.pause();
    
    await expect (page.locator('button:has-text("Madrid")'));
    await expect (page.locator('button:has-text("Paris")'));
    await expect (page.locator('button:has-text("Berlin")'));
    await expect (page.locator('button:has-text("London")'));
    
    //this is where i left off just checking the Madrid text

    });
