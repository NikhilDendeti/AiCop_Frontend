import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { progressOf } from "@/api/complaints";
import { aiStatusText, citizenApi } from "./api";
import { AssistantBox } from "./AssistantBox";
import { EvidenceSection } from "./EvidenceSection";

const titleCase = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function ComplaintDetailPage() {
  const { complaintId = "" } = useParams();
  const navigate = useNavigate();
  const q = useQuery({
    queryKey: ["complaint", complaintId],
    queryFn: () => citizenApi.detail(complaintId),
    enabled: !!complaintId,
  });
  const c = q.data;
  const sections = c?.assessment?.ipc_sections;
  const sectionRows = Array.isArray(sections) ? sections.map((s) => [s, ""] as const) : Object.entries(sections ?? {});
  const aiText = aiStatusText(c?.assessment?.ai_status ?? c?.ai_status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <header className="bg-white shadow-sm border-b-2 border-green-400">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/citizen-dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Complaint {complaintId.slice(0, 8).toUpperCase()}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        {q.isLoading && <p role="status">Loading...</p>}
        {q.isError && (
          <div role="alert" className="space-y-2">
            <p className="text-red-600">We could not load this complaint.</p>
            <Button size="sm" variant="outline" onClick={() => void q.refetch()}>
              Try again
            </Button>
          </div>
        )}

        {c && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  {c.case_type}
                  <Badge variant="outline">{c.status_label ?? titleCase(c.status)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Progress</span>
                    <span className="font-bold text-blue-600">{progressOf(c)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progressOf(c)} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full bg-blue-600 transition-all" style={{ width: `${progressOf(c)}%` }} />
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{c.incident_summary}</p>
                <p className="text-sm text-gray-600">
                  {c.incident_date} {c.incident_time} · {c.location}
                </p>
                {aiText && (
                  <p className="text-sm text-gray-700 bg-gray-50 rounded p-2" role="status">
                    {aiText}
                  </p>
                )}
              </CardContent>
            </Card>

            {sectionRows.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Suggested legal sections <Badge variant="outline">AI-generated</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {sectionRows.map(([code, title]) => (
                    <p key={code}>
                      <strong>{code}</strong> {title}
                    </p>
                  ))}
                  <p className="text-xs text-gray-500">Suggestions only. An officer decides the final sections.</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {(c.timeline ?? []).length === 0 && <p className="text-gray-600">No updates yet.</p>}
                {(c.timeline ?? []).map((t, i) => (
                  <p key={i}>
                    <strong>{t.label}</strong> · {new Date(t.at).toLocaleString()}
                  </p>
                ))}
              </CardContent>
            </Card>

            <EvidenceSection complaintId={complaintId} files={c.evidence_files ?? []} />
            <AssistantBox complaintId={complaintId} />
          </>
        )}
      </main>
    </div>
  );
}
