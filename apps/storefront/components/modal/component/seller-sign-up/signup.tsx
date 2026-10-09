import React from "react";
import {
  Control,
  FieldErrors,
  UseFormHandleSubmit,
  SubmitHandler,
  Controller,
  useWatch,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/animate-ui/components/base/checkbox";
import SectionTitle from "@/components/SectionTitle";
import { Spinner } from "@/components/ui/spinner";
import GoogleSignIn from "../GoogleSignIn";
import { SellerFormValues } from "./signup-schema";

interface SignUpStepProps {
  step: number;
  control: Control<SellerFormValues>;
  errors: FieldErrors<SellerFormValues>;
  handleSubmit: UseFormHandleSubmit<SellerFormValues>;
  onSubmit: SubmitHandler<SellerFormValues>;
  isLoading: boolean;
}

const SignUp: React.FC<SignUpStepProps> = ({
  step,
  control,
  errors,
  handleSubmit,
  onSubmit,
  isLoading,
}) => {
  const isAgreed = useWatch({
    control,
    name: "isAgreeToTermsAndConditions",
  });

  if (step !== 1) return null;

  return (
    <div className="w-full">
      <SectionTitle
        title="Start Your Journey as a Maker"
        subtitle="Join a transparent marketplace built for authentic creators."
      />
      <div className="space-y-4 mt-6">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-foreground">
            Full Name
          </Label>
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                className="h-9! md:h-11! bg-background border-0 rounded-lg text-foreground placeholder:text-muted-foreground text-sm md:text-base"
              />
            )}
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            Email Address
          </Label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="h-9! md:h-11! bg-background border-0 rounded-lg text-foreground placeholder:text-muted-foreground text-sm md:text-base"
              />
            )}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">
            Password
          </Label>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="password"
                type="password"
                placeholder="Enter your password"
                className="h-9! md:h-11! bg-background border-0 rounded-lg text-foreground placeholder:text-muted-foreground text-sm md:text-base"
              />
            )}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-foreground">
            Confirm Password
          </Label>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="h-9! md:h-11! bg-background border-0 rounded-lg text-foreground placeholder:text-muted-foreground text-sm md:text-base"
              />
            )}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Controller
            name="isAgreeToTermsAndConditions"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="isAgreeToTermsAndConditions"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label
            htmlFor="agreeToTerms"
            className="text-sm font-normal cursor-pointer text-foreground"
          >
            I agree to the Terms & Privacy Policy.
          </Label>
        </div>
        {errors.isAgreeToTermsAndConditions && (
          <p className="text-sm text-destructive">
            {errors.isAgreeToTermsAndConditions.message}
          </p>
        )}

        <Button
          type="button"
          disabled={isLoading || !isAgreed}
          className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
          onClick={handleSubmit(onSubmit)}
        >
          Sign Up {isLoading && <Spinner />}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">Or</span>
          </div>
        </div>

        <GoogleSignIn role="seller" />

        <p className="text-center text-foreground mt-6">
          Already have an account?{" "}
          <button
            type="button"
            className="text-foreground font-medium hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
