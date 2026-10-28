import React, { useRef } from "react";
import { useTranslation } from "react-i18next";

interface OTPInputProps {
  otp: string;
  setOtp: (value: string) => void;
  disabled?: boolean;
}

const LENGTH = 6;

/**
 * Six boxes backed by one digit string. Accepts typing, pasting a whole code
 * and SMS autofill (several digits arriving in one box).
 */
export const OTPInput = ({ otp, setOtp, disabled = false }: OTPInputProps) => {
  const { t } = useTranslation();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const apply = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return;
    const next = (otp.slice(0, index) + digits).slice(0, LENGTH);
    setOtp(next);
    inputRefs.current[Math.min(next.length, LENGTH - 1)]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key !== "Backspace") return;
    e.preventDefault();
    const keep = otp[index] ? index : Math.max(index - 1, 0);
    setOtp(otp.slice(0, keep));
    inputRefs.current[keep]?.focus();
  };

  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length: LENGTH }).map((_, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={t("common.digit", { n: index + 1 })}
          value={otp[index] || ""}
          onChange={(e) => apply(index, e.target.value)}
          onPaste={(e) => {
            e.preventDefault();
            apply(0, e.clipboardData.getData("text"));
          }}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={(e) => e.target.select()}
          ref={(el) => (inputRefs.current[index] = el)}
          disabled={disabled}
          className="w-12 h-14 text-center text-xl font-medium rounded-xl shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      ))}
    </div>
  );
};
