import React, { useRef } from "react";

interface OTPInputProps {
  otp: string;
  setOtp: (value: string) => void;
  disabled?: boolean;
}

export const OTPInput = ({ otp, setOtp, disabled = false }: OTPInputProps) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const otpArray = otp.split("");
    otpArray[index] = value;
    setOtp(otpArray.join(""));

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el) => (inputRefs.current[index] = el)}
          disabled={disabled}
          className="w-12 h-14 text-center text-xl font-medium rounded-xl shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      ))}
    </div>
  );
};
