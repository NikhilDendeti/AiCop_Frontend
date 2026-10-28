import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/auth/AuthContext";
import { LoginFlow } from "@/components/auth/LoginFlow";
import i18n from "@/i18n";
import en from "./locales/en";
import hi from "./locales/hi";
import te from "./locales/te";

const keys = (o: object, p = ""): string[] =>
  Object.entries(o).flatMap(([k, v]) => (typeof v === "string" ? [p + k] : keys(v, `${p}${k}.`)));

describe("i18n", () => {
  it("has the same keys in English, Hindi and Telugu", () => {
    expect(keys(hi).sort()).toEqual(keys(en).sort());
    expect(keys(te).sort()).toEqual(keys(en).sort());
  });

  it("keeps every interpolation placeholder in the translations", () => {
    const ph = (s: string) => (s.match(/{{\w+}}/g) ?? []).sort().join(",");
    const flat = (o: object, p = ""): Record<string, string> =>
      Object.fromEntries(Object.entries(o).flatMap(([k, v]) => (typeof v === "string" ? [[p + k, v]] : Object.entries(flat(v, `${p}${k}.`)))));
    const e = flat(en), h = flat(hi), t = flat(te);
    for (const k of Object.keys(e)) {
      expect(ph(h[k]), `hi ${k}`).toBe(ph(e[k]));
      expect(ph(t[k]), `te ${k}`).toBe(ph(e[k]));
    }
  });

  it("switches the login screen language and sets the page language", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <AuthProvider>
            <LoginFlow />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    const user = userEvent.setup();
    expect(await screen.findByRole("button", { name: "Send code" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "हिंदी" }));
    expect(await screen.findByRole("button", { name: "कोड भेजें" })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("hi");
    await user.click(screen.getByRole("button", { name: "తెలుగు" }));
    expect(await screen.findByRole("button", { name: "కోడ్ పంపండి" })).toBeInTheDocument();
    expect(i18n.language).toBe("te");
  });
});
