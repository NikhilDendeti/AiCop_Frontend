import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OTPInput } from "@/components/auth/otpinput";
import { authApi, homePathFor } from "@/api/auth";
import { POLICY_VERSION } from "@/api/consents";
import { isApiError } from "@/api/errors";
import { useAuth } from "@/auth/AuthContext";

const RESEND_SECONDS = 60;

type Step = "phone" | "details";

interface Form {
  name: string;
  date_of_birth: string;
  gender: "" | "male" | "female" | "other";
  permanent_address: string;
  email: string;
  aadhar_number: string;
  consentComplaint: boolean;
  consentAi: boolean;
}

const EMPTY: Form = {
  name: "",
  date_of_birth: "",
  gender: "",
  permanent_address: "",
  email: "",
  aadhar_number: "",
  consentComplaint: true,
  consentAi: false,
};

const Register = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const requestCode = async () => {
    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await authApi.requestRegistration(phone);
      setCode("");
      setStep("details");
      setCooldown(RESEND_SECONDS);
    } catch (e) {
      setError(isApiError(e) ? e.message : "Something went wrong. Please try again.");
      if (isApiError(e) && e.status === 429) setCooldown(RESEND_SECONDS);
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    setError(null);
    setFieldErrors({});
    const local: Record<string, string> = {};
    if (code.length !== 6) local.code = "Enter the 6-digit code.";
    if (form.name.trim().length < 2) local.name = "Enter your full name.";
    if (!form.date_of_birth) local.date_of_birth = "Enter your date of birth.";
    if (!form.permanent_address.trim()) local.permanent_address = "Enter your address.";
    if (Object.keys(local).length) {
      setFieldErrors(local);
      return;
    }
    setBusy(true);
    try {
      const tokens = await authApi.verifyRegistration({
        phone,
        code,
        name: form.name.trim(),
        date_of_birth: form.date_of_birth,
        ...(form.gender ? { gender: form.gender } : {}),
        permanent_address: form.permanent_address.trim(),
        ...(form.email ? { email: form.email.trim() } : {}),
        ...(form.aadhar_number ? { aadhar_number: form.aadhar_number.replace(/\s/g, "") } : {}),
        consents: [
          { purpose: "complaint_processing", policy_version: POLICY_VERSION, granted: form.consentComplaint },
          { purpose: "ai_processing", policy_version: POLICY_VERSION, granted: form.consentAi },
        ],
      });
      const me = await signIn(tokens);
      navigate(homePathFor(me.role), { replace: true });
    } catch (e) {
      if (!isApiError(e)) {
        setError("Something went wrong. Please try again.");
      } else if (e.code === "already_registered") {
        setError("This number already has an account. Please sign in instead.");
      } else if (e.code === "validation_error" && e.fieldErrors.aadhar_number) {
        // The code is used up once the Aadhaar check runs: a new one is needed.
        setError(`${e.fieldErrors.aadhar_number} Please request a new code and try again.`);
        setStep("phone");
      } else if (e.code === "validation_error") {
        setFieldErrors(e.fieldErrors);
      } else if (e.status === 401) {
        setFieldErrors({ code: "That code is incorrect or has expired." });
      } else if (e.status === 429) {
        setError("Too many incorrect attempts. Please request a new code later.");
      } else {
        setError(e.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const err = (k: string) =>
    fieldErrors[k] ? (
      <p className="text-sm text-red-600 mt-1" role="alert">
        {fieldErrors[k]}
      </p>
    ) : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-white to-blue-100" />
      <Card className="w-full max-w-lg relative z-10 rounded-2xl shadow-xl bg-white/80 backdrop-blur-md border border-gray-200">
        <CardHeader className="pt-6 pb-3 text-center">
          <CardTitle className="text-3xl font-semibold text-gray-800">Create account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-6 pb-8">
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>
                {error}{" "}
                {error.includes("sign in") && (
                  <Link to="/login" className="underline">
                    Go to sign in
                  </Link>
                )}
              </AlertDescription>
            </Alert>
          )}

          {step === "phone" && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void requestCode();
              }}
            >
              <div>
                <Label htmlFor="reg-mobile">Mobile Number</Label>
                <Input
                  id="reg-mobile"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  disabled={busy}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send code
              </Button>
            </form>
          )}

          {step === "details" && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <div>
                <Label>Code sent to ******{phone.slice(-4)}</Label>
                <OTPInput otp={code} setOtp={setCode} disabled={busy} />
                {err("code")}
                <div className="flex justify-between text-sm mt-2">
                  <button type="button" className="text-blue-600 hover:underline" onClick={() => setStep("phone")}>
                    Change number
                  </button>
                  <button
                    type="button"
                    className="text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                    disabled={cooldown > 0 || busy}
                    onClick={() => void requestCode()}
                  >
                    {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="reg-name">Full name</Label>
                <Input id="reg-name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} disabled={busy} />
                {err("name")}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reg-dob">Date of birth</Label>
                  <Input
                    id="reg-dob"
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    autoComplete="bday"
                    value={form.date_of_birth}
                    onChange={(e) => set("date_of_birth", e.target.value)}
                    disabled={busy}
                  />
                  {err("date_of_birth")}
                </div>
                <div>
                  <Label htmlFor="reg-gender">Gender (optional)</Label>
                  <select
                    id="reg-gender"
                    className="w-full h-10 border border-input rounded-md px-3 text-sm bg-background"
                    value={form.gender}
                    onChange={(e) => set("gender", e.target.value as Form["gender"])}
                    disabled={busy}
                  >
                    <option value="">Prefer not to say</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="reg-address">Permanent address</Label>
                <Input
                  id="reg-address"
                  autoComplete="street-address"
                  value={form.permanent_address}
                  onChange={(e) => set("permanent_address", e.target.value)}
                  disabled={busy}
                />
                {err("permanent_address")}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reg-email">Email (optional)</Label>
                  <Input id="reg-email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} disabled={busy} />
                  {err("email")}
                </div>
                <div>
                  <Label htmlFor="reg-aadhar">Aadhaar number (optional)</Label>
                  <Input
                    id="reg-aadhar"
                    inputMode="numeric"
                    value={form.aadhar_number}
                    onChange={(e) => set("aadhar_number", e.target.value.replace(/[^\d ]/g, "").slice(0, 14))}
                    disabled={busy}
                  />
                  {err("aadhar_number")}
                </div>
              </div>

              <fieldset className="space-y-2 border rounded-lg p-3">
                <legend className="px-1 text-sm font-medium">Your consent</legend>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-1" checked={form.consentComplaint} onChange={(e) => set("consentComplaint", e.target.checked)} />
                  <span>Process my details to register and handle my complaints.</span>
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-1" checked={form.consentAi} onChange={(e) => set("consentAi", e.target.checked)} />
                  <span>Use AI to help classify complaints and answer questions. Optional; you can change this any time.</span>
                </label>
                <p className="text-xs text-gray-500">
                  See the{" "}
                  <Link to="/privacy" className="underline" target="_blank">
                    privacy page
                  </Link>
                  .
                </p>
              </fieldset>

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create account
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
