import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Bot, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NotificationsBell } from "@/features/citizen/NotificationsBell";
import { useAuth } from "@/auth/AuthContext";
import { CaseDetailView } from "./CaseDetailView";
import { ReviewQueueView } from "./ReviewQueueView";
import { STATUS_LABELS, labelFor, officerApi } from "./api";

const PRIORITY_STYLE = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-orange-100 text-orange-800 border-orange-200",
  low: "bg-gray-100 text-gray-800 border-gray-200",
} as const;

const Stat = ({ label, value }: { label: string; value?: number }) => (
  <Card>
    <CardContent className="p-4">
      <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </CardContent>
  </Card>
);

const OfficerInterface = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<"cases" | "review">("cases");

  const stats = useQuery({ queryKey: ["officer", "stats"], queryFn: officerApi.stats });
  const list = useQuery({
    queryKey: ["officer", "list", status, page],
    queryFn: () => officerApi.list({ status: status === "all" ? undefined : status, page }),
  });

  if (selected) return <CaseDetailView complaintId={selected} onBack={() => setSelected(null)} />;

  const rows = list.data?.results ?? [];
  const s = stats.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <header className="bg-white shadow-sm border-b-2 border-orange-400">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Officer Dashboard</h1>
            <p className="text-xs md:text-sm text-gray-600">
              {user?.name} · {labelFor(user?.role ?? "")}
              {user?.station ? ` · ${user.station.name}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsBell openPath={() => "/officer-dashboard"} />
            <Button variant="outline" size="sm" onClick={() => navigate("/officer-voice")}>
              <Bot className="h-4 w-4 mr-2" />
              Procedure assistant
            </Button>
            <Button variant="ghost" size="sm" onClick={onBack}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <section aria-label="Statistics" className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Stat label="Total cases" value={s?.total} />
          <Stat label="High urgency (open)" value={s?.high_urgency_open} />
          <Stat label="Awaiting AI review" value={s?.awaiting_ai_review} />
          <Stat label="Unassigned" value={s?.unassigned} />
          <Stat label="Filed in last 7 days" value={s?.filed_last_7_days} />
        </section>

        <div className="flex gap-2" role="tablist">
          <Button role="tab" aria-selected={tab === "cases"} variant={tab === "cases" ? "default" : "outline"} size="sm" onClick={() => setTab("cases")}>
            Cases
          </Button>
          <Button role="tab" aria-selected={tab === "review"} variant={tab === "review" ? "default" : "outline"} size="sm" onClick={() => setTab("review")}>
            AI review queue{s ? ` (${s.awaiting_ai_review})` : ""}
          </Button>
        </div>

        {tab === "review" && <ReviewQueueView onOpen={setSelected} />}

        {tab === "cases" && (<div className="flex items-center gap-3">
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-56" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>)}

        {tab === "cases" && (<>
        {list.isLoading && <p role="status">Loading cases...</p>}
        {list.isError && (
          <div role="alert" className="space-y-2">
            <p className="text-red-600">We could not load cases.</p>
            <Button size="sm" variant="outline" onClick={() => void list.refetch()}>
              Try again
            </Button>
          </div>
        )}
        {list.isSuccess && rows.length === 0 && <p className="text-gray-600">No cases match this filter.</p>}

        <div className="space-y-3">
          {rows.map((r) => (
            <Card key={r.complaint_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">
                    {labelFor(r.case_type)} · {r.complaint_id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-600">
                    {r.user.name} · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{r.status_label ?? labelFor(r.status)}</Badge>
                    {r.priority && <Badge className={PRIORITY_STYLE[r.priority]}>{r.priority}</Badge>}
                    {r.needs_review && <Badge className="bg-yellow-100 text-yellow-800">AI review</Badge>}
                  </div>
                </div>
                <Button size="sm" onClick={() => setSelected(r.complaint_id)}>
                  Open
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {(list.data?.previous || list.data?.next) && (
          <div className="flex justify-center gap-3">
            <Button size="sm" variant="outline" disabled={!list.data?.previous} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button size="sm" variant="outline" disabled={!list.data?.next} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
        </>)}
      </main>
    </div>
  );
};

export default OfficerInterface;
