import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notify } from "@/lib/notify";
import { AssessmentPreview, citizenApi } from "./api";

/** Optional preview of AI-suggested legal sections before submitting. */
export function SectionsPreview({ summary }: { summary: string }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AssessmentPreview | null>(null);

  const run = async () => {
    setBusy(true);
    try {
      setResult(await citizenApi.previewSections(summary));
    } catch (e) {
      notify.apiError(e);
    } finally {
      setBusy(false);
    }
  };

  const rows = Object.entries(result?.ipc_sections ?? {});

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" size="sm" disabled={busy || summary.trim().length < 10} onClick={() => void run()}>
        {t("filing.previewSections")}
      </Button>
      {result && (
        <div className="text-sm bg-gray-50 rounded p-3 space-y-1" role="status">
          <Badge variant="outline">AI-generated</Badge>
          {result.ai_status === "unavailable" || rows.length === 0 ? (
            <p>No suggestions are available right now. An officer will review your complaint.</p>
          ) : (
            rows.map(([code, title]) => (
              <p key={code}>
                <strong>{code}</strong> {title}
              </p>
            ))
          )}
          {result.needs_review && <p className="text-amber-700">An officer will double-check these.</p>}
          <p className="text-xs text-gray-500">Suggestions only. They do not change what you submit.</p>
        </div>
      )}
    </div>
  );
}
