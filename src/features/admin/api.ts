import { api } from "@/api/client";

export const PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic (Claude)" },
] as const;

export type ModelsByTask = Record<string, Record<string, string>>;

export interface AIConfig {
  provider: string;
  fallback_provider: string;
  canary_provider: string;
  canary_percent: number;
  models_by_task: ModelsByTask;
  timeout_seconds: number;
  max_retries: number;
  monthly_budget_usd: string | null;
  kill_switch: boolean;
  updated_at: string | null;
}

export type AIConfigPatch = Partial<Omit<AIConfig, "updated_at" | "monthly_budget_usd">> & {
  monthly_budget_usd?: string | null;
};

export interface AIUsage {
  period_days: number;
  calls: number;
  failed_calls: number;
  failure_rate: number | null;
  fallback_calls: number;
  latency_ms: { p50: number | null; p95: number | null };
  tokens: { input: number | null; output: number | null };
  cost_usd: number | null;
  month_to_date_cost_usd: number;
  monthly_budget_usd: number | null;
  breakdown: { provider: string; task: string; status: string; calls: number; cost_usd: number | null }[];
  review_queue_size: number;
  pending_assessments: number;
  officer_reviews: number;
  officer_override_rate: number | null;
  kill_switch: boolean;
}

export const adminApi = {
  config: () => api.get<AIConfig>("/admin/ai/config/"),
  update: (patch: AIConfigPatch) => api.patch<AIConfig>("/admin/ai/config/", patch),
  usage: (days: number) => api.get<AIUsage>("/admin/ai/usage/", { days }),
};
