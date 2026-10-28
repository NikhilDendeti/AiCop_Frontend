import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { apiError, url } from "@/mocks/handlers";
import { api, newIdempotencyKey } from "./client";
import { ApiError } from "./errors";
import { tokenStore } from "@/auth/tokenStore";

describe("api client", () => {
  it("adds the Bearer token", async () => {
    tokenStore.set("a1", "r1");
    let auth = "";
    server.use(
      http.get(url("/ping/"), ({ request }) => {
        auth = request.headers.get("Authorization") ?? "";
        return HttpResponse.json({ ok: true });
      }),
    );
    await api.get("/ping/");
    expect(auth).toBe("Bearer a1");
  });

  it("parses the error format and exposes request_id", async () => {
    server.use(http.get(url("/boom/"), () => apiError(400, "validation_error", "Bad", { phone: ["Required"] })));
    const err = (await api.get("/boom/").catch((e) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe("validation_error");
    expect(err.requestId).toBe("req-test-1");
    expect(err.fieldErrors.phone).toBe("Required");
  });

  it("maps consent_required, version_conflict and 429/503", async () => {
    server.use(
      http.get(url("/a/"), () => apiError(403, "consent_required", "x")),
      http.get(url("/b/"), () => apiError(409, "version_conflict", "x")),
      http.get(url("/c/"), () => apiError(429, "rate_limited", "x")),
      http.get(url("/d/"), () => apiError(503, "service_unavailable", "x")),
    );
    expect(await api.get("/a/").catch((e) => e.isConsentRequired)).toBe(true);
    expect(await api.get("/b/").catch((e) => e.isVersionConflict)).toBe(true);
    expect(await api.get("/c/").catch((e) => e.isRateLimited)).toBe(true);
    expect(await api.get("/d/").catch((e) => e.isUnavailable)).toBe(true);
  });

  it("sends the Idempotency-Key header", async () => {
    let key = "";
    server.use(
      http.post(url("/complaints/"), ({ request }) => {
        key = request.headers.get("Idempotency-Key") ?? "";
        return HttpResponse.json({ complaint_id: "c1" }, { status: 201 });
      }),
    );
    const k = newIdempotencyKey();
    await api.post("/complaints/", {}, { idempotencyKey: k });
    expect(key).toBe(k);
  });

  it("refreshes once on 401 even with parallel requests, then retries", async () => {
    tokenStore.set("old", "refresh-old");
    let refreshCalls = 0;
    server.use(
      http.post(url("/auth/token/refresh/"), () => {
        refreshCalls += 1;
        return HttpResponse.json({ access: "new", refresh: "refresh-new", token_type: "Bearer", expires_in: 900 });
      }),
      http.get(url("/data/"), ({ request }) =>
        request.headers.get("Authorization") === "Bearer new"
          ? HttpResponse.json({ ok: true })
          : apiError(401, "unauthorized", "expired"),
      ),
    );
    const results = await Promise.all([api.get("/data/"), api.get("/data/"), api.get("/data/")]);
    expect(results).toHaveLength(3);
    expect(refreshCalls).toBe(1);
    expect(tokenStore.getRefresh()).toBe("refresh-new");
  });

  it("clears the session when refresh fails", async () => {
    tokenStore.set("old", "refresh-old");
    server.use(
      http.post(url("/auth/token/refresh/"), () => apiError(401, "unauthorized", "reused")),
      http.get(url("/data/"), () => apiError(401, "unauthorized", "expired")),
    );
    await expect(api.get("/data/")).rejects.toMatchObject({ status: 401 });
    expect(tokenStore.getAccess()).toBeNull();
    expect(tokenStore.getRefresh()).toBeNull();
  });
});
