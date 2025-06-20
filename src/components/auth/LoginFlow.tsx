// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Loader2 } from "lucide-react";
// import { DocuChatWidget } from "../DocChatWidget";

// interface LoginFlowProps {
//   userType: "citizen" | "officer";
//   onLogin: () => void;
//   onBack: () => void;
// }

// export const LoginFlow = ({ userType, onLogin, onBack }: LoginFlowProps) => {
//   const navigate = useNavigate();
//   const [step, setStep] = useState<"mobile" | "otp" | "digilocker">("mobile");
//   const [mobileNumber, setMobileNumber] = useState("");
//   const [otp, setOtp] = useState("");
//   const [isExistingUser, setIsExistingUser] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleOTPSubmit = async () => {
//     if (!otp) {
//       setError("Please enter OTP");
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       // Here you would typically make an API call to verify the OTP
//       // For now, we'll simulate a successful verification
//       await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

//       // Clear the error state
//       setError(null);

//       // Redirect based on user type
//       if (userType === "citizen") {
//         navigate("/citizen-dashboard");
//       } else {
//         navigate("/officer-dashboard");
//       }

//       // Also call the onLogin callback
//       onLogin();
//     } catch (error) {
//       setError("Invalid OTP. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogin = async () => {
//     try {
//       setIsSubmitting(true);
//       setError(null);

//       // Mock API call - replace with actual implementation
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       // For existing users, just verify mobile and OTP
//       if (isExistingUser) {
//         // Mock OTP verification
//         if (otp === "123456") {
//           onLogin();
//         } else {
//           setError("Invalid OTP");
//         }
//       } else {
//         // For new users, mock DigiLocker verification
//         if (mobileNumber.length === 10 && otp === "123456") {
//           onLogin();
//         } else {
//           setError(
//             "Please verify your DigiLocker and enter valid mobile number"
//           );
//         }
//       }
//     } catch (err) {
//       setError("Failed to authenticate");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleMobileSubmit = () => {
//     if (mobileNumber.length !== 10) {
//       setError("Please enter a valid 10 digit mobile number");
//       return;
//     }

//     if (isExistingUser) {
//       setStep("otp");
//     } else {
//       setStep("digilocker");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 relative">
//       <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" />

//       <Card className="w-full max-w-md relative z-10">
//         <CardHeader>
//           <CardTitle className="text-2xl text-center">
//             {userType === "citizen" ? "Citizen Login" : "Officer Login"}
//           </CardTitle>
//         </CardHeader>

//         <CardContent className="space-y-6">
//           {error && (
//             <Alert variant="destructive">
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}

//           {step === "mobile" && (
//             <div>
//               <div>
//                 <Label>New User? Verify with DigiLocker</Label>
//                 <div className="flex items-center space-x-2 mt-2">
//                   <input
//                     type="checkbox"
//                     checked={isExistingUser}
//                     onChange={() => setIsExistingUser(!isExistingUser)}
//                     className="rounded border-gray-300 text-primary focus:ring-primary"
//                   />
//                   <span>Existing User</span>
//                 </div>
//               </div>

//               <div className="space-y-4 mt-4">
//                 <div>
//                   <Label>Mobile Number</Label>
//                   <Input
//                     type="tel"
//                     value={mobileNumber}
//                     onChange={(e) => setMobileNumber(e.target.value)}
//                     placeholder="Enter 10 digit mobile number"
//                     disabled={isSubmitting}
//                   />
//                 </div>
//               </div>

//               <Button
//                 onClick={handleMobileSubmit}
//                 disabled={isSubmitting}
//                 className="w-full"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Submit
//                   </>
//                 ) : (
//                   "Submit"
//                 )}
//               </Button>
//             </div>
//           )}

//           {step === "digilocker" && (
//             <div className="space-y-4">
//               <Button
//                 className="w-full"
//                 onClick={() => {
//                   // In real implementation, this would redirect to DigiLocker
//                   alert("Please verify your DigiLocker credentials");
//                   setStep("otp");
//                 }}
//               >
//                 Verify with DigiLocker
//               </Button>
//               <div className="text-sm text-gray-500 text-center">
//                 After verification, enter your mobile number below
//               </div>
//             </div>
//           )}

//           {step === "otp" && (
//             <div className="space-y-4">
//               <div>
//                 <Label>OTP</Label>
//                 <Input
//                   type="text"
//                   value={otp}
//                   onChange={(e) => setOtp(e.target.value)}
//                   placeholder="Enter OTP"
//                   disabled={isSubmitting}
//                 />
//               </div>

//               <Button
//                 onClick={handleLogin}
//                 disabled={isSubmitting}
//                 className="w-full"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Verify
//                   </>
//                 ) : (
//                   "Verify"
//                 )}
//               </Button>
//             </div>
//           )}

//           <Button variant="outline" onClick={onBack} className="w-full">
//             Back to Home
//           </Button>
//         </CardContent>
//       </Card>

//       <DocuChatWidget />
//     </div>
//   );
// };

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { DocuChatWidget } from "../DocChatWidget";

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

      if (otp === "123456") {
        if (userType === "citizen") {
          navigate("/citizen-dashboard");
        } else {
          navigate("/officer-dashboard");
        }
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
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" />

      <Card className="w-full max-w-md relative z-10">
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

          {step === "welcome" && (
            <div className="space-y-4">
              <Button
                className="w-full"
                onClick={() => handleStart("digilocker")}
              >
                Sign in with DigiLocker
              </Button>
              <div className="text-center text-sm text-gray-500">or</div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleStart("signup")}
              >
                Sign Up
              </Button>
            </div>
          )}

          {step === "mobile" && (
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

          {step === "otp" && (
            <div className="space-y-4">
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

          <Button variant="outline" onClick={onBack} className="w-full">
            Back to Home
          </Button>
        </CardContent>
      </Card>

      <DocuChatWidget />
    </div>
  );
};
