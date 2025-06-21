import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DocuChatPage from "./components/DocChatWidget";
import { CitizenDashboard } from "./components/CitizenDashboard";
import { OfficerDashboard } from "./components/OfficerDashboard";
import CitizenInterface from "./components/CitizenInterface";
import OfficerInterface from "./components/OfficerInterface";
import { LoginFlow } from "./components/auth/LoginFlow";
import ComplaintPreview from "./components/complaintpreview";
import VoiceComplaintForm from "./components/VoiceComplaintForm"; // <- Ensure this is imported if routing directly
import PoliceDocuChatWidget from "./components/PoliiceDocChatWidget";
import OfficerVoiceAssistant from "./components/officevoiceassistant";

const queryClient = new QueryClient();

// Wrapper for login route with dynamic redirection
const LoginRedirectWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const userType = (searchParams.get("type") || "citizen") as
    | "citizen"
    | "officer";

  return (
    <LoginFlow
      userType={userType}
      onLogin={() => {
        if (userType === "citizen") {
          navigate("/citizen-dashboard");
        } else {
          navigate("/officer-dashboard");
        }
      }}
      onBack={() => navigate("/")}
    />
  );
};

const ComplaintPreviewWrapper = () => {
  const { complaintId } = useParams();
  return <ComplaintPreview complaintId={complaintId || ""} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginRedirectWrapper />} />
          <Route
            path="/citizen-dashboard"
            element={
              <>
                <CitizenInterface onBack={() => console.log("Back clicked")} />
                <DocuChatPage />
              </>
            }
          />
          <Route
            path="/officer-dashboard"
            element={
              <>
                <OfficerInterface onBack={() => console.log("Back clicked")} />
                <PoliceDocuChatWidget />
              </>
            }
          />
          <Route
            path="/complaint/:complaintId"
            element={<ComplaintPreviewWrapper />}
          />
          <Route
            path="/file-complaint"
            element={<VoiceComplaintForm onBack={() => {}} />}
          />
          <Route
            path="/officer-voice"
            element={
              <OfficerVoiceAssistant
                onBack={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
            }
          />
          {/* Fallback route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
