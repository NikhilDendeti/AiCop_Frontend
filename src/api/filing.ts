import { api } from "./client";

export interface CaseType {
  case_type_id: string;
  name: string;
  label: string;
}

export interface Station {
  station_id: string;
  name: string;
  code: string;
  district: string;
  state: string;
}

export interface CreateComplaintBody {
  case_type: string;
  incident_summary: string;
  location: string;
  incident_date: string;
  incident_time: string;
  station_id?: string;
  is_cognizable?: boolean;
  accused?: { name: string; description: string; contact_info: string; statement: string }[];
  witnesses?: { name: string; contact_info: string; statement: string }[];
}

export const referenceApi = {
  caseTypes: () => api.get<CaseType[]>("/case-types/"),
  stations: () => api.get<Station[]>("/stations/"),
};

/** Complaint creation requires an Idempotency-Key; reuse the same key when retrying one submit. */
export const createComplaint = (body: CreateComplaintBody, idempotencyKey: string) =>
  api.post<{ message: string; complaint_id: string }>("/complaints/", body, { idempotencyKey });
