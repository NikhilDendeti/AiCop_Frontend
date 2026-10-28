const trimSlash = (s: string) => s.replace(/\/+$/, "");

export const config = {
  apiBaseUrl: trimSlash(import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"),
  enableDocuChat: import.meta.env.VITE_ENABLE_DOCUCHAT === "true",
  enableVoiceAssistant: import.meta.env.VITE_ENABLE_VOICE_ASSISTANT === "true",
  /** Idle sign-out in minutes. */
  idleTimeoutMinutes: Number(import.meta.env.VITE_IDLE_TIMEOUT_MINUTES || 20),
} as const;

export const API_PREFIX = "/api/v1";
