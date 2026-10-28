import { expect, test } from "@playwright/test";
import { loginAs, signOut } from "./helpers";

test.describe("officers", () => {
  test("a sub-inspector sees scoped stats, filters cases and opens one", async ({ page }) => {
    await loginAs(page, "subInspector");
    await expect(page.getByText("Total cases")).toBeVisible();
    await expect(page.getByText("Awaiting AI review").first()).toBeVisible();

    await page.getByRole("combobox", { name: "Filter by status" }).click();
    await page.getByRole("option", { name: "Pending", exact: true }).click();

    await page.getByRole("button", { name: "Open", exact: true }).first().click();
    await expect(page.getByRole("heading", { name: "Actions" })).toBeVisible();
    // assigning only happens through the assign control
    await expect(page.getByRole("button", { name: /move to assigned/i })).toHaveCount(0);
    await expect(page.getByText("Assign to a head constable")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Timeline" })).toBeVisible();
  });

  test("notes and hand-written drafts are saved, and AI drafts are labelled or reported unavailable", async ({ page }) => {
    await loginAs(page, "subInspector");
    await page.getByRole("button", { name: "Open", exact: true }).first().click();

    const note = `[e2e] note ${Date.now()}`;
    await page.getByLabel("New note").fill(note);
    await page.getByRole("button", { name: "Add note" }).click();
    await expect(page.getByText(note)).toBeVisible();

    const draft = `[e2e] draft ${Date.now()}`;
    await page.getByLabel("Draft text").fill(draft);
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByText(draft)).toBeVisible();

    await page.getByRole("button", { name: "Draft with AI" }).click();
    await expect(page.getByText(/AI drafting is unavailable|AI draft added/).first()).toBeVisible();
  });

  test("the AI review queue lists flagged cases", async ({ page }) => {
    await loginAs(page, "subInspector");
    await page.getByRole("tab", { name: /AI review queue/ }).click();
    await expect(page.getByText(/Nothing is waiting for AI review|AI:/).first()).toBeVisible();
  });

  test("a head constable gets no commander-only controls", async ({ page }) => {
    await loginAs(page, "headConstable");
    await page.getByRole("button", { name: "Open", exact: true }).first().click();
    await expect(page.getByRole("heading", { name: "Actions" })).toBeVisible();
    await expect(page.getByText("Assign to a head constable")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Request approval" })).toHaveCount(0);
    await page.getByRole("button", { name: "Back" }).click();
    await signOut(page);
  });

  test("a magistrate sees only the approvals queue", async ({ page }) => {
    await loginAs(page, "magistrate");
    await expect(page.getByRole("heading", { name: "Awaiting your decision" })).toBeVisible();
    await expect(page.getByText(/No cases are waiting for you|Open/).first()).toBeVisible();
    await expect(page.getByRole("tab", { name: /AI review queue/ })).toHaveCount(0);
  });
});

test.describe("admin", () => {
  test("AI settings and usage load; the kill switch asks for confirmation", async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page.getByText(/AI is (on|OFF)/)).toBeVisible();
    await expect(page.getByLabel("Main provider")).toBeVisible();

    await page.getByRole("button", { name: /Turn AI (off|back on)/ }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);

    await page.getByRole("tab", { name: "Usage" }).click();
    await expect(page.getByText("AI calls")).toBeVisible();
    await page.getByRole("button", { name: "30 days" }).click();
    await expect(page.getByText(/Cost, last 30 days/)).toBeVisible();
  });
});
