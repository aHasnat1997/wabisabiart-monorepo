import React from "react";
import { UseFormHandleSubmit, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Radio,
  RadioIndicator,
  RadioGroup,
} from "@/components/animate-ui/primitives/base/radio";
import SectionTitle from "@/components/SectionTitle";
import { Spinner } from "@/components/ui/spinner";
import { SellerFormValues } from "./signup-schema";

interface VerificationMethodStepProps {
  step: number;
  selectedMethod: string;
  setSelectedMethod: (value: "sms" | "email") => void;
  handleSubmit: UseFormHandleSubmit<SellerFormValues>;
  onSubmit: SubmitHandler<SellerFormValues>;
  isLoading: boolean;
}

const VerificationMethod: React.FC<VerificationMethodStepProps> = ({
  step,
  selectedMethod,
  setSelectedMethod,
  handleSubmit,
  onSubmit,
  isLoading,
}) => {
  if (step !== 2) return null;

  return (
    <div className="w-full">
      <SectionTitle
        title="Choose Your Verification Method"
        subtitle="For your security, Two-Factor Authentication (2FA) is required to access your account."
      />

      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) => setSelectedMethod(value as "sms" | "email")}
        className="space-y-3 mb-6 mt-6"
      >
        <div className="flex flex-col gap-3">
          <label
            htmlFor="sms"
            className={`flex items-center gap-x-3 p-3 md:p-4 rounded-lg md:rounded-xl cursor-pointer transition-colors ${
              selectedMethod === "sms"
                ? "bg-muted"
                : "bg-background hover:bg-muted/50"
            }`}
          >
            <Radio
              value="sms"
              id="sms"
              className="w-5 h-5 border-2 rounded-full flex items-center justify-center data-[state=checked]:border-primary"
            >
              <RadioIndicator className="w-2.5 h-2.5 rounded-full bg-primary opacity-0 transition-opacity data-[state=checked]:opacity-100" />
            </Radio>
            <div className="flex-1">
              <div className="text-base font-semibold text-foreground">
                SMS Verification
              </div>
              <p className="text-sm text-muted-foreground">
                Get a 6-digit code via SMS.
              </p>
            </div>
          </label>

          <label
            htmlFor="email"
            className={`flex items-center gap-x-3 p-3 md:p-4 rounded-lg md:rounded-xl cursor-pointer transition-colors ${
              selectedMethod === "email"
                ? "bg-muted"
                : "bg-background hover:bg-muted/50"
            }`}
          >
            <Radio
              value="email"
              id="email"
              className="w-5 h-5 border-2 rounded-full flex items-center justify-center data-[state=checked]:border-primary"
            >
              <RadioIndicator className="w-2.5 h-2.5 rounded-full bg-primary opacity-0 transition-opacity data-[state=checked]:opacity-100" />
            </Radio>
            <div className="flex-1">
              <div className="text-base font-semibold text-foreground">
                Email Verification
              </div>
              <p className="text-sm text-muted-foreground">
                Receive a 6-digit code via email.
              </p>
            </div>
          </label>
        </div>
      </RadioGroup>

      <p className="text-xs text-muted-foreground mb-4">
        Your preferred method will be used automatically next time you log in.
      </p>

      <Button
        disabled={isLoading}
        type="button"
        className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
        onClick={handleSubmit(onSubmit)}
      >
        {selectedMethod === "sms"
          ? "Verify with Phone Number"
          : "Verify with Email"}{" "}
        {isLoading && <Spinner />}
      </Button>
    </div>
  );
};

export default VerificationMethod;
