import { expect, Page } from "@playwright/test";

/** Demo accounts from the backend's `seed_demo`; the login code is always 123456 in dev mode. */
export const USERS = {
  citizen: { phone: "9000000001", home: /\/citizen-dashboard/ },
  citizenNoConsent: { phone: "9000000002", home: /\/citizen-dashboard/ },
  headConstable: { phone: "9000000011", home: /\/officer-dashboard/ },
  subInspector: { phone: "9000000012", home: /\/officer-dashboard/ },
  sho: { phone: "9000000013", home: /\/officer-dashboard/ },
  magistrate: { phone: "9000000021", home: /\/magistrate/ },
  admin: { phone: "9000000031", home: /\/admin/ },
} as const;

export const CODE = "123456";

/** Sign in through the real login screen. */
export async function login(page: Page, who: keyof typeof USERS, code = CODE) {
  await page.goto("/login");
  await page.getByLabel("Mobile Number").fill(USERS[who].phone);
  await page.getByRole("button", { name: "Send code" }).click();
  await page.getByRole("textbox", { name: "Digit 1" }).click();
  await page.keyboard.type(code);
  await page.getByRole("button", { name: "Verify code" }).click();
}

export async function loginAs(page: Page, who: keyof typeof USERS) {
  await login(page, who);
  await expect(page).toHaveURL(USERS[who].home);
}

export async function signOut(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login/);
}
