import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { labelFor, officerApi } from "./api";

/** Cases whose AI result is flagged and not yet reviewed, most urgent first. */
export function ReviewQueueView({ onOpen }: { onOpen: (id: string) => void }) {
  const [page, setPage] = useState(1);
  const q = useQuery({ queryKey: ["officer", "review-queue", page], queryFn: () => officerApi.reviewQueue(page) });
  const rows = q.data?.results ?? [];

  return (
    <div className="space-y-3">
      {q.isLoading && <p role="status">Loading...</p>}
      {q.isError && (
        <div role="alert" className="space-y-2">
          <p className="text-red-600">We could not load the review queue.</p>
          <Button size="sm" variant="outline" onClick={() => void q.refetch()}>
            Try again
          </Button>
        </div>
      )}
      {q.isSuccess && rows.length === 0 && <p className="text-gray-600">Nothing is waiting for AI review.</p>}
      {rows.map((r) => (
        <Card key={r.complaint_id}>
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1 text-sm">
              <p className="font-semibold">
                {labelFor(r.case_type)} · {r.complaint_id.slice(0, 8).toUpperCase()}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">AI: {labelFor(r.ai_status)}</Badge>
                {r.urgency_score !== null && <Badge variant="outline">urgency {r.urgency_score}</Badge>}
              </div>
              {r.reasons.map((reason) => (
                <p key={reason} className="text-xs text-gray-600">
                  {reason}
                </p>
              ))}
            </div>
            <Button size="sm" onClick={() => onOpen(r.complaint_id)}>
              Review
            </Button>
          </CardContent>
        </Card>
      ))}
      {(q.data?.previous || q.data?.next) && (
        <div className="flex justify-center gap-3">
          <Button size="sm" variant="outline" disabled={!q.data?.previous} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button size="sm" variant="outline" disabled={!q.data?.next} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
