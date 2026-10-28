import { toast } from "@/hooks/use-toast";
import { describeError } from "@/api/errors";

/** One place for user feedback. Replaces alert(). */
export const notify = {
  success: (title: string, description?: string) => toast({ title, description }),
  info: (title: string, description?: string) => toast({ title, description }),
  error: (title: string, description?: string) =>
    toast({ title, description, variant: "destructive" }),
  /** Show an API failure with a friendly message and the request id for support. */
  apiError: (e: unknown) => {
    const d = describeError(e);
    toast({
      title: d.title,
      description: d.requestId ? `${d.message} (ref: ${d.requestId})` : d.message,
      variant: "destructive",
    });
  },
};
