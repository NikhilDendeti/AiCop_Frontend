import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "msw";
import { server } from "@/mocks/server";
import { apiError, meBody, url } from "@/mocks/handlers";
import { AuthProvider } from "@/auth/AuthContext";
import { RequireRole } from "@/auth/RequireRole";
import { LoginFlow } from "./LoginFlow";
import { HttpResponse } from "msw";

const renderApp = (initial = "/login") =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[initial]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginFlow />} />
            <Route element={<RequireRole roles={["citizen"]} />}>
              <Route path="/citizen-dashboard" element={<div>citizen home</div>} />
            </Route>
            <Route element={<RequireRole roles={["sho"]} />}>
              <Route path="/officer-dashboard" element={<div>officer home</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );

const signIn = async (code: string) => {
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText(/mobile number/i), "9000000001");
  await user.click(screen.getByRole("button", { name: /send code/i }));
  const boxes = await screen.findAllByRole("textbox", { name: /digit/i });
  await user.type(boxes[0], code);
  await user.click(screen.getByRole("button", { name: /verify code/i }));
  return user;
};

describe("login", () => {
  it("signs in with the code and lands on the citizen home", async () => {
    renderApp();
    await signIn("123456");
    expect(await screen.findByText("citizen home")).toBeInTheDocument();
  });

  it("sends an officer to the officer app based on the server role", async () => {
    server.use(
      http.get(url("/auth/me/"), () => HttpResponse.json(meBody("sho"))),
      http.post(url("/auth/otp/verify/"), () =>
        HttpResponse.json({ access: "a", refresh: "r", token_type: "Bearer", expires_in: 900, user: { user_id: "u", name: "n", role: "sho" } }),
      ),
    );
    renderApp();
    await signIn("123456");
    expect(await screen.findByText("officer home")).toBeInTheDocument();
  });

  it("shows a clear message for a wrong or expired code", async () => {
    renderApp();
    await signIn("000000");
    expect(await screen.findByRole("alert")).toHaveTextContent(/incorrect or has expired/i);
  });

  it("shows the lockout message on 429", async () => {
    server.use(http.post(url("/auth/otp/verify/"), () => apiError(429, "rate_limited", "Too many")));
    renderApp();
    await signIn("123456");
    expect(await screen.findByRole("alert")).toHaveTextContent(/locked/i);
  });

  it("keeps the resend button disabled during the 60 second cooldown", async () => {
    renderApp();
    await signIn("000000");
    await waitFor(() => expect(screen.getByRole("button", { name: /resend code in/i })).toBeDisabled());
  });

  it("redirects anonymous visitors from a guarded route to login", async () => {
    renderApp("/citizen-dashboard");
    expect(await screen.findByLabelText(/mobile number/i)).toBeInTheDocument();
  });
});
