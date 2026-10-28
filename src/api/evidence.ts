import { buildUrl, api, request } from "./client";
import { ApiError } from "./errors";
import { tokenStore } from "@/auth/tokenStore";

export type ScanStatus = "pending" | "clean" | "infected" | "failed";

export interface EvidenceFile {
  file_id: string;
  filename: string;
  type: string;
  content_type: string;
  size_bytes: number;
  uploaded: boolean;
  scan_status: ScanStatus;
  uploaded_at?: string;
  upload?: { method: "PUT"; url: string; headers: Record<string, string> };
}

export async function sha256Hex(blob: Blob): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** PUT with progress (fetch cannot report upload progress). */
function putBytes(url: string, headers: Record<string, string>, body: Blob, onProgress?: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new ApiError(xhr.status, "upload_failed", "The file could not be uploaded."));
    xhr.onerror = () => reject(new ApiError(0, "network_error", "Cannot reach the server."));
    xhr.send(body);
  });
}

/**
 * Initiate, PUT the bytes, then complete. A relative upload URL is the API
 * itself (send Bearer); an absolute one is cloud storage (send no Authorization).
 */
export async function uploadEvidence(
  complaintId: string,
  file: Blob,
  filename: string,
  onProgress?: (pct: number) => void,
): Promise<EvidenceFile> {
  const sha256 = await sha256Hex(file);
  const init = await api.post<EvidenceFile>(`/complaints/${complaintId}/evidence-files/`, {
    filename,
    content_type: file.type,
    size_bytes: file.size,
    sha256,
  });
  const up = init.upload!;
  const relative = up.url.startsWith("/");
  const headers = { ...up.headers };
  if (relative && tokenStore.getAccess()) headers.Authorization = `Bearer ${tokenStore.getAccess()}`;
  await putBytes(relative ? buildUrl(up.url.replace(/^\/api\/v1/, "")) : up.url, headers, file, onProgress);
  return request<EvidenceFile>(`/evidence-files/${init.file_id}/complete/`, { method: "POST" });
}

export const listEvidence = (complaintId: string) =>
  api.get<EvidenceFile[]>(`/complaints/${complaintId}/evidence-files/`);
