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

test('Start Quiz shows question 1 with the right initial state', async ({browser, page }) => {
    await page.locator('#start-btn').click();
    await page.pause();
    
    await expect (page.locator('button:has-text("Madrid")'));
    await expect (page.locator('button:has-text("Paris")'));
    await expect (page.locator('button:has-text("Berlin")'));
    await expect (page.locator('button:has-text("London")'));
    await expect (page.locator(':text-is("1")'));
    await expect (page.locator('p:has-text("Question 1 of 5")')); 
    await expect (page.locator('p:has-text("Score: 0")')); 
    
    //this is where i left off just checking the Madrid text

    });


    test.only('Select the first question test with negative tests', async ({browser, page }) => {
    await page.locator('#start-btn').click();
    await page.getByRole('button', { name: 'Madrid' }).click();
    await page.pause();
    //expect (page.locator('p:has-text("Question 3 of 5")')).toBeVisible; 
    //await expect(page.locator('p')).toHaveText('Question 2 of 5');
    await page.pause();

    
     await expect (page.locator('button:has-text("Venus")')).toContainText("Venus");
     await expect (page.locator('button:has-text("Mars")')).toContainText("Mars");
     await expect (page.locator('button:has-text("Jupiter")')).toContainText("Jupiter");
     await expect (page.locator('button:has-text("Saturn")')).toContainText("Saturn");
     await expect (page.locator(':text-is("2")')).toContainText('2');
     await expect (page.locator('p:has-text("Question 2 of 5")')).toContainText("Question 2 of 5"); 
     await expect (page.locator('p:has-text("Score: 0")')).toContainText("Score: 0"); 

     await page.getByRole('button', { name: 'Mars' }).click();
     await expect (page.locator('p:has-text("Question 3 of 5")')).toContainText("Question 3 of 5"); 
     await expect (page.locator('p:has-text("Score: 1")')).toContainText("Score: 1");
     
     await page.getByRole('button', { name: 'Indian Ocean' }).click();
     await expect (page.locator('p:has-text("Question 4 of 5")')).toContainText("Question 4 of 5"); 
     await expect (page.locator('p:has-text("Score: 1")')).toContainText("Score: 1");

     //getByRole('button', { name: 'JavaScript' })

    
    //this is where i left off just checking the Madrid text

    });

