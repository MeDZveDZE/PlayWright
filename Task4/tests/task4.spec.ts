import { test, expect } from '@playwright/test'

import * as loginData from '../files/user2.json'

let userID
let token
let responsePromise
let responseBody
let randomPages

test('Task4', async ({ page, request }) => {
  await test.step('Log in', async () => {
    await page.goto('https://demoqa.com/login')
    await expect(page.locator('.main-header')).toHaveText('Login')
    await page.getByPlaceholder('UserName').fill(loginData.userName)
    await page.getByPlaceholder('Password').fill(loginData.password)
    await page.locator('#login').click()
    await expect(page.locator('.main-header')).toHaveText('Profile')
  })

  await test.step('Save cookies and UserID', async () => {
    const cookiesData = await page.context().cookies()
    // @ts-ignore
    expect(cookiesData.find((c) => c.name === 'userID').value).toBeTruthy()
    // @ts-ignore
    expect(cookiesData.find((c) => c.name === 'userName').value).toBeTruthy()
    // @ts-ignore
    expect(cookiesData.find((c) => c.name === 'expires').value).toBeTruthy()
    // @ts-ignore
    expect(cookiesData.find((c) => c.name === 'token').value).toBeTruthy()
    // @ts-ignore
    userID = cookiesData.find((c) => c.name === 'userID').value
    // @ts-ignore
    token = cookiesData.find((c) => c.name === 'token').value
  })

  await test.step('Block pages', async () => {
    await page.route('**/*', (route) =>
      route.request().resourceType() === 'image'
        ? route.abort()
        : route.continue()
    )
    responsePromise = page.waitForResponse(
      'https://demoqa.com/BookStore/v1/Books'
    )
  })

  await test.step('Take a screenshot', async () => {
    await page.locator('.text:text-is("Book Store")').click()
    await page.waitForSelector('.action-buttons')
    await page.screenshot({ path: 'files/screenshot.png' })
  })

  await test.step('Books number in response and UI', async () => {
    const response = await responsePromise
    await expect(response.status()).toBe(200)
    responseBody = await response.json()
    // check if books in response body === books in UI (.action-buttons locator)
    await expect(page.locator('.action-buttons')).toHaveCount(
      responseBody.books.length
    )
  })

  await test.step('Replace pages number to random from 1 to 1000', async () => {
    randomPages = Math.round(Math.random() * 999 + 1).toString()
    await page.route(
      'https://demoqa.com/BookStore/v1/Book?ISBN=*',
      async (route) => {
        const response = await route.fetch()
        let body = await response.text()
        const searchBody = JSON.parse(body)

        body = body.replace(searchBody.pages, randomPages)
        route.fulfill({
          response,
          body,
          headers: {
            ...response.headers(),
          },
        })
      }
    )
  })

  await test.step('Click on a random book from the list', async () => {
    await page
      .locator('.action-buttons')
      .nth(Math.floor(Math.random() * (responseBody.books.length - 1)))
      .click()
  })

  await test.step("Check that page's number replaced with random from 1 to 1000", async () => {
    await expect(page.locator('#pages-wrapper #userName-value')).toHaveText(
      randomPages
    )
  })

  await test.step('API test', async () => {
    const responseAPI = await request.get(
      `https://demoqa.com/Account/v1/User/${userID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    const responseApiJson = await responseAPI.json()
    expect(responseAPI.status()).toBe(200)
    expect(responseApiJson.books.length).toBe(0)
    expect(responseApiJson.books).toStrictEqual([])
    expect(responseApiJson.username).toBe(loginData.userName)
  })
})
