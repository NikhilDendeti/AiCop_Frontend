import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { apiError, url } from "@/mocks/handlers";
import ComplaintDetailPage from "./ComplaintDetailPage";
import { IntakeChat } from "./IntakeChat";

const detail = (over: object = {}) => ({
  complaint_id: "abcd1234-0000",
  case_type: "Theft",
  incident_summary: "My phone was stolen",
  location: "Market",
  incident_date: "2026-10-01",
  incident_time: "10:00:00",
  is_cognizable: true,
  status: "under_investigation",
  status_label: "Under investigation",
  progress_percent: 60,
  ai_status: "unavailable",
  created_at: "2026-10-01T10:00:00Z",
  assessment: { ai_status: "unavailable", ipc_sections: {} },
  timeline: [{ status: "pending", label: "Filed", at: "2026-10-01T10:00:00Z" }],
  evidence_files: [{ file_id: "f1", filename: "photo.jpg", type: "image", size_bytes: 10, uploaded: true, scan_status: "clean" }],
  ...over,
});

const wrap = (ui: React.ReactNode, path = "/complaint/abcd1234-0000") =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/complaint/:complaintId" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("complaint detail", () => {
  it("shows server progress, timeline, evidence and the AI-unavailable state", async () => {
    server.use(http.get(url("/complaints/abcd1234-0000/"), () => HttpResponse.json(detail())));
    wrap(<ComplaintDetailPage />);
    expect(await screen.findByText("Under investigation")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "60");
    expect(screen.getByText("Filed")).toBeInTheDocument();
    expect(screen.getByText("photo.jpg")).toBeInTheDocument();
    expect(screen.getByText(/AI analysis is not available/i)).toBeInTheDocument();
  });

  it("shows a retry when loading fails", async () => {
    server.use(http.get(url("/complaints/abcd1234-0000/"), () => apiError(500, "internal_error", "boom")));
    wrap(<ComplaintDetailPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not load/i);
  });

  it("asks the status assistant and shows the AI-down message", async () => {
    server.use(
      http.get(url("/complaints/abcd1234-0000/"), () => HttpResponse.json(detail())),
      http.post(url("/assistant/ask/"), () => HttpResponse.json({ answer: "", needs_human: true, ai_available: false })),
    );
    wrap(<ComplaintDetailPage />);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/your question/i), "what next?");
    await user.click(screen.getByRole("button", { name: "Ask" }));
    expect(await screen.findByText(/assistant is not available/i)).toBeInTheDocument();
  });
});

describe("intake chat", () => {
  it("falls back to the form when the AI is unavailable", async () => {
    server.use(
      http.post(url("/intake/conversations/"), () => HttpResponse.json({ conversation_id: "c1", disclosure: "AI helps." }, { status: 201 })),
      http.post(url("/intake/conversations/c1/messages/"), () =>
        HttpResponse.json({ reply: "", emergency: false, ready: false, missing: [], report: null, ai_available: false }),
      ),
    );
    wrap(<IntakeChat language="en" onReport={() => undefined} />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: /chat instead/i }));
    await user.type(await screen.findByLabelText(/your message/i), "hello");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/continue with the form/i);
  });

  it("hands the report to the form when ready, and highlights emergencies", async () => {
    let got: unknown = null;
    server.use(
      http.post(url("/intake/conversations/"), () => HttpResponse.json({ conversation_id: "c1", disclosure: "AI helps." }, { status: 201 })),
      http.post(url("/intake/conversations/c1/messages/"), () =>
        HttpResponse.json({
          reply: "Call 112 now.",
          emergency: true,
          ready: true,
          missing: [],
          report: { incident_summary: "s", case_type: "theft", location: "l", incident_date: "2026-10-01", incident_time: "10:00:00" },
          ai_available: true,
        }),
      ),
    );
    wrap(<IntakeChat language="en" onReport={(r) => (got = r)} />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: /chat instead/i }));
    await user.type(await screen.findByLabelText(/your message/i), "help");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("Call 112 now.")).toHaveClass("bg-red-100");
    expect(got).toMatchObject({ case_type: "theft" });
  });
});
