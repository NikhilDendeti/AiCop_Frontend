import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "./api";

const pct = (v: number | null) => (v === null ? "—" : `${(v * 100).toFixed(1)}%`);
const usd = (v: number | null) => (v === null ? "—" : `$${v.toFixed(2)}`);
const num = (v: number | null | undefined) => (v === null || v === undefined ? "—" : v.toLocaleString());

const Tile = ({ label, value }: { label: string; value: string }) => (
  <Card>
    <CardContent className="p-4">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </CardContent>
  </Card>
);

/** Aggregate AI usage only; no complaint contents. */
export function UsagePanel() {
  const [days, setDays] = useState(7);
  const q = useQuery({ queryKey: ["admin", "ai-usage", days], queryFn: () => adminApi.usage(days) });
  const u = q.data;

  return (
    <div className="space-y-4">
      <div className="flex gap-2" role="group" aria-label="Period">
        {[7, 30, 90].map((d) => (
          <Button key={d} size="sm" variant={days === d ? "default" : "outline"} aria-pressed={days === d} onClick={() => setDays(d)}>
            {d} days
          </Button>
        ))}
      </div>

      {q.isLoading && <p role="status">Loading...</p>}
      {q.isError && (
        <div role="alert" className="space-y-2">
          <p className="text-red-600">We could not load usage.</p>
          <Button size="sm" variant="outline" onClick={() => void q.refetch()}>
            Try again
          </Button>
        </div>
      )}

      {u && (
        <>
          <section aria-label="Usage summary" className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Tile label="AI calls" value={num(u.calls)} />
            <Tile label="Failure rate" value={pct(u.failure_rate)} />
            <Tile label="Fallback calls" value={num(u.fallback_calls)} />
            <Tile label="Latency p50 / p95 (ms)" value={`${num(u.latency_ms.p50)} / ${num(u.latency_ms.p95)}`} />
            <Tile label={`Cost, last ${u.period_days} days`} value={usd(u.cost_usd)} />
            <Tile label="Cost this month" value={`${usd(u.month_to_date_cost_usd)}${u.monthly_budget_usd !== null ? ` of ${usd(u.monthly_budget_usd)}` : ""}`} />
            <Tile label="Awaiting officer review" value={num(u.review_queue_size)} />
            <Tile label="Officer override rate" value={pct(u.officer_override_rate)} />
          </section>

          <Card>
            <CardHeader>
              <CardTitle>By provider and task</CardTitle>
            </CardHeader>
            <CardContent>
              {u.breakdown.length === 0 ? (
                <p className="text-sm text-gray-600">No AI calls in this period.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Calls</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {u.breakdown.map((r) => (
                      <TableRow key={`${r.provider}-${r.task}-${r.status}`}>
                        <TableCell>{r.provider}</TableCell>
                        <TableCell>{r.task}</TableCell>
                        <TableCell>{r.status}</TableCell>
                        <TableCell className="text-right">{num(r.calls)}</TableCell>
                        <TableCell className="text-right">{usd(r.cost_usd)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          <p className="text-xs text-gray-500">{u.pending_assessments} assessments are still pending. {u.officer_reviews} officer reviews in this period.</p>
        </>
      )}
    </div>
  );
}
