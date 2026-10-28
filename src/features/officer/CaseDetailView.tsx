import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/auth/AuthContext";
import { isApiError } from "@/api/errors";
import { notify } from "@/lib/notify";
import { CaseDetail, labelFor, officerApi } from "./api";
import { ApprovalRequest, AssistPanel, DraftsPanel, EscalationPanel, ReviewPanel } from "./CasePanels";

const PRIORITY_STYLE = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-orange-100 text-orange-800 border-orange-200",
  low: "bg-gray-100 text-gray-800 border-gray-200",
} as const;

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
    <dd className="text-sm text-gray-900">{children || "—"}</dd>
  </div>
);

export function CaseDetailView({ complaintId, onBack }: { complaintId: string; onBack: () => void }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const canAssign = user?.role === "sub_inspector" || user?.role === "sho";
  const isMagistrate = user?.role === "magistrate";
  const [remarks, setRemarks] = useState("");
  const [note, setNote] = useState("");
  const [hc, setHc] = useState("");

  const detail = useQuery({ queryKey: ["officer", "case", complaintId], queryFn: () => officerApi.detail(complaintId) });
  const notes = useQuery({ queryKey: ["officer", "notes", complaintId], queryFn: () => officerApi.notes(complaintId) });
  const hcs = useQuery({
    queryKey: ["officer", "head-constables"],
    queryFn: officerApi.headConstables,
    enabled: canAssign,
  });

  const reload = () => {
    void qc.invalidateQueries({ queryKey: ["officer"] });
  };

  // 409 version_conflict means someone else changed the case: reload and tell the officer.
  const onFail = (e: unknown) => {
    notify.apiError(e);
    if (isApiError(e) && (e.isVersionConflict || e.isInvalidTransition)) reload();
  };

  const move = useMutation({
    mutationFn: (status: CaseDetail["status"]) =>
      officerApi.setStatus({ complaint_id: complaintId, status, remarks: remarks || undefined, version: detail.data!.version }),
    onSuccess: () => {
      notify.success("Status updated");
      setRemarks("");
      reload();
    },
    onError: onFail,
  });

  const assign = useMutation({
    mutationFn: () => officerApi.assign({ complaint_id: complaintId, head_constable_phone: hc, version: detail.data!.version }),
    onSuccess: () => {
      notify.success("Case assigned");
      setHc("");
      reload();
    },
    onError: onFail,
  });

  const addNote = useMutation({
    mutationFn: () => officerApi.addNote(complaintId, note),
    onSuccess: () => {
      setNote("");
      reload();
    },
    onError: onFail,
  });

  const decide = useMutation({
    mutationFn: (d: "approve" | "reject") => officerApi.decide(complaintId, d, remarks || undefined),
    onSuccess: () => {
      notify.success("Decision recorded");
      setRemarks("");
      reload();
    },
    onError: onFail,
  });

  const c = detail.data;
  const noteList = notes.data ?? [];
  // Assigning only happens through the assign control; never offer it as a plain status move.
  const transitions = (c?.available_transitions ?? []).filter((t) => t !== "assigned");
  const busy = move.isPending || assign.isPending || decide.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <header className="bg-white shadow-sm border-b-2 border-orange-400">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Case {complaintId.slice(0, 8).toUpperCase()}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {detail.isLoading && <p role="status">Loading case...</p>}
        {detail.isError && (
          <div role="alert" className="space-y-2">
            <p className="text-red-600">We could not load this case.</p>
            <Button size="sm" variant="outline" onClick={() => void detail.refetch()}>
              Try again
            </Button>
          </div>
        )}

        {c && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  {labelFor(c.case_type)}
                  <Badge variant="outline">{labelFor(c.status)}</Badge>
                  {c.priority && <Badge className={PRIORITY_STYLE[c.priority]}>{c.priority} priority</Badge>}
                  {!c.is_cognizable && <Badge variant="outline">Non-cognizable</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{c.description}</p>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Citizen">{c.user.name}</Field>
                  <Field label="Phone">{c.user.phone}</Field>
                  <Field label="Location">{c.location}</Field>
                  <Field label="Incident">{[c.incident_date, c.incident_time].filter(Boolean).join(" ")}</Field>
                  <Field label="Station">{c.station?.name}</Field>
                  <Field label="Assigned officer">{c.assigned_officer?.name}</Field>
                  <Field label="Urgency score">{c.urgency_score ?? undefined}</Field>
                  <Field label="Filed">{new Date(c.created_at).toLocaleString()}</Field>
                </dl>
              </CardContent>
            </Card>

            {c.assessment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    AI assessment <Badge variant="outline">AI-generated</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    Status: <strong>{labelFor(c.assessment.ai_status ?? "none")}</strong>
                    {c.assessment.needs_review && <Badge className="ml-2 bg-yellow-100 text-yellow-800">Needs review</Badge>}
                  </div>
                  {c.assessment.review_reasons.length > 0 && (
                    <ul className="list-disc ml-5">
                      {c.assessment.review_reasons.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  )}
                  {Object.entries(c.assessment.sections).map(([code, title]) => (
                    <p key={code}>
                      <strong>{code}</strong> {title}
                    </p>
                  ))}
                  <p className="text-xs text-gray-500">Suggestions only. A human officer decides.</p>
                </CardContent>
              </Card>
            )}

            {(c.accused?.length || c.witnesses?.length) ? (
              <Card>
                <CardHeader>
                  <CardTitle>Accused and witnesses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {c.accused?.map((a, i) => (
                    <p key={`a${i}`}>
                      <strong>Accused:</strong> {a.name} {a.description && `— ${a.description}`}
                    </p>
                  ))}
                  {c.witnesses?.map((w, i) => (
                    <p key={`w${i}`}>
                      <strong>Witness:</strong> {w.name} {w.statement && `— ${w.statement}`}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {c.evidence_files && c.evidence_files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Evidence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {c.evidence_files.map((f) => (
                    <div key={f.file_id}>
                      {f.filename} <Badge variant="outline">{f.uploaded ? `scan: ${f.scan_status}` : "not uploaded"}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {!isMagistrate && <ReviewPanel complaintId={complaintId} detail={c} />}

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  aria-label="Remarks"
                  placeholder="Remarks (required to resolve)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  {transitions.length === 0 && !c.magistrate_approval?.awaiting && (
                    <p className="text-sm text-gray-600">No actions are available for you on this case.</p>
                  )}
                  {transitions.map((s) => (
                    <Button key={s} disabled={busy} onClick={() => move.mutate(s)}>
                      {move.isPending && move.variables === s && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Move to {labelFor(s)}
                    </Button>
                  ))}
                  {isMagistrate && c.magistrate_approval?.awaiting && (
                    <>
                      <Button disabled={busy} onClick={() => decide.mutate("approve")}>
                        Approve
                      </Button>
                      <Button variant="destructive" disabled={busy} onClick={() => decide.mutate("reject")}>
                        Reject
                      </Button>
                    </>
                  )}
                </div>

                {canAssign && (
                  <div className="flex flex-wrap gap-2 items-center border-t pt-4">
                    <Select value={hc} onValueChange={setHc}>
                      <SelectTrigger className="w-64" aria-label="Head constable">
                        <SelectValue placeholder="Assign to a head constable" />
                      </SelectTrigger>
                      <SelectContent>
                        {(hcs.data?.head_constables ?? []).map((h) => (
                          <SelectItem key={h.user_id} value={h.phone}>
                            {h.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" disabled={!hc || busy} onClick={() => assign.mutate()}>
                      Assign
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {!isMagistrate && <AssistPanel complaintId={complaintId} isCommander={canAssign} />}
            {!isMagistrate && <DraftsPanel complaintId={complaintId} canApprove={canAssign} />}
            {!isMagistrate && <EscalationPanel complaintId={complaintId} role={user?.role ?? ""} />}
            {canAssign && !c.is_cognizable && c.status === "gd_recorded" && <ApprovalRequest complaintId={complaintId} detail={c} />}

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {noteList.map((n, i) => (
                  <p key={n.note_id ?? i} className="text-sm border-l-2 border-orange-300 pl-3">
                    {n.notes}
                    <span className="block text-xs text-gray-500">
                      {n.by} · {new Date(n.at).toLocaleString()}
                    </span>
                  </p>
                ))}
                {!isMagistrate && (
                  <div className="space-y-2">
                    <Textarea aria-label="New note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an internal note" />
                    <Button variant="outline" disabled={!note.trim() || addNote.isPending} onClick={() => addNote.mutate()}>
                      Add note
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {c.progress_timeline.map((t, i) => (
                  <p key={i}>
                    <strong>{labelFor(t.stage)}</strong> · {new Date(t.timestamp).toLocaleString()} · {t.updated_by}
                  </p>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
