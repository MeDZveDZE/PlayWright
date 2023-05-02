// @ts-check
const { test, expect } = require("@playwright/test");

import * as loginData from "../files/user2.json";

//авторизация из файла
test.beforeEach(async ({ page }) => {
  await page.goto("https://demoqa.com/login");
  await expect(page.locator(".main-header")).toHaveText("Login");
  await page.getByPlaceholder("UserName").fill(loginData.userName);
  await page.getByPlaceholder("Password").fill(loginData.password);
  await page.locator("#login").click();
  await expect(page.locator(".main-header")).toHaveText("Profile");
});

test("main", async ({ page, request }) => {
  const cookiesData = await page.context().cookies();
  //по какой-то причине подчёркивает всё красным (c и без await, без разницы). только ts ingore помогает, и тест работает норм
  // @ts-ignore
  expect(cookiesData.find((c) => c.name === "userID").value).toBeTruthy();
  // @ts-ignore
  expect(cookiesData.find((c) => c.name === "userName").value).toBeTruthy();
  // @ts-ignore
  expect(cookiesData.find((c) => c.name === "expires").value).toBeTruthy();
  // @ts-ignore
  expect(cookiesData.find((c) => c.name === "token").value).toBeTruthy();
  // @ts-ignore
  const userID = cookiesData.find((c) => c.name === "userID").value; //сохранённые userID и token
  // @ts-ignore
  const token = cookiesData.find((c) => c.name === "token").value;

  //заблокировать все картинки
  await page.route("**/*", (route) => {
    return route.request().resourceType() === "image"
      ? route.abort()
      : route.continue();
  });
  const responsePromise = page.waitForResponse(
    "https://demoqa.com/BookStore/v1/Books"
  );
  await page.locator('.text:text-is("Book Store")').click();
  //сделать скриншот
  await page.waitForSelector(".action-buttons");
  await page.screenshot({ path: "files/screenshot.png" });
  const response = await responsePromise;
  await expect(response.status()).toBe(200);
  const responseBody = await response.json();
  //check if books in response body = books in UI (.action-buttons locator)
  await expect(page.locator(".action-buttons")).toHaveCount(
    responseBody.books.length
  );
  //заменить количество страниц на рандомное число от 1 до 1000
  const randomPages = Math.round(Math.random() * 999 + 1).toString();
  await page.route(
    "https://demoqa.com/BookStore/v1/Book?ISBN=*",
    async (route) => {
      const response = await route.fetch();
      let body = await response.text();
      const searchBody = JSON.parse(body);

      body = body.replace(searchBody.pages, randomPages);
      route.fulfill({
        response,
        body,
        headers: {
          ...response.headers(),
        },
      });
    }
  );
  await page.pause();
  //кликнуть на рандомную книгу в списке
  await page
    .locator(".action-buttons")
    .nth(Math.floor(Math.random() * (responseBody.books.length - 1)))
    .click();
  //проверить, что количество страниц заменилось на рандомное число от 1 до 1000
  await expect(page.locator("#pages-wrapper #userName-value")).toHaveText(
    randomPages
  );

  //API test
  const responseAPI = await request.get(
    `https://demoqa.com/Account/v1/User/${userID}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
  const responseApiJson = await responseAPI.json();
  expect(responseAPI.status()).toBe(200);
  expect(responseApiJson.books.length).toBe(0);
  expect(responseApiJson.books).toStrictEqual([]); //такой вариант норм? с toBe([]) выдаёт ошибку. на всякий случай вверху проверка с длинной)
  expect(responseApiJson.username).toBe(loginData.userName);
});
