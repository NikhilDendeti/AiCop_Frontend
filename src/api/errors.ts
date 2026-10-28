export interface ApiErrorBody {
  error?: { code?: string; message?: string; details?: Record<string, unknown> };
  request_id?: string;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details: Record<string, unknown>;
  requestId?: string;

  constructor(
    status: number,
    code: string,
    message: string,
    details: Record<string, unknown> = {},
    requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }

  get isConsentRequired() { return this.code === "consent_required"; }
  get isVersionConflict() { return this.code === "version_conflict"; }
  get isInvalidTransition() { return this.code === "invalid_transition"; }
  get isRateLimited() { return this.status === 429; }
  get isUnavailable() { return this.status === 503; }
  get isNetwork() { return this.status === 0; }

  /** Field errors from a `validation_error`, as {field: message}. */
  get fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(this.details)) {
      out[k] = Array.isArray(v) ? String(v[0]) : String(v);
    }
    return out;
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;

/** Friendly text for a failure; specific for the states the contract defines. */
export function describeError(e: unknown): { title: string; message: string; requestId?: string } {
  if (!isApiError(e)) return { title: "Something went wrong", message: "Please try again." };
  const requestId = e.requestId;
  if (e.isNetwork) return { title: "Cannot reach the server", message: "Check your connection and try again.", requestId };
  if (e.isConsentRequired)
    return { title: "Consent needed", message: "Turn on AI processing consent under Privacy (top of your dashboard) to use this feature.", requestId };
  if (e.isVersionConflict)
    return { title: "Case was updated", message: "Someone else changed this case. It has been reloaded; please review and try again.", requestId };
  if (e.isInvalidTransition) return { title: "Action not allowed", message: e.message, requestId };
  if (e.isRateLimited) return { title: "Too many attempts", message: e.message || "Please wait a moment and try again.", requestId };
  if (e.isUnavailable) return { title: "Service temporarily unavailable", message: e.message || "Please try again shortly.", requestId };
  return { title: "Request failed", message: e.message, requestId };
}
