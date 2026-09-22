const { test, expect } = require("@playwright/test");
//import { test, expect } from '@playwright/test';
//const {expect} = require('../playwright.config');

test("QuizGameTest_001", async ({ page }) => {
  //   chrome - plugins/ cookies
  // const context =  await browser.newContext();
  // const page = await context.newPage();
  await page.goto("https://google.com");
  console.log(await page.title());
  await expect(page).toHaveTitle("Google");
});

test("QuizGameTest_002", async ({ page }) => {
  await page.goto("http://127.0.0.1:5500/100Projects/Quiz_Game/index.html");
  // get title
  console.log(await page.title());
  await expect(page).toHaveTitle("Quiz Game");
});
