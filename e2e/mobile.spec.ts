import { expect, test, Page } from "@playwright/test";
import { loginAs } from "./helpers";

const noHorizontalScroll = async (page: Page) => {
  const { scrollW, clientW } = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  expect(scrollW).toBeLessThanOrEqual(clientW);
};

test.describe("phone layout", () => {
  test("home, login and the citizen dashboard fit the screen", async ({ page }) => {
    await page.goto("/");
    await noHorizontalScroll(page);
    await page.goto("/login");
    await noHorizontalScroll(page);
    await loginAs(page, "citizen");
    await expect(page.getByText(/Complaint ref:/).first()).toBeVisible();
    await noHorizontalScroll(page);
    await page.getByRole("button", { name: "View details" }).first().click();
    await expect(page.getByRole("heading", { name: "Timeline" })).toBeVisible();
    await noHorizontalScroll(page);
  });

  test("the filing form fits the screen", async ({ page }) => {
    await loginAs(page, "citizen");
    await page.goto("/file-complaint");
    await expect(page.getByLabel("Date of incident")).toBeVisible();
    await noHorizontalScroll(page);
  });
});
