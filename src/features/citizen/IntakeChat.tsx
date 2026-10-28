import { useState } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notify } from "@/lib/notify";
import { IntakeReply, citizenApi } from "./api";

type Report = NonNullable<IntakeReply["report"]>;
interface Msg {
  role: "user" | "assistant";
  content: string;
  emergency?: boolean;
}

/** Optional AI chat that collects the details and hands a report back to the form to review. */
export function IntakeChat({ language, onReport }: { language: string; onReport: (r: Report) => void }) {
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [disclosure, setDisclosure] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const start = async () => {
    setBusy(true);
    try {
      const c = await citizenApi.startIntake(language);
      setConversationId(c.conversation_id);
      setDisclosure(c.disclosure);
      setOpen(true);
    } catch (e) {
      notify.apiError(e);
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    const content = text.trim();
    if (!content || !conversationId) return;
    setText("");
    setMessages((m) => [...m, { role: "user", content }]);
    setBusy(true);
    try {
      const r = await citizenApi.intakeMessage(conversationId, content);
      if (!r.ai_available) {
        setUnavailable(true);
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: r.reply, emergency: r.emergency }]);
      if (r.ready && r.report) {
        onReport(r.report);
        notify.success("Details filled in", "Please review them below before submitting.");
      }
    } catch (e) {
      notify.apiError(e);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <Button type="button" variant="outline" className="mb-6" onClick={() => void start()} disabled={busy}>
        <Bot className="h-4 w-4 mr-2" />
        Describe it in a chat instead (AI)
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          Chat assistant <Badge variant="outline">AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-gray-600">{disclosure}</p>
        {unavailable && (
          <p role="alert" className="text-sm text-amber-800 bg-amber-50 rounded p-2">
            The chat assistant is not available right now. Please continue with the form below.
          </p>
        )}
        <div className="space-y-2 max-h-64 overflow-y-auto" aria-live="polite">
          {messages.map((m, i) => (
            <p
              key={i}
              className={
                m.emergency
                  ? "text-sm rounded p-2 bg-red-100 text-red-900 font-semibold"
                  : m.role === "user"
                  ? "text-sm rounded p-2 bg-blue-50"
                  : "text-sm rounded p-2 bg-gray-50"
              }
            >
              {m.content}
            </p>
          ))}
        </div>
        {!unavailable && (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <Input aria-label="Your message" maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} disabled={busy} />
            <Button type="submit" disabled={busy || !text.trim()}>
              Send
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
