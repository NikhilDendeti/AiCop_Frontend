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
import AdminHome from "./pages/AdminHome";
import Register from "./pages/Register";
import Privacy from "./pages/Privacy";
import ConsentSettings from "./pages/ConsentSettings";
import { LoginFlow } from "./components/auth/LoginFlow";
import CitizenInterface from "./components/CitizenInterface";
import OfficerInterface from "./features/officer/OfficerInterface";
import MagistrateInterface from "./features/officer/MagistrateInterface";
import ComplaintDetailPage from "./features/citizen/ComplaintDetailPage";
import VoiceComplaintForm from "./components/VoiceComplaintForm";
import OfficerVoiceAssistant from "./components/officevoiceassistant";

// Third-party chat widgets are opt-in (VITE_ENABLE_DOCUCHAT) and loaded lazily.
const DocuChatPage = lazy(() => import("./components/DocChatWidget"));
const PoliceDocuChatWidget = lazy(() => import("./components/PoliiceDocChatWidget"));

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
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
