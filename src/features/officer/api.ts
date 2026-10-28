import { api, Paginated } from "@/api/client";
import type { CaseStatus } from "@/api/complaints";

export type Priority = "high" | "medium" | "low";

export interface OfficerRow {
  complaint_id: string;
  user: { name: string; phone: string };
  case_type: string;
  status: CaseStatus;
  status_label?: string;
  priority?: Priority;
  current_stage?: string;
  ai_urgency_score: number | null;
  ai_status: string | null;
  needs_review: boolean;
  ipc_sections: Record<string, string> | string[] | null;
  created_at: string;
}

export interface OfficerStats {
  total: number;
  high_urgency_open: number;
  awaiting_ai_review: number;
  unassigned: number;
  assigned_to_me: number;
  filed_last_7_days: number;
  by_status: Record<CaseStatus, number>;
}

export interface CaseDetail {
  version: number;
  complaint_id: string;
  is_cognizable: boolean;
  available_transitions: CaseStatus[];
  magistrate_approval: { awaiting: boolean; approved: boolean | null; comments: string } | null;
  escalations: unknown[];
  drafts: unknown[];
  user: { name: string; phone: string; aadhar?: string };
  case_type: string;
  status: CaseStatus;
  description: string;
  location: string;
  created_at: string;
  current_stage: string;
  progress_timeline: { stage: string; timestamp: string; updated_by: string }[];
  incident_date?: string;
  incident_time?: string;
  urgency_score?: number | null;
  priority?: Priority;
  station?: { name: string } | null;
  assigned_officer?: { name: string; phone: string } | null;
  assessment?: {
    ai_status: string | null;
    needs_review: boolean;
    review_reasons: string[];
    sections: Record<string, string>;
    confidence: number | null;
    reviewed_at: string | null;
  } | null;
  accused?: { name: string; description: string; contact_info: string; statement: string }[];
  witnesses?: { name: string; contact_info: string; statement: string }[];
  evidence_files?: {
    file_id: string;
    filename: string;
    type: string;
    size_bytes: number;
    uploaded: boolean;
    scan_status: string;
  }[];
}

export interface Note {
  note_id: string;
  notes: string;
  status: string;
  by: string | null;
  at: string;
}

export interface Draft {
  draft_id: string;
  document_type: "fir" | "gd";
  version: number;
  status: string;
  source: string;
  content: string;
  created_at: string;
}

export interface Escalation {
  escalation_id: string;
  to_role: "sub_inspector" | "sho";
  reason: string;
  by: string | null;
  at: string;
}

export interface Triage {
  suggested_urgency: number | null;
  reasons: string[];
  suggested_assignees: { name: string; phone: string; open_cases: number }[];
  note: string;
}

export interface CaseSummary {
  summary: string;
  facts: { text: string; source: string; source_label: string }[];
  open_questions: string[];
  disclaimer: string;
}

export interface ReviewQueueRow {
  complaint_id: string;
  case_type: string;
  ai_status: string;
  urgency_score: number | null;
  sections: Record<string, string>;
  reasons: string[];
  created_at: string;
}

export interface ReviewBody {
  decision: "accepted" | "edited" | "rejected";
  sections?: Record<string, string>;
  is_cognizable?: boolean;
  urgency_score?: number;
  notes?: string;
}

export interface HeadConstable {
  user_id: string;
  name: string;
  phone: string;
  department: string | null;
}

export const officerApi = {
  list: (params: { status?: string; page?: number }) =>
    api.get<Paginated<OfficerRow>>("/police/complaints/", params),
  stats: () => api.get<OfficerStats>("/police/stats/"),
  detail: (id: string) => api.get<CaseDetail>(`/police/complaints/${id}/`),
  setStatus: (body: { complaint_id: string; status: CaseStatus; remarks?: string; version: number }) =>
    api.post<{ message: string; status: CaseStatus; version: number; available_transitions: CaseStatus[] }>(
      "/police/complaints/status/",
      body,
    ),
  headConstables: () =>
    api.get<{ status: string; head_constables: HeadConstable[] }>("/police/head-constables/"),
  assign: (body: { complaint_id: string; head_constable_phone: string; notes?: string; version: number }) =>
    api.post("/police/complaints/assign/", body),
  notes: (id: string) => api.get<Note[]>(`/police/complaints/${id}/notes/`),
  addNote: (id: string, note: string) => api.post(`/police/complaints/${id}/notes/`, { note }),
  drafts: (id: string) => api.get<Draft[]>(`/police/complaints/${id}/drafts/`),
  createDraft: (id: string, document_type: "fir" | "gd", content: string) =>
    api.post<Draft>(`/police/complaints/${id}/drafts/`, { document_type, content }),
  aiDraft: (id: string, document_type: "fir" | "gd") =>
    api.post<Draft>(`/police/complaints/${id}/drafts/ai/`, { document_type }),
  approveDraft: (id: string, draftId: string) =>
    api.post<Draft>(`/police/complaints/${id}/drafts/${draftId}/approve/`),
  escalations: (id: string) => api.get<Escalation[]>(`/police/complaints/${id}/escalations/`),
  escalate: (id: string, to_role: Escalation["to_role"], reason: string) =>
    api.post(`/police/complaints/${id}/escalations/`, { to_role, reason }),
  requestApproval: (id: string, comments?: string) =>
    api.post(`/police/complaints/${id}/magistrate-approval/`, { comments }),
  triage: (id: string) => api.get<Triage>(`/police/complaints/${id}/triage/`),
  summary: (id: string) => api.post<CaseSummary>(`/police/complaints/${id}/summary/`),
  reviewQueue: (page = 1) => api.get<Paginated<ReviewQueueRow>>("/police/ai-review-queue/", { page }),
  review: (id: string, body: ReviewBody) => api.post(`/police/complaints/${id}/ai-review/`, body),
  decide: (id: string, decision: "approve" | "reject", comments?: string) =>
    api.post(`/police/complaints/${id}/magistrate-decision/`, { decision, comments }),
};

export const STATUS_LABELS: Record<CaseStatus, string> = {
  pending: "Pending",
  under_review: "Under review",
  assigned: "Assigned",
  under_investigation: "Under investigation",
  awaiting_magistrate: "Awaiting magistrate",
  fir_registered: "FIR registered",
  gd_recorded: "GD recorded",
  resolved: "Resolved",
};

export const labelFor = (s: string) =>
  STATUS_LABELS[s as CaseStatus] ?? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
