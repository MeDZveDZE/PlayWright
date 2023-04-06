// @ts-check
const { test, expect } = require("@playwright/test");

test("1 locator fill + type + click", async ({ page }) => {
  await page.goto("https://demoqa.com/text-box");
  await page.getByPlaceholder("Full Name").fill("Vadim Khorava");
  await page.locator("#userEmail").type("vadim@test.com");
  await page.locator("#submit").click();
  await expect(page.locator("#output #name")).toHaveText("Name:Vadim Khorava");
  await expect(page.locator("#output #email")).toHaveText(
    "Email:vadim@test.com"
  );
});

test("2.1 radiobutton check", async ({ page }) => {
  await page.goto("https://demoqa.com/radio-button");
  await page.locator('.custom-control-label:has-text("Yes")').check();
  await expect(page.locator(".text-success")).toHaveText("Yes");
  await expect(
    page.locator('.custom-control-label:has-text("Yes")')
  ).toBeChecked();
});

test("2.2 checkboxes check", async ({ page }) => {
  await page.goto("https://demoqa.com/automation-practice-form");
  await page.locator('label[for="hobbies-checkbox-2"]').check();
  await expect(page.locator('label[for="hobbies-checkbox-2"]')).toBeChecked();
});

test("3 select from dropdown", async ({ page }) => {
  await page.goto("https://demoqa.com/select-menu");
  const colorDropDown = page.locator("#oldSelectMenu");
  await colorDropDown.selectOption("White");
  await expect(colorDropDown).toHaveValue("6");
  //было бы хорошо объяснить на созвоне, как достать именно значение White для проверки. Все индусы мира не помогли)
});

test("4 clicks", async ({ page }) => {
  await page.goto("https://demoqa.com/buttons");
  await page.locator("#doubleClickBtn").dblclick();
  await expect(page.locator("#doubleClickMessage")).toBeVisible();
  await expect(page.locator("#doubleClickMessage")).toHaveText(
    "You have done a double click"
  );
  await page.locator("#rightClickBtn").click({ button: "right" });
  await expect(page.locator("#rightClickMessage")).toBeVisible();
  await expect(page.locator("#rightClickMessage")).toHaveText(
    "You have done a right click"
  );
  await page.getByRole("button").nth(-1).click();
  //можно ли выбрать локатор используя отрицание? вроде NOT #doubleClickMessage
  //and NOT #rightClickMessage?
  await expect(page.locator("#dynamicClickMessage")).toBeVisible();
  await expect(page.locator("#dynamicClickMessage")).toHaveText(
    "You have done a dynamic click"
  );
});

test("5 hover", async ({ page }) => {
  await page.goto("https://demoqa.com/tool-tips");
  await page.locator("#toolTipButton").hover();
  await expect(page.locator("#buttonToolTip")).toBeVisible();
  await expect(page.locator("#buttonToolTip")).toHaveText(
    "You hovered over the Button"
  );
});

test("6 set input files", async ({ page }) => {
  await page.goto("https://demoqa.com/upload-download");
  await page.locator("#uploadFile").setInputFiles("tests/testfile.txt");
  await expect(page.locator("#uploadedFilePath")).toBeVisible();
  await expect(page.locator("#uploadedFilePath")).toContainText("testfile.txt");
});

test("7 keys press", async ({ page }) => {
  await page.goto("https://demoqa.com/text-box");
  await page
    .getByPlaceholder("Current Address")
    .type("211400 Polotsk, Streletskaya 5");
  await page.keyboard.down("Control");
  await page.keyboard.press("a");
  await page.keyboard.press("c");
  await page.keyboard.up("Control");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Control+v");
  await page.locator("#submit").click();
  await expect(page.locator("#output")).toBeVisible();
  await expect(page.locator("#output #currentAddress")).toHaveText(
    "Current Address :211400 Polotsk, Streletskaya 5"
  );
  await expect(page.locator("#output #permanentAddress")).toHaveText(
    "Permananet Address :211400 Polotsk, Streletskaya 5"
  );
});

test("8 drag N drop", async ({ page }) => {
  await page.goto("https://demoqa.com/droppable");
  await page
    .locator("#draggable")
    .dragTo(page.locator("#simpleDropContainer #droppable"));
  await expect(page.locator("#simpleDropContainer #droppable")).toHaveText(
    "Dropped!"
  );
});
