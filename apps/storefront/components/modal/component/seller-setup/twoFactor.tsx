// TwoFactor.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import { Spinner } from "@/components/ui/spinner";

interface TwoFactorStepProps {
  step: number;
  email: string;
  handleEnable2FA: () => void;
  handleSkip2FA: () => void;
  isLoading: boolean;
}

export const TwoFactor: React.FC<TwoFactorStepProps> = ({
  step,
  email,
  handleEnable2FA,
  handleSkip2FA,
  isLoading,
}) => {
  if (step !== 8) return null;

  return (
    <div className="w-full">
      <SectionTitle
        title="Protect Your Seller Account"
        subtitle="Two-factor authentication adds an extra layer of security to your account, protecting your transactions and payouts."
      />

      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-2 p-3 md:p-4 bg-background rounded-lg text-sm md:text-base md:rounded-xl">
          <span className="mt-1">
            <Mail size={20} className="text-muted-foreground" />
          </span>
          <div className="space-y-2">
            <p className="font-semibold text-foreground">
              Receive codes via email
            </p>
            <p className="text-muted-foreground leading-5">
              A verification code will be sent to your registered email address
              every time you log in or confirm a transaction.
            </p>
            <p className="font-semibold text-foreground">
              Current email: {email}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          disabled={isLoading}
          type="button"
          className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
          onClick={handleEnable2FA}
        >
          Enable two factor authentication {isLoading && <Spinner />}
        </Button>
        <Button
          type="button"
          className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full border border-primary text-primary"
          variant="ghost"
          onClick={handleSkip2FA}
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
};

export default TwoFactor;
