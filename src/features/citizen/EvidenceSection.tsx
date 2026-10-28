import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadEvidence } from "@/api/evidence";
import { describeError } from "@/api/errors";
import { notify } from "@/lib/notify";
import type { CitizenComplaint } from "./api";

const SCAN_TEXT: Record<string, string> = {
  pending: "Scan pending",
  clean: "Scanned: clean",
  infected: "Blocked: unsafe file",
  failed: "Scan failed",
};

interface Item {
  key: string;
  name: string;
  pct: number;
  error?: string;
  file: File;
}

export function EvidenceSection({
  complaintId,
  files,
}: {
  complaintId: string;
  files: NonNullable<CitizenComplaint["evidence_files"]>;
}) {
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);

  const patch = (key: string, p: Partial<Item>) =>
    setItems((list) => list.map((i) => (i.key === key ? { ...i, ...p } : i)));

  const run = async (item: Item) => {
    patch(item.key, { error: undefined, pct: 0 });
    try {
      await uploadEvidence(complaintId, item.file, item.file.name, (pct) => patch(item.key, { pct }));
      setItems((list) => list.filter((i) => i.key !== item.key));
      await qc.invalidateQueries({ queryKey: ["complaint", complaintId] });
    } catch (e) {
      patch(item.key, { error: describeError(e).message });
    }
  };

  const onPick = (list: FileList | null) => {
    if (!list) return;
    const added = Array.from(list).map((file) => ({ key: crypto.randomUUID(), name: file.name, pct: 0, file }));
    setItems((cur) => [...cur, ...added]);
    added.forEach((i) => void run(i));
    if (input.current) input.current.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Evidence
          <Button size="sm" variant="outline" onClick={() => input.current?.click()}>
            <Paperclip className="h-4 w-4 mr-2" />
            Add files
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <input
          ref={input}
          type="file"
          multiple
          hidden
          aria-label="Add evidence files"
          accept="image/*,video/*,audio/*,application/pdf"
          onChange={(e) => onPick(e.target.files)}
        />
        {files.length === 0 && items.length === 0 && <p className="text-gray-600">No files added yet.</p>}
        {files.map((f) => (
          <div key={f.file_id} className="flex items-center justify-between gap-2">
            <span className="truncate">{f.filename}</span>
            <Badge variant="outline">{f.uploaded ? SCAN_TEXT[f.scan_status] ?? f.scan_status : "Not uploaded"}</Badge>
          </div>
        ))}
        {items.map((i) => (
          <div key={i.key} className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">{i.name}</span>
              {i.error && (
                <Button size="sm" variant="outline" onClick={() => void run(i)}>
                  Retry
                </Button>
              )}
            </div>
            {i.error ? (
              <p role="alert" className="text-red-600">
                {i.error}
              </p>
            ) : (
              <Progress value={i.pct} aria-label={`Uploading ${i.name}`} />
            )}
          </div>
        ))}
        <p className="text-xs text-gray-500">Images and PDFs up to 25 MB, audio 50 MB, video 200 MB.</p>
      </CardContent>
    </Card>
  );
}
