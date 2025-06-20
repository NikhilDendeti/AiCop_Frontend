import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { DocuChatWidget } from "./components/DocChatWidget";
import { CitizenDashboard } from "./components/CitizenDashboard";
import { OfficerDashboard } from "./components/OfficerDashboard";
import CitizenInterface from "./components/CitizenInterface";
import OfficerInterface from "./components/OfficerInterface";
import { LoginFlow } from "./components/auth/LoginFlow";

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
              <CitizenInterface onBack={() => console.log("Back clicked")} />
            }
          />
          <Route
            path="/officer-dashboard"
            element={
              <OfficerInterface onBack={() => console.log("Back clicked")} />
            }
          />
          {/* Fallback route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <DocuChatWidget />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
