import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { OTPInput } from "./otpinput";

interface LoginFlowProps {
  userType: "citizen" | "officer";
  onLogin: () => void;
  onBack: () => void;
}

export const LoginFlow = ({ userType, onLogin, onBack }: LoginFlowProps) => {
  const navigate = useNavigate();

  const [step, setStep] = useState<"welcome" | "mobile" | "otp">("welcome");
  const [flowType, setFlowType] = useState<"digilocker" | "signup" | null>(
    null
  );
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = (type: "digilocker" | "signup") => {
    setFlowType(type);
    if (type === "digilocker") {
      alert("✅ DigiLocker verified successfully.");
    }
    setStep("mobile");
  };

  const handleMobileSubmit = () => {
    if (mobileNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError(null);
    setStep("otp");
  };

  const handleOTPSubmit = async () => {
    if (!otp) {
      setError("Please enter OTP.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await new Promise((res) => setTimeout(res, 1000)); // Simulate API

      if (
        (userType === "citizen" && otp === "211213") ||
        (userType === "officer" && otp === "121212")
      ) {
        navigate(
          userType === "citizen" ? "/citizen-dashboard" : "/officer-dashboard"
        );
        onLogin();
      } else {
        setError("Invalid OTP. Try again.");
      }
    } catch {
      setError("Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-white to-blue-100" />

      <Card className="w-full max-w-md relative z-10 rounded-2xl shadow-xl bg-white/80 backdrop-blur-md border border-gray-200 transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="pt-6 pb-3 text-center">
          <CardTitle className="text-3xl font-semibold text-gray-800">
            {userType === "citizen" ? "Citizen Login" : "Officer Login"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-8">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Welcome Step */}
          {step === "welcome" && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <img
                  src="/public/assests/DigilockerLogo.svg"
                  alt="DigiLocker"
                  className="w-32 h-auto mb-2"
                />
              </div>

              <Button
                className="w-full transition-transform duration-200 hover:scale-[1.02] hover:shadow-md"
                onClick={() => handleStart("digilocker")}
              >
                Sign in with DigiLocker
              </Button>

              <div className="text-center text-sm text-gray-500">or</div>

              <Button
                variant="outline"
                className="w-full transition-transform duration-200 hover:scale-[1.02]"
                onClick={() => handleStart("signup")}
              >
                Sign Up
              </Button>
            </div>
          )}

          {/* Mobile Number Step */}
          {step === "mobile" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  disabled={isSubmitting}
                />
              </div>
              <Button
                onClick={handleMobileSubmit}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="otp">OTP</Label>
                <OTPInput otp={otp} setOtp={setOtp} disabled={isSubmitting} />
              </div>
              <Button
                onClick={handleOTPSubmit}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </div>
          )}

          {/* Back Button */}
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full mt-2 transition-transform hover:scale-105"
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
