import { expect, test } from "@playwright/test";
import { USERS, login, loginAs, signOut } from "./helpers";

test.describe("authentication", () => {
  test("a citizen signs in, survives a reload, and signs out", async ({ page }) => {
    await loginAs(page, "citizen");
    await expect(page.getByRole("heading", { name: "Welcome back!" })).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(USERS.citizen.home);
    await expect(page.getByRole("heading", { name: "Welcome back!" })).toBeVisible();

    await signOut(page);
    expect(await page.evaluate(() => sessionStorage.getItem("smartcop.refresh"))).toBeNull();
    await page.goto("/citizen-dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("a wrong code shows a clear message and keeps the user on login", async ({ page }) => {
    await login(page, "citizen", "000000");
    await expect(page.getByRole("alert")).toContainText(/incorrect or has expired/i);
    await expect(page).toHaveURL(/\/login/);
  });

  test("the resend button is disabled during the cooldown", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Mobile Number").fill(USERS.citizen.phone);
    await page.getByRole("button", { name: "Send code" }).click();
    await expect(page.getByRole("button", { name: /resend code in \d+s/i })).toBeDisabled();
  });

  test("a pasted six digit code fills every box", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Mobile Number").fill(USERS.citizen.phone);
    await page.getByRole("button", { name: "Send code" }).click();
    const first = page.getByRole("textbox", { name: "Digit 1" });
    await first.click();
    await page.keyboard.insertText("123456");
    await expect(page.getByRole("textbox", { name: "Digit 6" })).toHaveValue("6");
  });

  test("each role lands on its own app, decided by the server", async ({ page }) => {
    for (const who of ["subInspector", "magistrate", "admin"] as const) {
      await loginAs(page, who);
      await signOut(page);
    }
  });

  test("a role cannot open another role's screens", async ({ page }) => {
    await loginAs(page, "citizen");
    await page.goto("/officer-dashboard");
    await expect(page).toHaveURL(USERS.citizen.home);
    await page.goto("/admin");
    await expect(page).toHaveURL(USERS.citizen.home);
    await signOut(page);

    await loginAs(page, "subInspector");
    await page.goto("/citizen-dashboard");
    await expect(page).toHaveURL(USERS.subInspector.home);
  });

  test("anonymous visitors are sent to login from every guarded route", async ({ page }) => {
    for (const path of ["/citizen-dashboard", "/file-complaint", "/officer-dashboard", "/magistrate", "/admin", "/privacy-settings"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test("the language choice switches the screen and is remembered", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "हिंदी" }).click();
    await expect(page.getByRole("button", { name: "कोड भेजें" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "hi");
    await page.reload();
    await expect(page.getByRole("button", { name: "कोड भेजें" })).toBeVisible();
  });
});
