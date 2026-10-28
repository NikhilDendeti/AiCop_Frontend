import { api } from "./client";

export type Role = "citizen" | "head_constable" | "sub_inspector" | "sho" | "magistrate" | "admin";

export interface TokenBody {
  access: string;
  refresh: string;
  token_type: string;
  expires_in: number;
  user: { user_id: string; name: string; role: Role };
}

export interface Me {
  user_id: string;
  name: string;
  phone: string;
  email: string | null;
  role: Role;
  designation: string | null;
  department: string | null;
  station: { station_id: string; name: string; code: string } | null;
}

export interface RegisterPayload {
  phone: string;
  code: string;
  name: string;
  date_of_birth: string;
  gender?: "male" | "female" | "other";
  permanent_address: string;
  email?: string;
  aadhar_number?: string;
  consents?: { purpose: string; policy_version: string; granted: boolean }[];
}

export const authApi = {
  requestOtp: (phone: string) =>
    api.post<{ message: string }>("/auth/otp/request/", { phone }, { anonymous: true }),
  verifyOtp: (phone: string, code: string) =>
    api.post<TokenBody>("/auth/otp/verify/", { phone, code }, { anonymous: true }),
  me: () => api.get<Me>("/auth/me/"),
  logout: (refresh: string) => api.post<void>("/auth/logout/", { refresh }),
  // PLANNED (B1): mocked in tests/dev until the backend lands it.
  requestRegistration: (phone: string) =>
    api.post<{ message: string }>("/auth/register/request/", { phone }, { anonymous: true }),
  verifyRegistration: (payload: RegisterPayload) =>
    api.post<TokenBody>("/auth/register/verify/", payload, { anonymous: true }),
};

export const isOfficer = (r: Role) => r === "head_constable" || r === "sub_inspector" || r === "sho";

/** Where each role lands after signing in. */
export const homePathFor = (role: Role): string => {
  if (role === "citizen") return "/citizen-dashboard";
  if (role === "admin") return "/admin";
  if (role === "magistrate") return "/magistrate";
  return "/officer-dashboard"; // officers
};
