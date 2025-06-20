// components/auth/LoginRedirectWrapper.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { LoginFlow } from "../LoginFlow";

export const LoginRedirectWrapper = () => {
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
