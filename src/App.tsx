import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { config } from "@/config";
import { isApiError } from "@/api/errors";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { RequireRole } from "@/auth/RequireRole";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LoginFlow } from "./components/auth/LoginFlow";

// Third-party chat widgets are opt-in (VITE_ENABLE_DOCUCHAT) and loaded lazily.
const DocuChatPage = lazy(() => import("./components/DocChatWidget"));
const PoliceDocuChatWidget = lazy(() => import("./components/PoliiceDocChatWidget"));

// Each screen group loads on demand so the first page stays small.
const AdminHome = lazy(() => import("./pages/AdminHome"));
const Register = lazy(() => import("./pages/Register"));
const Privacy = lazy(() => import("./pages/Privacy"));
const ConsentSettings = lazy(() => import("./pages/ConsentSettings"));
const ComplaintDetailPage = lazy(() => import("./features/citizen/ComplaintDetailPage"));
const CitizenInterface = lazy(() => import("./components/CitizenInterface"));
const OfficerInterface = lazy(() => import("./features/officer/OfficerInterface"));
const MagistrateInterface = lazy(() => import("./features/officer/MagistrateInterface"));
const VoiceComplaintForm = lazy(() => import("./components/VoiceComplaintForm"));
const OfficerVoiceAssistant = lazy(() => import("./components/officevoiceassistant"));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, error) => !(isApiError(error) && error.status >= 400 && error.status < 500) && count < 2,
    },
  },
});

const OFFICER_ROLES = ["head_constable", "sub_inspector", "sho"] as const;

const CitizenRoute = () => {
  const { signOut } = useAuth();
  return (
    <>
      <CitizenInterface onBack={() => void signOut()} />
      {config.enableDocuChat && (
        <Suspense fallback={null}>
          <DocuChatPage />
        </Suspense>
      )}
    </>
  );
};

const OfficerRoute = () => {
  const { signOut } = useAuth();
  return (
    <>
      <OfficerInterface onBack={() => void signOut()} />
      {config.enableDocuChat && (
        <Suspense fallback={null}>
          <PoliceDocuChatWidget />
        </Suspense>
      )}
    </>
  );
};

const FileComplaintRoute = () => {
  const navigate = useNavigate();
  return <VoiceComplaintForm onBack={() => navigate("/citizen-dashboard")} />;
};

const MagistrateRoute = () => {
  const { signOut } = useAuth();
  return <MagistrateInterface onBack={() => void signOut()} />;
};

const OfficerVoiceRoute = () => {
  const navigate = useNavigate();
  return <OfficerVoiceAssistant onBack={() => navigate("/officer-dashboard")} />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginFlow />} />
              <Route path="/register" element={<Register />} />
              <Route path="/privacy" element={<Privacy />} />

              <Route element={<RequireRole roles={["citizen"]} />}>
                <Route path="/citizen-dashboard" element={<CitizenRoute />} />
                <Route path="/privacy-settings" element={<ConsentSettings />} />
                <Route path="/file-complaint" element={<FileComplaintRoute />} />
                <Route path="/complaint/:complaintId" element={<ComplaintDetailPage />} />
              </Route>

              <Route element={<RequireRole roles={[...OFFICER_ROLES]} />}>
                <Route path="/officer-dashboard" element={<OfficerRoute />} />
                <Route path="/officer-voice" element={<OfficerVoiceRoute />} />
              </Route>

              <Route element={<RequireRole roles={["magistrate"]} />}>
                <Route path="/magistrate" element={<MagistrateRoute />} />
              </Route>

              <Route element={<RequireRole roles={["admin"]} />}>
                <Route path="/admin" element={<AdminHome />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
