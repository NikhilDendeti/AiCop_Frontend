import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { apiError, url } from "@/mocks/handlers";
import { CaseDetailView } from "./CaseDetailView";

let role = "sub_inspector";
vi.mock("@/auth/AuthContext", () => ({
  useAuth: () => ({ user: { role, name: "Test", station: null }, status: "authenticated" }),
}));

const ID = "11111111-0000-0000-0000-000000000000";
const detail = (over: object = {}) => ({
  version: 3,
  complaint_id: ID,
  is_cognizable: true,
  available_transitions: ["assigned", "under_review"],
  magistrate_approval: null,
  escalations: [],
  drafts: [],
  user: { name: "Asha", phone: "9000000001" },
  case_type: "theft",
  status: "pending",
  description: "stolen",
  location: "Market",
  created_at: "2026-10-01T10:00:00Z",
  current_stage: "pending",
  progress_timeline: [],
  assessment: null,
  ...over,
});

const base = (d = detail()) => [
  http.get(url(`/police/complaints/${ID}/`), () => HttpResponse.json(d)),
  http.get(url(`/police/complaints/${ID}/notes/`), () => HttpResponse.json([])),
  http.get(url(`/police/complaints/${ID}/drafts/`), () => HttpResponse.json([])),
  http.get(url(`/police/complaints/${ID}/escalations/`), () => HttpResponse.json([])),
  http.get(url(`/police/complaints/${ID}/triage/`), () =>
    HttpResponse.json({ suggested_urgency: 70, reasons: ["r"], suggested_assignees: [], note: "Suggestions only." }),
  ),
  http.get(url("/police/head-constables/"), () => HttpResponse.json({ status: "ok", head_constables: [] })),
];

const show = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <CaseDetailView complaintId={ID} onBack={() => undefined} />
    </QueryClientProvider>,
  );

describe("officer case detail", () => {
  it("offers only available_transitions and never a plain Move to Assigned", async () => {
    role = "sub_inspector";
    server.use(...base());
    show();
    expect(await screen.findByRole("button", { name: /move to under review/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /move to assigned/i })).not.toBeInTheDocument();
  });

  it("sends the loaded version and reloads on a 409 version_conflict", async () => {
    role = "sub_inspector";
    let sent: { version?: number } = {};
    let loads = 0;
    server.use(
      http.get(url(`/police/complaints/${ID}/`), () => {
        loads += 1;
        return HttpResponse.json(detail());
      }),
      http.post(url("/police/complaints/status/"), async ({ request }) => {
        sent = (await request.json()) as { version: number };
        return apiError(409, "version_conflict", "changed");
      }),
      ...base(),
    );
    show();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: /move to under review/i }));
    await waitFor(() => expect(sent.version).toBe(3));
    await waitFor(() => expect(loads).toBeGreaterThan(1));
  });

  it("offers the magistrate request only for non-cognizable gd_recorded cases", async () => {
    role = "sub_inspector";
    server.use(...base(detail({ is_cognizable: true, status: "pending" })));
    const first = show();
    await screen.findByText(/Actions/);
    expect(screen.queryByRole("button", { name: /request approval/i })).not.toBeInTheDocument();
    first.unmount();
    server.use(...base(detail({ is_cognizable: false, status: "gd_recorded" })));
    show();
    expect(await screen.findByRole("button", { name: /request approval/i })).toBeInTheDocument();
  });

  it("hides commander-only controls from a head constable", async () => {
    role = "head_constable";
    server.use(...base());
    show();
    await screen.findByText(/Actions/);
    expect(screen.queryByText(/Assign to a head constable/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /request approval/i })).not.toBeInTheDocument();
  });

  it("gives a magistrate approve and reject only while approval is awaited", async () => {
    role = "magistrate";
    server.use(...base(detail({ available_transitions: [], magistrate_approval: { awaiting: true, approved: null, comments: "" } })));
    show();
    expect(await screen.findByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
    expect(screen.queryByText(/FIR \/ GD drafts/)).not.toBeInTheDocument();
  });

  it("labels AI drafts and shows approve only to commanders", async () => {
    role = "sub_inspector";
    server.use(
      http.get(url(`/police/complaints/${ID}/drafts/`), () =>
        HttpResponse.json([{ draft_id: "d1", document_type: "fir", version: 1, status: "draft", source: "ai", content: "text", created_at: "2026-10-01T10:00:00Z" }]),
      ),
      ...base(),
    );
    show();
    expect(await screen.findByText("AI-generated", { selector: "div" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
  });
});
