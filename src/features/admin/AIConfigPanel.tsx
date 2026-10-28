import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { isApiError } from "@/api/errors";
import { notify } from "@/lib/notify";
import { AIConfig, AIConfigPatch, PROVIDERS, adminApi } from "./api";

const Select = ({ id, value, onChange, blank }: { id: string; value: string; onChange: (v: string) => void; blank?: string }) => (
  <select id={id} className="w-full h-10 border border-input rounded-md px-3 text-sm bg-background" value={value} onChange={(e) => onChange(e.target.value)}>
    {blank !== undefined && <option value="">{blank}</option>}
    {PROVIDERS.map((p) => (
      <option key={p.value} value={p.value}>
        {p.label}
      </option>
    ))}
  </select>
);

interface Draft {
  provider: string;
  fallback_provider: string;
  canary_provider: string;
  canary_percent: string;
  timeout_seconds: string;
  max_retries: string;
  monthly_budget_usd: string;
  models: string;
}

const toDraft = (c: AIConfig): Draft => ({
  provider: c.provider,
  fallback_provider: c.fallback_provider,
  canary_provider: c.canary_provider,
  canary_percent: String(c.canary_percent),
  timeout_seconds: String(c.timeout_seconds),
  max_retries: String(c.max_retries),
  monthly_budget_usd: c.monthly_budget_usd ?? "",
  models: JSON.stringify(c.models_by_task, null, 2),
});

/** Admin controls for the AI provider, models, limits and the kill switch. */
export function AIConfigPanel() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "ai-config"], queryFn: adminApi.config });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (q.data) setDraft(toDraft(q.data));
  }, [q.data]);

  const save = useMutation({
    mutationFn: (patch: AIConfigPatch) => adminApi.update(patch),
    onSuccess: (c) => {
      qc.setQueryData(["admin", "ai-config"], c);
      void qc.invalidateQueries({ queryKey: ["admin", "ai-usage"] });
      setFieldErrors({});
      notify.success("Settings saved");
    },
    onError: (e) => {
      if (isApiError(e) && e.code === "validation_error") setFieldErrors(e.fieldErrors);
      else notify.apiError(e);
    },
  });

  if (q.isLoading) return <p role="status">Loading...</p>;
  if (q.isError || !q.data || !draft) return <p role="alert" className="text-red-600">We could not load the AI settings.</p>;
  const c = q.data;
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  const submit = () => {
    let models;
    try {
      models = JSON.parse(draft.models);
    } catch {
      setFieldErrors({ models_by_task: "Models must be valid JSON." });
      return;
    }
    save.mutate({
      provider: draft.provider,
      fallback_provider: draft.fallback_provider,
      canary_provider: draft.canary_provider,
      canary_percent: Number(draft.canary_percent),
      timeout_seconds: Number(draft.timeout_seconds),
      max_retries: Number(draft.max_retries),
      monthly_budget_usd: draft.monthly_budget_usd === "" ? null : draft.monthly_budget_usd,
      models_by_task: models,
    });
  };

  const err = (k: string) =>
    fieldErrors[k] ? (
      <p role="alert" className="text-sm text-red-600 mt-1">
        {fieldErrors[k]}
      </p>
    ) : null;

  return (
    <div className="space-y-6">
      <Card className={c.kill_switch ? "border-red-400" : undefined}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            AI kill switch {c.kill_switch ? <Badge variant="destructive">AI is OFF</Badge> : <Badge variant="outline">AI is on</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            {c.kill_switch
              ? "All AI features are stopped. Complaints are still accepted and officers handle them by hand."
              : "Turning this on stops every AI feature immediately. Complaints are still accepted and officers handle them by hand."}
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant={c.kill_switch ? "default" : "destructive"} disabled={save.isPending}>
                {c.kill_switch ? "Turn AI back on" : "Turn AI off"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{c.kill_switch ? "Turn AI back on?" : "Turn AI off for everyone?"}</AlertDialogTitle>
                <AlertDialogDescription>
                  {c.kill_switch
                    ? "AI features will resume for citizens and officers."
                    : "Citizens and officers lose AI help until you turn it back on. This is recorded in the audit log."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => save.mutate({ kill_switch: !c.kill_switch })}>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Provider and limits</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="provider">Main provider</Label>
                <Select id="provider" value={draft.provider} onChange={(v) => set("provider", v)} />
                {err("provider")}
              </div>
              <div>
                <Label htmlFor="fallback">Fallback provider</Label>
                <Select id="fallback" value={draft.fallback_provider} onChange={(v) => set("fallback_provider", v)} blank="None" />
                {err("fallback_provider")}
              </div>
              <div>
                <Label htmlFor="canary">Canary provider</Label>
                <Select id="canary" value={draft.canary_provider} onChange={(v) => set("canary_provider", v)} blank="None" />
                {err("canary_provider")}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="canary-pct">Canary %</Label>
                <Input id="canary-pct" type="number" min={0} max={100} value={draft.canary_percent} onChange={(e) => set("canary_percent", e.target.value)} />
                {err("canary_percent")}
              </div>
              <div>
                <Label htmlFor="timeout">Timeout (s)</Label>
                <Input id="timeout" type="number" min={1} max={120} value={draft.timeout_seconds} onChange={(e) => set("timeout_seconds", e.target.value)} />
                {err("timeout_seconds")}
              </div>
              <div>
                <Label htmlFor="retries">Max retries</Label>
                <Input id="retries" type="number" min={0} max={5} value={draft.max_retries} onChange={(e) => set("max_retries", e.target.value)} />
                {err("max_retries")}
              </div>
              <div>
                <Label htmlFor="budget">Monthly budget (USD)</Label>
                <Input id="budget" inputMode="decimal" placeholder="No limit" value={draft.monthly_budget_usd} onChange={(e) => set("monthly_budget_usd", e.target.value)} />
                {err("monthly_budget_usd")}
              </div>
            </div>
            <div>
              <Label htmlFor="models">Models by provider and task (JSON)</Label>
              <Textarea id="models" rows={6} className="font-mono text-xs" value={draft.models} onChange={(e) => set("models", e.target.value)} />
              {err("models_by_task")}
              <p className="text-xs text-gray-500 mt-1">Tasks: classify, intake, draft, summarize, assist.</p>
            </div>
            {err("non_field_errors")}
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={save.isPending}>
                Save settings
              </Button>
              {c.updated_at && <span className="text-xs text-gray-500">Last changed {new Date(c.updated_at).toLocaleString()}</span>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
