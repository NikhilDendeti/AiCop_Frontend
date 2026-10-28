import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { citizenApi } from "./api";

/** Used by citizens and officers; clicking a notification opens its complaint. */
export function NotificationsBell({ openPath }: { openPath: (complaintId: string) => string }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const list = useQuery({
    queryKey: ["notifications"],
    queryFn: () => citizenApi.notifications(true),
    refetchInterval: 60_000,
  });
  const read = useMutation({
    mutationFn: citizenApi.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const items = list.data?.results ?? [];
  const count = list.data?.count ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" aria-label={`Notifications, ${count} unread`} className="relative">
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-1.5">{count}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-2">
        {items.length === 0 && <p className="text-sm text-gray-600">No new notifications.</p>}
        {items.map((n) => (
          <button
            key={n.notification_id}
            className="block w-full text-left text-sm border-b pb-2 hover:bg-gray-50"
            onClick={() => {
              read.mutate(n.notification_id);
              if (n.complaint_id) navigate(openPath(n.complaint_id));
            }}
          >
            <span>{n.message}</span>
            <span className="block text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
