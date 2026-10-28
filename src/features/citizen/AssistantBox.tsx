import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notify } from "@/lib/notify";
import { citizenApi } from "./api";

/** Ask about the status of this complaint. Answers are AI-generated and shown as such. */
export function AssistantBox({ complaintId }: { complaintId: string }) {
  const [question, setQuestion] = useState("");
  const ask = useMutation({
    mutationFn: () => citizenApi.ask(complaintId, question.trim()),
    onError: notify.apiError,
  });
  const r = ask.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Ask about this complaint <Badge variant="outline">AI-generated answers</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (question.trim()) ask.mutate();
          }}
        >
          <Input
            aria-label="Your question"
            placeholder="For example: what happens next?"
            maxLength={500}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button type="submit" disabled={!question.trim() || ask.isPending}>
            Ask
          </Button>
        </form>
        {r && !r.ai_available && (
          <p className="text-sm text-gray-700" role="status">
            The assistant is not available right now. Please contact your police station for an update.
          </p>
        )}
        {r?.ai_available && (
          <div className="text-sm space-y-2" role="status">
            <p className="whitespace-pre-wrap">{r.answer}</p>
            {r.needs_human && <p className="text-amber-700">This needs a person. Please contact your police station.</p>}
            <p className="text-xs text-gray-500">AI-generated. It does not replace advice from the police or a lawyer.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
