import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthContext";
import { AIConfigPanel } from "@/features/admin/AIConfigPanel";
import { UsagePanel } from "@/features/admin/UsagePanel";

/** Admin: AI settings (with the kill switch) and AI usage. */
const AdminHome = () => {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<"settings" | "usage">("settings");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm border-b-2 border-blue-400">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Admin</h1>
            <p className="text-xs md:text-sm text-gray-600">{user?.name} · AI operations</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => void signOut()}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <div className="flex gap-2" role="tablist">
          <Button role="tab" aria-selected={tab === "settings"} size="sm" variant={tab === "settings" ? "default" : "outline"} onClick={() => setTab("settings")}>
            AI settings
          </Button>
          <Button role="tab" aria-selected={tab === "usage"} size="sm" variant={tab === "usage" ? "default" : "outline"} onClick={() => setTab("usage")}>
            Usage
          </Button>
        </div>
        {tab === "settings" ? <AIConfigPanel /> : <UsagePanel />}
      </main>
    </div>
  );
};

export default AdminHome;
