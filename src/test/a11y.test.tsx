import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { url } from "@/mocks/handlers";
import { AuthProvider } from "@/auth/AuthContext";
import { LoginFlow } from "@/components/auth/LoginFlow";
import Register from "@/pages/Register";
import Privacy from "@/pages/Privacy";
import Index from "@/pages/Index";
import ComplaintDetailPage from "@/features/citizen/ComplaintDetailPage";
import { AIConfigPanel } from "@/features/admin/AIConfigPanel";
import { violations } from "./axe";

const wrap = (ui: React.ReactNode) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <AuthProvider>
          <Routes>
            <Route path="*" element={ui} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("accessibility (axe)", () => {
  it("home page", async () => {
    wrap(<Index />);
    await screen.findByRole("heading", { level: 1 });
    expect(await violations()).toEqual([]);
  });

  it("login, both steps", async () => {
    wrap(<LoginFlow />);
    await screen.findByLabelText(/mobile number/i);
    expect(await violations()).toEqual([]);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/mobile number/i), "9000000001");
    await user.click(screen.getByRole("button", { name: /send code/i }));
    await screen.findAllByRole("textbox", { name: /digit/i });
    expect(await violations()).toEqual([]);
  });

  it("registration", async () => {
    server.use(http.post(url("/auth/register/request/"), () => HttpResponse.json({ message: "ok" }, { status: 202 })));
    wrap(<Register />);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/mobile number/i), "9100000001");
    await user.click(screen.getByRole("button", { name: /send code/i }));
    await screen.findByLabelText(/full name/i);
    expect(await violations()).toEqual([]);
  });

  it("complaint detail", async () => {
    server.use(
      http.get(url("/complaints/c1/"), () =>
        HttpResponse.json({
          complaint_id: "c1", case_type: "Theft", incident_summary: "s", location: "l", incident_date: "2026-10-01",
          incident_time: "10:00:00", is_cognizable: true, status: "pending", status_label: "Pending", progress_percent: 10,
          ai_status: "unavailable", created_at: "2026-10-01T10:00:00Z", assessment: null, timeline: [], evidence_files: [],
        }),
      ),
    );
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/complaint/c1"]}>
          <Routes>
            <Route path="/complaint/:complaintId" element={<ComplaintDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await screen.findByText("Pending");
    expect(await violations()).toEqual([]);
  });

  it("admin AI settings", async () => {
    server.use(
      http.get(url("/admin/ai/config/"), () =>
        HttpResponse.json({
          provider: "openai", fallback_provider: "", canary_provider: "", canary_percent: 0, models_by_task: {},
          timeout_seconds: 20, max_retries: 1, monthly_budget_usd: null, kill_switch: false, updated_at: null,
        }),
      ),
    );
    render(
      <QueryClientProvider client={new QueryClient()}>
        <main>
          <AIConfigPanel />
        </main>
      </QueryClientProvider>,
    );
    await screen.findByLabelText(/main provider/i);
    expect(await violations()).toEqual([]);
  });

  it("privacy page", async () => {
    wrap(<Privacy />);
    await screen.findByText("Privacy");
    expect(await violations()).toEqual([]);
  });
});
