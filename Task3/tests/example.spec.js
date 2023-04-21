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
  //по какой-то причине подчёркивает всё красным (c и без await, без разницы). только ts ingore помогает, и тест работает норм
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
await page.screenshot({path: 'files/screenshot.png'});
const response = await responsePromise;
await expect(response.status()).toBe(200);
const responseBody = await response.json();
//check if books in response body = books in UI (.action-buttons locator)
await expect(page.locator('.action-buttons')).toHaveCount(responseBody.books.length);


await page.route('https://demoqa.com/BookStore/v1/Book?ISBN=*', async route => {
  const response = await route.fetch();
  let body = await response.text();
  const searchBody = JSON.parse(body);
  body = body.replace(searchBody.pages, '999');
  route.fulfill({
    response,
    body,
    headers: {
      ...response.headers()
    }
  });
});
await page.pause();
await page.locator('.action-buttons').nth(2).click();


// const responsePromiseBook = page.waitForResponse('https://demoqa.com/BookStore/v1/Book?ISBN=*');
// await page.locator('.action-buttons').nth(2).click();
// const responseBook = await responsePromiseBook;
// const responseBodyBook = await responseBook.text();
// console.log(responseBodyBook);

});

