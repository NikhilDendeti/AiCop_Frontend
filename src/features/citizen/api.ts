import { api, Paginated } from "@/api/client";
import type { CaseStatus } from "@/api/complaints";
import type { EvidenceFile } from "@/api/evidence";

export interface CitizenComplaint {
  complaint_id: string;
  case_type: string;
  incident_summary: string;
  location: string;
  incident_date: string;
  incident_time: string;
  is_cognizable: boolean;
  status: CaseStatus;
  status_label?: string;
  progress_percent?: number;
  ai_status?: string | null;
  ai_urgency_score?: number | null;
  created_at: string;
  assessment?: {
    ai_status?: string | null;
    ipc_sections?: Record<string, string> | string[];
    ipc_descriptions?: unknown;
  } | null;
  timeline?: { status: string; label: string; at: string }[];
  evidence_files?: Pick<EvidenceFile, "file_id" | "filename" | "type" | "size_bytes" | "uploaded" | "scan_status">[];
  accused?: { name: string; description: string }[];
  witnesses?: { name: string; statement: string }[];
}

export interface AppNotification {
  notification_id: string;
  event: string;
  message: string;
  complaint_id: string | null;
  read: boolean;
  created_at: string;
}

export interface IntakeReply {
  reply: string;
  emergency: boolean;
  ready: boolean;
  missing: string[];
  report: {
    incident_summary: string;
    case_type: string;
    location: string;
    incident_date: string;
    incident_time: string;
  } | null;
  ai_available: boolean;
}

export interface AssessmentPreview {
  ai_status: string;
  needs_review: boolean;
  reasons: string[];
  act?: string;
  is_cognizable?: boolean;
  ipc_sections: Record<string, string>;
  AI_urgency_score?: number;
}

export const citizenApi = {
  detail: (id: string) => api.get<CitizenComplaint>(`/complaints/${id}/`),
  notifications: (unread?: boolean) =>
    api.get<Paginated<AppNotification>>("/notifications/", unread ? { unread: true } : undefined),
  markRead: (id: string) => api.post<void>(`/notifications/${id}/read/`),
  ask: (complaint_id: string, question: string) =>
    api.post<{ answer: string; needs_human: boolean; ai_available: boolean }>("/assistant/ask/", {
      complaint_id,
      question,
    }),
  startIntake: (language?: string) =>
    api.post<{ conversation_id: string; disclosure: string }>("/intake/conversations/", { language }),
  intakeMessage: (conversationId: string, content: string) =>
    api.post<IntakeReply>(`/intake/conversations/${conversationId}/messages/`, { content }),
  previewSections: (incident_summary: string) =>
    api.post<AssessmentPreview>("/ai/assessments/", { incident_summary }),
};

/** Plain-language meaning of ai_status for the citizen. */
export function aiStatusText(s?: string | null): string | null {
  switch (s) {
    case "pending":
      return "AI analysis is in progress. An officer will review your complaint either way.";
    case "unavailable":
      return "AI analysis is not available right now. An officer will review your complaint.";
    case "skipped":
      return "AI analysis was skipped for this complaint.";
    case "needs_review":
      return "An officer will double-check the AI suggestions.";
    default:
      return null;
  }
}
