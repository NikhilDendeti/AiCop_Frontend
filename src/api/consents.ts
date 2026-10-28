import { api } from "./client";

/** Version of the privacy policy text shown in this build; sent with every consent change. */
export const POLICY_VERSION = "v1";

export interface Consent {
  purpose: "complaint_processing" | "ai_processing" | "notifications";
  label: string;
  granted: boolean;
  policy_version: string | null;
  granted_at: string | null;
  revoked_at: string | null;
}

export const consentsApi = {
  list: () => api.get<Consent[]>("/consents/"),
  update: (purpose: Consent["purpose"], granted: boolean) =>
    api.post<Consent[]>("/consents/update/", { purpose, policy_version: POLICY_VERSION, granted }),
  exportData: () => api.get<unknown>("/me/export/"),
};
