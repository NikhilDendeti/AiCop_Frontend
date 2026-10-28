import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/auth/AuthContext";
import { NotificationsBell } from "@/features/citizen/NotificationsBell";
import { CaseDetailView } from "./CaseDetailView";
import { labelFor, officerApi } from "./api";

/** Magistrates see only the cases routed to them; the queue shows those awaiting a decision. */
const MagistrateInterface = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const list = useQuery({
    queryKey: ["officer", "list", "awaiting_magistrate", page],
    queryFn: () => officerApi.list({ status: "awaiting_magistrate", page }),
  });

  if (selected) return <CaseDetailView complaintId={selected} onBack={() => setSelected(null)} />;
  const rows = list.data?.results ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <header className="bg-white shadow-sm border-b-2 border-orange-400">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Approvals</h1>
            <p className="text-xs md:text-sm text-gray-600">{user?.name} · Magistrate</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsBell openPath={() => "/magistrate"} />
            <Button variant="ghost" size="sm" onClick={onBack}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 space-y-3">
        <h2 className="text-lg font-semibold">Awaiting your decision</h2>
        {list.isLoading && <p role="status">Loading...</p>}
        {list.isError && (
          <div role="alert" className="space-y-2">
            <p className="text-red-600">We could not load the queue.</p>
            <Button size="sm" variant="outline" onClick={() => void list.refetch()}>
              Try again
            </Button>
          </div>
        )}
        {list.isSuccess && rows.length === 0 && <p className="text-gray-600">No cases are waiting for you.</p>}
        {rows.map((r) => (
          <Card key={r.complaint_id}>
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="font-semibold">
                  {labelFor(r.case_type)} · {r.complaint_id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-xs text-gray-600">{new Date(r.created_at).toLocaleDateString()}</p>
                {r.priority && <Badge variant="outline">{r.priority} priority</Badge>}
              </div>
              <Button size="sm" onClick={() => setSelected(r.complaint_id)}>
                Open
              </Button>
            </CardContent>
          </Card>
        ))}
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
      </main>
    </div>
  );
};

export default MagistrateInterface;
