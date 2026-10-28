import { api, Paginated } from "./client";

export type CaseStatus =
  | "pending" | "under_review" | "assigned" | "under_investigation"
  | "awaiting_magistrate" | "fir_registered" | "gd_recorded" | "resolved";

/** Used only when the server does not send progress_percent (contract B5 progress map). */
export const PROGRESS_BY_STATUS: Record<CaseStatus, number> = {
  pending: 10, under_review: 25, gd_recorded: 30, assigned: 40,
  awaiting_magistrate: 50, under_investigation: 60, fir_registered: 80, resolved: 100,
};

export interface MyComplaintRow {
  complaint_id: string;
  case_type: string;
  status: CaseStatus;
  status_label?: string;
  progress_percent?: number;
  ai_status?: string;
  incident_summary: string;
  incident_date: string;
  created_at?: string;
}

export const progressOf = (c: Pick<MyComplaintRow, "status" | "progress_percent">) =>
  c.progress_percent ?? PROGRESS_BY_STATUS[c.status] ?? 0;

export const complaintsApi = {
  mine: (page = 1) => api.get<Paginated<MyComplaintRow>>("/complaints/mine/", { page }),
};
