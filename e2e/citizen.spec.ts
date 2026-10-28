import { expect, test, Page } from "@playwright/test";
import { loginAs, signOut } from "./helpers";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

const BOX = "Type your response here...";

async function answerAll(page: Page, answers: string[]) {
  for (let i = 0; i < answers.length; i++) {
    await page.getByPlaceholder(BOX).fill(answers[i]);
    const last = i === answers.length - 1;
    await page.getByRole("button", { name: last ? "Submit Complaint" : "Next" }).click();
  }
}

test.describe("citizen", () => {
  test("the dashboard shows the citizen's own complaints with real progress", async ({ page }) => {
    await loginAs(page, "citizen");
    await expect(page.getByText(/Complaint ref:/).first()).toBeVisible();
    expect(await page.getByText(/Complaint ref:/).count()).toBeGreaterThanOrEqual(3);
    await expect(page.getByText("Investigation Progress").first()).toBeVisible();
    // the old placeholder text must be gone
    await expect(page.getByText("[Unknown]")).toHaveCount(0);
    await expect(page.getByText("FIR No")).toHaveCount(0);
    await expect(page.getByText("112").first()).toBeVisible();
  });

  test("a complaint opens with its timeline, evidence area and AI-down message", async ({ page }) => {
    await loginAs(page, "citizen");
    await page.getByRole("button", { name: "View details" }).first().click();
    await expect(page).toHaveURL(/\/complaint\//);
    await expect(page.getByRole("heading", { name: "Timeline" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Evidence/ })).toBeVisible();
    await expect(page.getByRole("progressbar", { name: "Progress" })).toBeVisible();

    await page.getByLabel("Your question").fill("what happens next?");
    await page.getByRole("button", { name: "Ask" }).click();
    await expect(page.getByRole("status").filter({ hasText: /not available|AI-generated/i }).first()).toBeVisible();
  });

  test("filing needs the incident details before it submits", async ({ page }) => {
    await loginAs(page, "citizen");
    await page.goto("/file-complaint");
    await page.getByPlaceholder(BOX).fill("e2e: missing date");
    for (let i = 0; i < 4; i++) {
      await page.getByRole("button", { name: "Next" }).click();
      await page.getByPlaceholder(BOX).fill("x");
    }
    await page.getByRole("button", { name: "Submit Complaint" }).click();
    await expect(page.getByText("Details missing", { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/file-complaint/);
  });

  test("filing creates the complaint, then evidence uploads and shows its scan state", async ({ page }) => {
    await loginAs(page, "citizen");
    await page.goto("/file-complaint");
    await page.getByLabel("Date of incident").fill("2026-10-20");
    await page.getByLabel("Time of incident").fill("18:30");
    await expect(page.getByLabel("Police station")).not.toHaveValue("");

    const create = page.waitForRequest((r) => r.url().endsWith("/api/v1/complaints/") && r.method() === "POST");
    await answerAll(page, [
      "[e2e] phone snatched near the bus stop",
      "Central bus stop, last evening",
      "One man, red helmet",
      "Mobile phone",
      "No witnesses",
    ]);
    const req = await create;
    expect(req.headers()["idempotency-key"]).toMatch(/^[0-9a-f-]{36}$/);
    expect(req.postData() ?? "").not.toContain("base64");

    await expect(page).toHaveURL(/\/complaint\/[0-9a-f-]{36}/);
    await expect(page.getByText("[e2e] phone snatched near the bus stop")).toBeVisible();

    await page.getByLabel("Add evidence files").setInputFiles({ name: "e2e-photo.png", mimeType: "image/png", buffer: PNG });
    await expect(page.getByText("e2e-photo.png")).toBeVisible();
    await expect(page.getByText(/Scan pending|Scanned: clean/)).toBeVisible();

    await page.reload();
    await expect(page.getByText("e2e-photo.png")).toBeVisible();
  });

  test("the AI chat explains when consent is missing", async ({ page }) => {
    await loginAs(page, "citizenNoConsent");
    await page.goto("/file-complaint");
    await page.getByRole("button", { name: /chat instead/i }).click();
    await expect(page.getByText("Consent needed", { exact: true })).toBeVisible();
  });

  test("privacy settings list the consents and allow a data download", async ({ page }) => {
    await loginAs(page, "citizen");
    await page.getByRole("button", { name: "Privacy" }).click();
    await expect(page).toHaveURL(/privacy-settings/);
    await expect(page.getByRole("switch").first()).toBeVisible();
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download my data" }).click();
    expect((await download).suggestedFilename()).toBe("my-smartcop-data.json");
    await page.getByRole("button", { name: "Back" }).click();
    await signOut(page);
  });
});
