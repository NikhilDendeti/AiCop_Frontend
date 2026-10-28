import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { apiError, url } from "@/mocks/handlers";
import { AuthProvider } from "@/auth/AuthContext";
import Register from "./Register";

const setup = async () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={["/register"]}>
        <AuthProvider>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<div>login page</div>} />
            <Route path="/citizen-dashboard" element={<div>citizen home</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText(/mobile number/i), "9100000001");
  await user.click(screen.getByRole("button", { name: /send code/i }));
  const boxes = await screen.findAllByRole("textbox", { name: /digit/i });
  await user.type(boxes[0], "123456");
  await user.type(screen.getByLabelText(/full name/i), "New Person");
  await user.type(screen.getByLabelText(/date of birth/i), "1990-01-02");
  await user.type(screen.getByLabelText(/permanent address/i), "1 Main Road");
  return user;
};

describe("register", () => {
  it("creates the account and lands on the citizen home", async () => {
    const user = await setup();
    await user.click(screen.getByRole("button", { name: /create account/i }));
    expect(await screen.findByText("citizen home")).toBeInTheDocument();
  });

  it("tells an existing user to sign in (409 already_registered)", async () => {
    server.use(http.post(url("/auth/register/verify/"), () => apiError(409, "already_registered", "exists")));
    const user = await setup();
    await user.click(screen.getByRole("button", { name: /create account/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/already has an account/i);
  });

  it("shows field errors and keeps the form open on a 400", async () => {
    server.use(
      http.post(url("/auth/register/verify/"), () => apiError(400, "validation_error", "Bad", { email: ["Enter a valid email."] })),
    );
    const user = await setup();
    await user.click(screen.getByRole("button", { name: /create account/i }));
    expect(await screen.findByText("Enter a valid email.")).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toHaveValue("New Person");
  });

  it("sends the user back for a new code when the Aadhaar check fails", async () => {
    server.use(
      http.post(url("/auth/register/verify/"), () =>
        HttpResponse.json({ error: { code: "validation_error", message: "Bad", details: { aadhar_number: ["This number cannot be used."] } }, request_id: "r" }, { status: 400 }),
      ),
    );
    const user = await setup();
    await user.click(screen.getByRole("button", { name: /create account/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/request a new code/i);
    expect(screen.getByRole("button", { name: /send code/i })).toBeInTheDocument();
  });
});
