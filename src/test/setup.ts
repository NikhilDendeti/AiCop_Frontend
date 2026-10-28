import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "@/mocks/server";
import { tokenStore } from "@/auth/tokenStore";
import i18n from "@/i18n";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(async () => {
  await i18n.changeLanguage("en");
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
  tokenStore.clear();
});
afterAll(() => server.close());
