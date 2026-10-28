import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { apiError, url } from "@/mocks/handlers";
import { AIConfigPanel } from "./AIConfigPanel";
import { UsagePanel } from "./UsagePanel";

const config = (over: object = {}) => ({
  provider: "openai",
  fallback_provider: "",
  canary_provider: "",
  canary_percent: 0,
  models_by_task: { openai: { classify: "m1" } },
  timeout_seconds: 20,
  max_retries: 1,
  monthly_budget_usd: "50.00",
  kill_switch: false,
  updated_at: "2026-10-01T10:00:00Z",
  ...over,
});

const wrap = (ui: React.ReactNode) =>
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{ui}</QueryClientProvider>);

describe("admin AI settings", () => {
  it("asks for confirmation, then sends the kill switch", async () => {
    let body: unknown = null;
    server.use(
      http.get(url("/admin/ai/config/"), () => HttpResponse.json(config())),
      http.patch(url("/admin/ai/config/"), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(config({ kill_switch: true }));
      }),
    );
    wrap(<AIConfigPanel />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Turn AI off" }));
    expect(body).toBeNull();
    await user.click(await screen.findByRole("button", { name: "Confirm" }));
    await waitFor(() => expect(body).toEqual({ kill_switch: true }));
    expect(await screen.findByText("AI is OFF")).toBeInTheDocument();
  });

  it("shows field errors from the server", async () => {
    server.use(
      http.get(url("/admin/ai/config/"), () => HttpResponse.json(config())),
      http.patch(url("/admin/ai/config/"), () => apiError(400, "validation_error", "Bad", { fallback_provider: ["Must differ from the main provider."] })),
    );
    wrap(<AIConfigPanel />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Save settings" }));
    expect(await screen.findByText("Must differ from the main provider.")).toBeInTheDocument();
  });

  it("rejects invalid JSON for models without calling the server", async () => {
    let called = false;
    server.use(
      http.get(url("/admin/ai/config/"), () => HttpResponse.json(config())),
      http.patch(url("/admin/ai/config/"), () => {
        called = true;
        return HttpResponse.json(config());
      }),
    );
    wrap(<AIConfigPanel />);
    const user = userEvent.setup();
    const box = await screen.findByLabelText(/models by provider/i);
    await user.clear(box);
    await user.type(box, "not json");
    await user.click(screen.getByRole("button", { name: "Save settings" }));
    expect(await screen.findByText("Models must be valid JSON.")).toBeInTheDocument();
    expect(called).toBe(false);
  });
});

describe("admin usage", () => {
  it("shows aggregate numbers and an empty-state for the breakdown", async () => {
    server.use(
      http.get(url("/admin/ai/usage/"), () =>
        HttpResponse.json({
          period_days: 7, calls: 12, failed_calls: 3, failure_rate: 0.25, fallback_calls: 1,
          latency_ms: { p50: 400, p95: 900 }, tokens: { input: 1, output: 2 }, cost_usd: 1.5,
          month_to_date_cost_usd: 3, monthly_budget_usd: 50, breakdown: [], review_queue_size: 2,
          pending_assessments: 0, officer_reviews: 4, officer_override_rate: 0.5, kill_switch: false,
        }),
      ),
    );
    wrap(<UsagePanel />);
    expect(await screen.findByText("25.0%")).toBeInTheDocument();
    expect(screen.getByText("400 / 900")).toBeInTheDocument();
    expect(screen.getByText(/No AI calls in this period/)).toBeInTheDocument();
  });
});
