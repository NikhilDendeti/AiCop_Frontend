import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isApiError } from "@/api/errors";
import { notify } from "@/lib/notify";
import { CaseDetail, Escalation, ReviewBody, officerApi } from "./api";

const useRefresh = () => {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: ["officer"] });
};

const AiBadge = () => <Badge variant="outline">AI-generated</Badge>;

/** FIR and GD drafts: write one, ask the AI for one (always labelled), approve (SI/SHO). */
export function DraftsPanel({ complaintId, canApprove }: { complaintId: string; canApprove: boolean }) {
  const refresh = useRefresh();
  const [type, setType] = useState<"fir" | "gd">("fir");
  const [content, setContent] = useState("");
  const drafts = useQuery({ queryKey: ["officer", "drafts", complaintId], queryFn: () => officerApi.drafts(complaintId) });

  const create = useMutation({
    mutationFn: () => officerApi.createDraft(complaintId, type, content),
    onSuccess: () => {
      setContent("");
      refresh();
    },
    onError: notify.apiError,
  });
  const ai = useMutation({
    mutationFn: () => officerApi.aiDraft(complaintId, type),
    onSuccess: () => {
      notify.info("AI draft added", "Read and edit it before approving.");
      refresh();
    },
    onError: (e) => {
      if (isApiError(e) && e.isUnavailable) notify.error("AI drafting is unavailable", "Write the draft by hand instead.");
      else notify.apiError(e);
    },
  });
  const approve = useMutation({
    mutationFn: (id: string) => officerApi.approveDraft(complaintId, id),
    onSuccess: () => {
      notify.success("Draft approved");
      refresh();
    },
    onError: notify.apiError,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>FIR / GD drafts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {drafts.data?.length === 0 && <p className="text-sm text-gray-600">No drafts yet.</p>}
        {drafts.data?.map((d) => (
          <div key={d.draft_id} className="border rounded-lg p-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <strong>
                {d.document_type.toUpperCase()} v{d.version}
              </strong>
              <Badge variant="outline">{d.status}</Badge>
              {d.source !== "officer" && d.source !== "manual" && <AiBadge />}
              {canApprove && d.status !== "approved" && (
                <Button size="sm" className="ml-auto" disabled={approve.isPending} onClick={() => approve.mutate(d.draft_id)}>
                  Approve
                </Button>
              )}
            </div>
            <p className="text-sm whitespace-pre-wrap">{d.content}</p>
          </div>
        ))}

        <div className="space-y-2 border-t pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={type} onValueChange={(v) => setType(v as "fir" | "gd")}>
              <SelectTrigger className="w-40" aria-label="Document type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fir">FIR</SelectItem>
                <SelectItem value="gd">General diary (GD)</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" disabled={ai.isPending} onClick={() => ai.mutate()}>
              {ai.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Draft with AI
            </Button>
          </div>
          <Textarea aria-label="Draft text" rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a draft by hand" />
          <Button variant="outline" disabled={!content.trim() || create.isPending} onClick={() => create.mutate()}>
            Save draft
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Escalate to a senior officer, with the history. */
export function EscalationPanel({ complaintId, role }: { complaintId: string; role: string }) {
  const refresh = useRefresh();
  const [to, setTo] = useState<Escalation["to_role"]>(role === "sub_inspector" ? "sho" : "sub_inspector");
  const [reason, setReason] = useState("");
  const list = useQuery({ queryKey: ["officer", "escalations", complaintId], queryFn: () => officerApi.escalations(complaintId) });
  const go = useMutation({
    mutationFn: () => officerApi.escalate(complaintId, to, reason),
    onSuccess: () => {
      notify.success("Escalated");
      setReason("");
      refresh();
    },
    onError: notify.apiError,
  });
  const options = role === "sho" ? [] : role === "sub_inspector" ? (["sho"] as const) : (["sub_inspector", "sho"] as const);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Escalation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {list.data?.map((e) => (
          <p key={e.escalation_id}>
            To <strong>{e.to_role.replace("_", " ")}</strong> by {e.by}: {e.reason}
          </p>
        ))}
        {options.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={to} onValueChange={(v) => setTo(v as Escalation["to_role"])}>
              <SelectTrigger className="w-44" aria-label="Escalate to">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o === "sho" ? "SHO" : "Sub-Inspector"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input aria-label="Reason" className="flex-1 min-w-48" placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
            <Button variant="outline" disabled={!reason.trim() || go.isPending} onClick={() => go.mutate()}>
              Escalate
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Triage suggestions (SI/SHO) and the AI case summary. Both are suggestions only. */
export function AssistPanel({ complaintId, isCommander }: { complaintId: string; isCommander: boolean }) {
  const triage = useQuery({ queryKey: ["officer", "triage", complaintId], queryFn: () => officerApi.triage(complaintId), enabled: isCommander });
  const summary = useMutation({ mutationFn: () => officerApi.summary(complaintId), onError: notify.apiError });
  const s = summary.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Triage and summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {isCommander && triage.data && (
          <div className="space-y-1">
            <p>
              Suggested urgency: <strong>{triage.data.suggested_urgency ?? "none"}</strong>
            </p>
            <ul className="list-disc ml-5">
              {triage.data.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {triage.data.suggested_assignees.length > 0 && (
              <p>
                Least busy head constables:{" "}
                {triage.data.suggested_assignees.map((a) => `${a.name} (${a.open_cases} open)`).join(", ")}
              </p>
            )}
            <p className="text-xs text-gray-500">{triage.data.note}</p>
          </div>
        )}

        <div className="space-y-2">
          <Button variant="outline" disabled={summary.isPending} onClick={() => summary.mutate()}>
            {summary.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Summarise case (AI)
          </Button>
          {s && (
            <div className="space-y-2" role="status">
              <AiBadge />
              <p>{s.summary}</p>
              <ul className="list-disc ml-5">
                {s.facts.map((f, i) => (
                  <li key={i}>
                    {f.text} <span className="text-xs text-gray-500">({f.source_label})</span>
                  </li>
                ))}
              </ul>
              {s.open_questions.length > 0 && (
                <>
                  <p className="font-medium">Open questions</p>
                  <ul className="list-disc ml-5">
                    {s.open_questions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                </>
              )}
              <p className="text-xs text-gray-500">{s.disclaimer}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Ask a magistrate to approve (SI/SHO). */
export function ApprovalRequest({ complaintId, detail }: { complaintId: string; detail: CaseDetail }) {
  const refresh = useRefresh();
  const [comments, setComments] = useState("");
  const ask = useMutation({
    mutationFn: () => officerApi.requestApproval(complaintId, comments || undefined),
    onSuccess: () => {
      notify.success("Sent to the magistrate");
      setComments("");
      refresh();
    },
    onError: notify.apiError,
  });
  const a = detail.magistrate_approval;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Magistrate approval</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {a?.awaiting && <p>Waiting for the magistrate's decision.</p>}
        {a && !a.awaiting && a.approved !== null && (
          <p>
            Decision: <strong>{a.approved ? "approved" : "rejected"}</strong>
            {a.comments ? ` — ${a.comments}` : ""}
          </p>
        )}
        {!a?.awaiting && (
          <div className="flex gap-2">
            <Input aria-label="Comments for the magistrate" placeholder="Comments (optional)" value={comments} onChange={(e) => setComments(e.target.value)} />
            <Button variant="outline" disabled={ask.isPending} onClick={() => ask.mutate()}>
              Request approval
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Accept, edit or reject the AI's classification. The officer's decision always wins. */
export function ReviewPanel({ complaintId, detail }: { complaintId: string; detail: CaseDetail }) {
  const refresh = useRefresh();
  const a = detail.assessment;
  const [editing, setEditing] = useState(false);
  const [sections, setSections] = useState(() =>
    Object.entries(a?.sections ?? {}).map(([c, t]) => `${c} | ${t}`).join("\n"),
  );
  const [urgency, setUrgency] = useState(String(detail.urgency_score ?? ""));
  const [notes, setNotes] = useState("");
  const review = useMutation({
    mutationFn: (body: ReviewBody) => officerApi.review(complaintId, body),
    onSuccess: () => {
      notify.success("Review recorded");
      refresh();
    },
    onError: notify.apiError,
  });

  if (!a || !a.needs_review || a.reviewed_at) return null;

  const parse = () =>
    Object.fromEntries(
      sections
        .split("\n")
        .map((l) => l.split("|").map((x) => x.trim()))
        .filter(([c]) => c)
        .map(([c, t]) => [c, t ?? ""]),
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          AI review needed <AiBadge />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {editing && (
          <>
            <Textarea aria-label="Sections (one per line: code | title)" rows={4} value={sections} onChange={(e) => setSections(e.target.value)} />
            <Input aria-label="Urgency score" type="number" min={0} max={100} value={urgency} onChange={(e) => setUrgency(e.target.value)} />
          </>
        )}
        <Input aria-label="Review notes" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <Button disabled={review.isPending} onClick={() => review.mutate({ decision: "accepted", notes: notes || undefined })}>
            Accept AI result
          </Button>
          {editing ? (
            <Button
              variant="outline"
              disabled={review.isPending}
              onClick={() =>
                review.mutate({
                  decision: "edited",
                  sections: parse(),
                  ...(urgency !== "" ? { urgency_score: Number(urgency) } : {}),
                  notes: notes || undefined,
                })
              }
            >
              Save my edits
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
          <Button variant="destructive" disabled={review.isPending} onClick={() => review.mutate({ decision: "rejected", notes: notes || undefined })}>
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
