import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Consent, consentsApi } from "@/api/consents";
import { notify } from "@/lib/notify";

const ConsentSettings = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const consents = useQuery({ queryKey: ["consents"], queryFn: consentsApi.list });

  const update = useMutation({
    mutationFn: (v: { purpose: Consent["purpose"]; granted: boolean }) => consentsApi.update(v.purpose, v.granted),
    onSuccess: (list) => qc.setQueryData(["consents"], list),
    onError: notify.apiError,
  });

  const download = async () => {
    try {
      const data = await consentsApi.exportData();
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-smartcop-data.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      notify.apiError(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/citizen-dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Privacy and consent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {consents.isLoading && <p role="status">Loading...</p>}
            {consents.isError && <p role="alert" className="text-red-600">We could not load your settings.</p>}
            {consents.data?.map((c) => (
              <div key={c.purpose} className="flex items-center justify-between gap-4">
                <label htmlFor={`consent-${c.purpose}`} className="text-sm">
                  {c.label}
                </label>
                <Switch
                  id={`consent-${c.purpose}`}
                  checked={c.granted}
                  disabled={update.isPending}
                  onCheckedChange={(granted) => update.mutate({ purpose: c.purpose, granted })}
                />
              </div>
            ))}
            <p className="text-xs text-gray-500">Turning off AI processing disables AI help; you can still file and track complaints.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your data</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => void download()}>
              <Download className="h-4 w-4 mr-2" />
              Download my data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsentSettings;
