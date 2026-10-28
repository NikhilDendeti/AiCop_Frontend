import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { OTPInput } from "./otpinput";
import { authApi, homePathFor } from "@/api/auth";
import { isApiError } from "@/api/errors";
import { useAuth } from "@/auth/AuthContext";

const RESEND_SECONDS = 60;
const PHONE_RE = /^\d{10}$/;

type T = (key: string) => string;

/** Plain-language text for a failed OTP request or verification. */
export function otpErrorMessage(e: unknown, step: "phone" | "otp", t: T): string {
  if (!isApiError(e)) return t("login.errors.generic");
  if (e.isNetwork) return t("login.errors.network");
  if (e.status === 429) return step === "otp" ? t("login.errors.locked") : t("login.errors.wait");
  if (e.status === 401) return t("login.errors.wrongCode");
  if (e.status === 403) return t("login.errors.inactive");
  if (e.status === 503) return t("login.errors.noSms");
  return e.message;
}

export const LoginFlow = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, user, signIn, sessionEnded } = useAuth();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (status === "authenticated" && user) return <Navigate to={homePathFor(user.role)} replace />;

  const requestCode = async () => {
    if (!PHONE_RE.test(phone)) {
      setError(t("login.errors.phone"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await authApi.requestOtp(phone);
      setOtp("");
      setStep("otp");
      setCooldown(RESEND_SECONDS);
    } catch (e) {
      setError(otpErrorMessage(e, "phone", t));
      if (isApiError(e) && e.status === 429) setCooldown(RESEND_SECONDS);
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    if (otp.length !== 6) {
      setError(t("login.errors.code"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const tokens = await authApi.verifyOtp(phone, otp);
      const me = await signIn(tokens);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from !== "/login" ? from : homePathFor(me.role), { replace: true });
    } catch (e) {
      setError(otpErrorMessage(e, "otp", t));
      setOtp("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-white to-blue-100" />

      <Card className="w-full max-w-md relative z-10 rounded-2xl shadow-xl bg-white/80 backdrop-blur-md border border-gray-200">
        <CardHeader className="pt-6 pb-3 text-center">
          <LanguageSwitcher className="flex gap-1 justify-center mb-3" />
          <CardTitle className="text-3xl font-semibold text-gray-800">{t("login.title")}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-8">
          {sessionEnded && !error && (
            <Alert>
              <AlertDescription>{t("login.sessionEnded")}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
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
                <Label htmlFor="mobile">{t("login.mobile")}</Label>
                <Input
                  id="mobile"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder={t("login.mobilePlaceholder")}
                  disabled={busy}
                />
              </div>
              <Button type="submit" disabled={busy} className="w-full">
                {busy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("login.sendingCode")}
                  </>
                ) : (
                  t("login.sendCode")
                )}
              </Button>

              <div className="text-center text-sm text-gray-500">{t("login.or")}</div>
              <Button type="button" variant="outline" className="w-full" disabled>
                {t("login.digilocker")}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void verifyCode();
              }}
            >
              <p className="text-sm text-gray-600 text-center">
                {t("login.codeSent", { last4: phone.slice(-4) })}
              </p>
              <div>
                <OTPInput otp={otp} setOtp={setOtp} disabled={busy} />
              </div>
              <Button type="submit" disabled={busy} className="w-full">
                {busy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("login.verifying")}
                  </>
                ) : (
                  t("login.verify")
                )}
              </Button>
              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => {
                    setStep("phone");
                    setError(null);
                  }}
                >
                  {t("login.changeNumber")}
                </button>
                <button
                  type="button"
                  className="text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                  disabled={cooldown > 0 || busy}
                  onClick={() => void requestCode()}
                >
                  {cooldown > 0 ? t("login.resendIn", { seconds: cooldown }) : t("login.resend")}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-600">
            {t("login.newHere")}{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              {t("login.createAccount")}
            </Link>
          </p>

          <Button variant="outline" onClick={() => navigate("/")} className="w-full">
            {t("login.backHome")}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
};
