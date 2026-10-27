// tests/quiz.spec.js
const { test, expect } = require('@playwright/test');

const URL = 'http://127.0.0.1:5500/100Projects/Quiz_Game/index.html';


const QUESTIONS = [
  { q: 'What is the capital of France?',                  correct: 'Paris',         wrong: 'London' },
  { q: 'Which planet is known as the Red Planet?',        correct: 'Mars',          wrong: 'Venus' },
  { q: 'What is the largest ocean on Earth?',             correct: 'Pacific Ocean', wrong: 'Atlantic Ocean' },
  { q: 'Which of these is NOT a programming language?',   correct: 'Banana',        wrong: 'Java' },
  { q: 'What is the chemical symbol for gold?',           correct: 'Au',            wrong: 'Go' },
];

const btn = (page, name) => page.getByRole('button', { name, exact: true });
const answers = (page) => page.locator('#answers-container .answer-btn');

// Answers all 5 questions, getting the first `numCorrect` right
async function playQuiz(page, numCorrect) {
  await page.locator('#start-btn').click();
  for (let i = 0; i < QUESTIONS.length; i++) {
    const { q, correct, wrong } = QUESTIONS[i];
    await expect(page.locator('#question-text')).toHaveText(q);
    await btn(page, i < numCorrect ? correct : wrong).click();
  }
  await expect(page.locator('#result-screen')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
});

test.describe('Start screen', () => {
  test('only the start screen is visible on load', async ({ page }) => {
    await expect(page.locator('#start-screen')).toBeVisible();
    await expect(page.locator('#start-screen h1')).toHaveText('QuizTime!');
    await expect(page.locator('#quiz-screen')).toBeHidden();
    await expect(page.locator('#result-screen')).toBeHidden();
  });

  test('Start Quiz shows question 1 with the right initial state', async ({ page }) => {
    await page.locator('#start-btn').click();
    await expect(page.locator('#start-screen')).toBeHidden();
    await expect(page.locator('#quiz-screen')).toBeVisible();
    await expect(page.locator('#question-text')).toHaveText(QUESTIONS[0].q);
    await expect(page.locator('#current-question')).toHaveText('1');
    await expect(page.locator('#total-questions')).toHaveText('5');
    await expect(page.locator('#score')).toHaveText('0');
    await expect(answers(page)).toHaveText(['London', 'Berlin', 'Paris', 'Madrid']);
    await expect(page.locator('#progress')).toHaveAttribute('style', /width:\s*0%/);
  });
});

test.describe('Answering', () => {
  test.beforeEach(async ({ page }) => {
    await page.locator('#start-btn').click();
  });

  test('correct answer: highlighted green and score increments', async ({ page }) => {
    await btn(page, 'Paris').click();
    await expect(btn(page, 'Paris')).toHaveClass(/correct/);
    await expect(answers(page).locator('.incorrect')).toHaveCount(0);
    await expect(page.locator('#score')).toHaveText('1');
  });

  test('wrong answer: marks it incorrect, reveals the correct one, score unchanged', async ({ page }) => {
    await btn(page, 'London').click();
    await expect(btn(page, 'London')).toHaveClass(/incorrect/);
    await expect(btn(page, 'Paris')).toHaveClass(/correct/);
    await expect(page.locator('#score')).toHaveText('0');
  });

  test('answers are locked after the first click', async ({ page }) => {
    await btn(page, 'London').click();
    await btn(page, 'Paris').click(); // should be ignored
    await expect(page.locator('#score')).toHaveText('0');
    await expect(btn(page, 'Paris')).not.toHaveClass(/incorrect/);
  });

  test('double-clicking the correct answer scores only once', async ({ page }) => {
    await btn(page, 'Paris').dblclick();
    await expect(page.locator('#score')).toHaveText('1');
  });

  test('auto-advances to question 2 and updates counter and progress', async ({ page }) => {
    await btn(page, 'Paris').click();
    // advances after a 1s timeout; expect() retries until then
    await expect(page.locator('#question-text')).toHaveText(QUESTIONS[1].q);
    await expect(page.locator('#current-question')).toHaveText('2');
    await expect(page.locator('#progress')).toHaveAttribute('style', /width:\s*20%/);
    await expect(answers(page)).toHaveText(['Venus', 'Mars', 'Jupiter', 'Saturn']);
  });

  test('progress bar steps 0/20/40/60/80% through the quiz', async ({ page }) => {
    const expected = [0, 20, 40, 60, 80];
    for (let i = 0; i < 5; i++) {
      await expect(page.locator('#current-question')).toHaveText(String(i + 1));
      await expect(page.locator('#progress')).toHaveAttribute('style', new RegExp(`width:\\s*${expected[i]}%`));
      await btn(page, QUESTIONS[i].correct).click();
    }
  });
});

test.describe('Results', () => {
  const cases = [
    { correct: 5, message: 'Perfect! You are a genius!' },
    { correct: 4, message: 'Great job! You know your stuff!' },
    { correct: 3, message: 'Good effort! Keep learning!' },
    { correct: 2, message: 'Not bad! Try again to improve!' },
    { correct: 1, message: "Keep studying! You'll get better!" },
    { correct: 0, message: "Keep studying! You'll get better!" },
  ];

  for (const { correct, message } of cases) {
    test(`${correct}/5 correct shows the right score and message`, async ({ page }) => {
      await playQuiz(page, correct);
      await expect(page.locator('#quiz-screen')).toBeHidden();
      await expect(page.locator('#final-score')).toHaveText(String(correct));
      await expect(page.locator('#max-score')).toHaveText('5');
      await expect(page.locator('#result-message')).toHaveText(message);
    });
  }

  // Fails until the missing space before "out of" is fixed in index.html
  test('result sentence reads "You scored 3 out of 5"', async ({ page }) => {
    await playQuiz(page, 3);
    await expect(page.locator('.result-info p')).toHaveText('You scored 3 out of 5');
  });
});

test.describe('Restart', () => {
  test('Restart Quiz goes straight to question 1 with everything reset', async ({ page }) => {
    await playQuiz(page, 5);
    await page.locator('#restart-btn').click();
    await expect(page.locator('#result-screen')).toBeHidden();
    await expect(page.locator('#quiz-screen')).toBeVisible();
    await expect(page.locator('#question-text')).toHaveText(QUESTIONS[0].q);
    await expect(page.locator('#current-question')).toHaveText('1');
    await expect(page.locator('#score')).toHaveText('0');
    await expect(page.locator('#progress')).toHaveAttribute('style', /width:\s*0%/);
    await expect(answers(page).locator('.correct, .incorrect')).toHaveCount(0);
  });

  test('a second run can be completed after restarting', async ({ page }) => {
    await playQuiz(page, 0);
    await page.locator('#restart-btn').click();
    for (const { correct } of QUESTIONS) {
      await btn(page, correct).click();
    }
    await expect(page.locator('#final-score')).toHaveText('5');
  });
});

test.describe('Responsive', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('quiz fits a phone screen without horizontal scroll', async ({ page }) => {
    await page.locator('#start-btn').click();
    await expect(answers(page)).toHaveCount(4);
    const fits = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    expect(fits).toBe(true);
  });
});