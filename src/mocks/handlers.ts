import { http, HttpResponse } from "msw";
import { API_PREFIX, config } from "@/config";

export const url = (path: string) => `${config.apiBaseUrl}${API_PREFIX}${path}`;

export const apiError = (status: number, code: string, message: string, details: Record<string, unknown> = {}) =>
  HttpResponse.json({ error: { code, message, details }, request_id: "req-test-1" }, { status });

export const tokenBody = (role = "citizen", n = 1) => ({
  access: `access-${n}`,
  refresh: `refresh-${n}`,
  token_type: "Bearer",
  expires_in: 900,
  user: { user_id: "u1", name: "Test User", role },
});

export const meBody = (role = "citizen") => ({
  user_id: "u1",
  name: "Test User",
  phone: "9000000001",
  email: null,
  role,
  designation: null,
  department: null,
  station: null,
});

/**
 * Default handlers follow docs/FRONTEND_CONTRACT.md. Registration (B1) and voice
 * (B2) are mocked exactly as the contract describes so screens can be tested
 * without the backend.
 */
export const handlers = [
  http.post(url("/auth/otp/request/"), () => HttpResponse.json({ message: "sent" }, { status: 202 })),
  http.post(url("/auth/otp/verify/"), async ({ request }) => {
    const { code } = (await request.json()) as { code: string };
    return code === "123456" ? HttpResponse.json(tokenBody()) : apiError(401, "unauthorized", "Invalid code");
  }),
  http.get(url("/auth/me/"), () => HttpResponse.json(meBody())),
  http.post(url("/auth/logout/"), () => new HttpResponse(null, { status: 204 })),

  // PLANNED B1
  http.post(url("/auth/register/request/"), () => HttpResponse.json({ message: "sent" }, { status: 202 })),
  http.post(url("/auth/register/verify/"), () => HttpResponse.json(tokenBody(), { status: 201 })),

  // PLANNED B2
  http.post(url("/voice/transcribe/"), () => HttpResponse.json({ text: "hello", language: "en" })),
  http.post(url("/legal-assistant/ask/"), () =>
    HttpResponse.json({ answer: "General information.", in_scope: true, disclaimer: "Not legal advice.", sources: [], ai_available: true }),
  ),
];
