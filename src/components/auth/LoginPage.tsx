import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
  userType: "citizen" | "officer";
}

export const LoginPage = ({ onLogin, userType }: LoginPageProps) => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isExistingUser, setIsExistingUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Mock API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For existing users, just verify mobile and OTP
      if (isExistingUser) {
        // Mock OTP verification
        if (otp === "123456") {
          onLogin();
        } else {
          setError("Invalid OTP");
        }
      } else {
        // For new users, mock DigiLocker verification
        // In real implementation, this would redirect to DigiLocker
        if (mobileNumber.length === 10 && otp === "123456") {
          onLogin();
        } else {
          setError(
            "Please verify your DigiLocker and enter valid mobile number"
          );
        }
      }
    } catch (err) {
      setError("Failed to authenticate");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {userType === "citizen" ? "Citizen Login" : "Officer Login"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div>
            <Label>New User? Verify with DigiLocker</Label>
            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                checked={isExistingUser}
                onChange={() => setIsExistingUser(!isExistingUser)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span>Existing User</span>
            </div>
          </div>

          {!isExistingUser && (
            <div className="space-y-4">
              <Button
                className="w-full"
                onClick={() => {
                  // In real implementation, this would redirect to DigiLocker
                  alert("Please verify your DigiLocker credentials");
                }}
              >
                Verify with DigiLocker
              </Button>
              <div className="text-sm text-gray-500 text-center">
                After verification, enter your mobile number below
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label>Mobile Number</Label>
              <Input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter 10 digit mobile number"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label>OTP</Label>
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Login"
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => onLogin()}
            className="w-full"
          >
            Skip Login (For Demo)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
