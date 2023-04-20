// @ts-check
const { test, expect } = require('@playwright/test');

import * as loginData from '../files/user2.json';

test.beforeEach(async ({ page }) => {
  await page.goto('https://demoqa.com/login');
  await expect(page.locator('.main-header')).toHaveText('Login');
  await page.getByPlaceholder('UserName').fill(loginData.username);
  await page.getByPlaceholder('Password').fill(loginData.password);
  await page.locator('#login').click();
  await expect(page.locator('.main-header')).toHaveText('Profile');
});

test('cookies', async ({ page }) => {
  const cookiesData = await page.context().cookies();
  // @ts-ignore
  expect(cookiesData.find(c => c.name == 'userID').value).toBeTruthy();
  // @ts-ignore
  expect(cookiesData.find(c => c.name == 'userName').value).toBeTruthy();
  // @ts-ignore
  expect(cookiesData.find(c => c.name == 'expires').value).toBeTruthy();
  // @ts-ignore
  expect(cookiesData.find(c => c.name == 'token').value).toBeTruthy();
  // @ts-ignore
  const userID = cookiesData.find(c => c.name == 'userID').value;
  // @ts-ignore
  const token = cookiesData.find(c => c.name == 'token').value;
});

test ('blockImages', async ({ page }) => {
  // await page.pause();
  await page.route('**/*', (route) => {
        return route.request().resourceType() === 'image'
            ? route.abort()
            : route.continue()
})
const responsePromise = page.waitForResponse('https://demoqa.com/BookStore/v1/Books');
await page.locator('.text:text-is("Book Store")').click();
const response = await responsePromise;
await page.screenshot({path: 'files/screenshot.png'});

await expect(page.locator('.action-buttons')).toHaveCount(8);
console.log(response);
});
