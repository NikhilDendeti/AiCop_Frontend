import { API_PREFIX, config } from "@/config";
import { tokenStore } from "@/auth/tokenStore";
import { ApiError, ApiErrorBody } from "./errors";

type Query = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Query;
  headers?: Record<string, string>;
  idempotencyKey?: string;
  /** Skip the Bearer header (public auth routes). */
  anonymous?: boolean;
  /** Return the raw Response (downloads). */
  raw?: boolean;
  signal?: AbortSignal;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

let onSessionExpired: (() => void) | null = null;
/** AuthContext registers this so a failed refresh signs the user out. */
export const setSessionExpiredHandler = (fn: (() => void) | null) => {
  onSessionExpired = fn;
};

export const newIdempotencyKey = () => crypto.randomUUID();

export const buildUrl = (path: string, query?: Query) => {
  const url = path.startsWith("http") ? path : `${config.apiBaseUrl}${API_PREFIX}${path}`;
  if (!query) return url;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `${url}?${s}` : url;
};

async function toApiError(res: Response): Promise<ApiError> {
  let body: ApiErrorBody = {};
  try {
    body = await res.json();
  } catch {
    /* non-JSON error body */
  }
  const requestId = body.request_id || res.headers.get("X-Request-ID") || undefined;
  return new ApiError(
    res.status,
    body.error?.code || (res.status === 401 ? "unauthorized" : "error"),
    body.error?.message || `Request failed (${res.status})`,
    body.error?.details || {},
    requestId,
  );
}

/**
 * Refresh tokens rotate and each works once, so concurrent 401s must share a
 * single in-flight refresh.
 */
let refreshing: Promise<boolean> | null = null;

export function refreshSession(): Promise<boolean> {
  if (refreshing) return refreshing;
  const refresh = tokenStore.getRefresh();
  if (!refresh) return Promise.resolve(false);
  refreshing = (async () => {
    try {
      const res = await fetch(buildUrl("/auth/token/refresh/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      tokenStore.set(data.access, data.refresh);
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

async function send(path: string, opts: RequestOptions, retried: boolean): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/json", ...opts.headers };
  let body: BodyInit | undefined;
  if (opts.body instanceof FormData || opts.body instanceof Blob) {
    body = opts.body;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }
  if (opts.idempotencyKey) headers["Idempotency-Key"] = opts.idempotencyKey;
  const access = tokenStore.getAccess();
  if (!opts.anonymous && access) headers.Authorization = `Bearer ${access}`;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), {
      method: opts.method || "GET",
      headers,
      body,
      signal: opts.signal,
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ApiError(0, "network_error", "Cannot reach the server.");
  }

  if (res.status === 401 && !opts.anonymous && !retried) {
    if (await refreshSession()) return send(path, opts, true);
    tokenStore.clear();
    onSessionExpired?.();
  }
  return res;
}

export async function request<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const res = await send(path, opts, false);
  if (!res.ok) throw await toApiError(res);
  if (opts.raw) return res as unknown as T;
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string, query?: Query, o: RequestOptions = {}) => request<T>(path, { ...o, query }),
  post: <T>(path: string, body?: unknown, o: RequestOptions = {}) =>
    request<T>(path, { ...o, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, o: RequestOptions = {}) =>
    request<T>(path, { ...o, method: "PATCH", body }),
};
