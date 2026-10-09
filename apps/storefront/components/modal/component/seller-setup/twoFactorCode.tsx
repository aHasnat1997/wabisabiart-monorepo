import React from "react";
import {
  FieldErrors,
  UseFormHandleSubmit,
  SubmitHandler,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SectionTitle from "@/components/SectionTitle";
import { Spinner } from "@/components/ui/spinner";
import { ShopFormValues } from "./setup-schema";

interface TwoFactorCodeStepProps {
  step: number;
  code: string[];
  errors: FieldErrors<ShopFormValues>;
  handleCodeChange: (index: number, value: string) => void;
  handleKeyDown: (index: number, e: React.KeyboardEvent) => void;
  handlePaste: (e: React.ClipboardEvent) => void;
  handleResend: () => void;
  handleSubmit: UseFormHandleSubmit<ShopFormValues>;
  onSubmit: SubmitHandler<ShopFormValues>;
  isLoading: boolean;
}

const TwoFactorCode: React.FC<TwoFactorCodeStepProps> = ({
  step,
  code,
  errors,
  handleCodeChange,
  handleKeyDown,
  handlePaste,
  handleResend,
  handleSubmit,
  onSubmit,
  isLoading,
}) => {
  if (step !== 9) return null;

  return (
    <div className="w-full">
      <SectionTitle
        title="Verify It's You."
        subtitle="Enter the 6-digit code we sent to your email.
        This step helps protect your account."
      />

      <div
        className="flex gap-1 md:gap-2 justify-between mb-6"
        onPaste={handlePaste}
      >
        {code.map((digit, index) => (
          <Input
            key={index}
            id={`code-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="h-10 md:h-16 w-10 md:w-16 text-center text-base md:text-2xl bg-muted border-0 rounded-md md:rounded-xl font-semibold"
          />
        ))}
      </div>

      <Button
        type="button"
        className="mb-4  h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
        onClick={handleSubmit(onSubmit)}
        disabled={code.join("").length !== 6 || isLoading}
      >
        Verify {isLoading && <Spinner />}
      </Button>

      <p className="text-center text-sm text-foreground">
        Didn&apos;t receive the code?{" "}
        <button
          disabled={isLoading}
          type="button"
          className="font-medium hover:underline cursor-pointer"
          onClick={handleResend}
        >
          {isLoading ? "Resending..." : "Resend"}
        </button>
      </p>
    </div>
  );
};

export default TwoFactorCode;
