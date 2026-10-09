import React from "react";
import {
  Control,
  FieldErrors,
  UseFormHandleSubmit,
  SubmitHandler,
  Controller,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import SectionTitle from "@/components/SectionTitle";
import { Spinner } from "@/components/ui/spinner";
import { SellerFormValues } from "./signup-schema";

interface PhoneNumberStepProps {
  step: number;
  control: Control<SellerFormValues>;
  errors: FieldErrors<SellerFormValues>;
  handleSubmit: UseFormHandleSubmit<SellerFormValues>;
  onSubmit: SubmitHandler<SellerFormValues>;
  isLoading: boolean;
}

const PhoneNumber: React.FC<PhoneNumberStepProps> = ({
  step,
  control,
  errors,
  handleSubmit,
  onSubmit,
  isLoading,
}) => {
  if (step !== 3) return null;

  return (
    <div className="w-full">
      <SectionTitle
        title="Verify Your Phone Number"
        subtitle="We'll send a 6-digit code to your phone."
      />

      <div className="space-y-4 mt-6">
        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <PhoneInput
              defaultCountry="us"
              value={field.value}
              onChange={(phone) => field.onChange(phone)}
              inputClassName="!h-9 md:!h-11 !bg-muted !border-0 !rounded-lg !text-foreground placeholder:!text-muted-foreground !w-full !text-sm md:!text-base"
              countrySelectorStyleProps={{
                buttonClassName:
                  "!h-9 md:!h-11 !rounded-lg !px-4 !mr-2 !border-0 !bg-background",
              }}
              className="phone-input-wrapper"
            />
          )}
        />
        {errors.phoneNumber && (
          <p className="text-sm text-destructive">
            {errors.phoneNumber.message}
          </p>
        )}

        <Button
          disabled={isLoading}
          type="button"
          className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
          onClick={handleSubmit(onSubmit)}
        >
          Send Verification Code{isLoading && <Spinner />}
        </Button>
      </div>

      <style jsx global>{`
        .phone-input-wrapper .react-international-phone-input-container {
          display: flex;
          gap: 0.5rem;
        }
        .phone-input-wrapper .react-international-phone-input {
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default PhoneNumber;
