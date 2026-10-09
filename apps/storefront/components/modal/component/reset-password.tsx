"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Radio,
  RadioIndicator,
  RadioGroup,
} from "@/components/animate-ui/primitives/base/radio";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/images/Logo.png";
import Lottie from "lottie-react";
import successFullLottie from "@/assets/lottie/successfully.json";
import SectionTitle from "@/components/SectionTitle";
import {
  resetPassword,
  updatePassword,
  verifyResetPasswordOtp,
} from "@/lib/action";
import { toast } from "sonner";

// ─── Schemas ────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  method: z.enum(["phone", "email"]),
});

const step2PhoneSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
});

const step2EmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const step3Schema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

const step4Schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// ─── Types ───────────────────────────────────────────────────────────────────

type Step1Values = z.infer<typeof step1Schema>;
type Step2PhoneValues = z.infer<typeof step2PhoneSchema>;
type Step2EmailValues = z.infer<typeof step2EmailSchema>;
type Step3Values = z.infer<typeof step3Schema>;
type Step4Values = z.infer<typeof step4Schema>;

export default function ResetPassword() {
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<"phone" | "email">(
    "phone",
  );
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [accessToken, setAccessToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // ─── Step 1 Form ───────────────────────────────────────────────────────────
  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { method: "phone" },
  });

  // ─── Step 2 Phone Form ─────────────────────────────────────────────────────
  const step2PhoneForm = useForm<Step2PhoneValues>({
    resolver: zodResolver(step2PhoneSchema),
    defaultValues: { phoneNumber: "" },
  });

  // ─── Step 2 Email Form ─────────────────────────────────────────────────────
  const step2EmailForm = useForm<Step2EmailValues>({
    resolver: zodResolver(step2EmailSchema),
    defaultValues: { email: "" },
  });

  // ─── Step 3 Form ───────────────────────────────────────────────────────────
  const step3Form = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: { code: "" },
  });

  // ─── Step 4 Form ───────────────────────────────────────────────────────────
  const step4Form = useForm<Step4Values>({
    resolver: zodResolver(step4Schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // ─── Stored values across steps ───────────────────────────────────────────
  const [storedPhone, setStoredPhone] = useState("");
  const [storedEmail, setStoredEmail] = useState("");

  // ─── Step 1 Submit ─────────────────────────────────────────────────────────
  const onStep1Submit = (values: Step1Values) => {
    setSelectedMethod(values.method);
    setStep(2);
  };

  // ─── Step 2 Submit ─────────────────────────────────────────────────────────
  const onStep2PhoneSubmit = async (values: Step2PhoneValues) => {
    setIsLoading(true);
    try {
      const res = await resetPassword({
        value: values.phoneNumber,
        provider: "phone",
      });
      if (res.success) {
        setStoredPhone(values.phoneNumber);
        toast.success(res.message || "OTP sent to your phone number!");
        setStep(3);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onStep2EmailSubmit = async (values: Step2EmailValues) => {
    setIsLoading(true);
    try {
      const res = await resetPassword({
        value: values.email,
        provider: "email",
      });
      if (res.success) {
        setStoredEmail(values.email);
        toast.success(res.message || "OTP sent to your email!");
        setStep(3);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 3 Submit ─────────────────────────────────────────────────────────
  const onStep3Submit = async (values: Step3Values) => {
    const value = selectedMethod === "phone" ? storedPhone : storedEmail;
    setIsLoading(true);
    try {
      const res = await verifyResetPasswordOtp({
        value,
        provider: selectedMethod,
        otp: values.code,
      });
      if (res?.success) {
        setAccessToken(res.accessToken);
        toast.success("OTP verified successfully!");
        setStep(4);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Invalid OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 4 Submit ─────────────────────────────────────────────────────────
  const onStep4Submit = async (values: Step4Values) => {
    setIsLoading(true);
    try {
      const res = await updatePassword({
        password: values.password,
        confirmPassword: values.confirmPassword,
        accessToken,
      });
      if (res?.success) {
        toast.success("Password reset successfully!");
        setStep(5);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ─── OTP Helpers ──────────────────────────────────────────────────────────
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...otpCode];
    newCode[index] = value;
    setOtpCode(newCode);
    if (value && index < 5)
      document.getElementById(`code-${index + 1}`)?.focus();
    step3Form.setValue("code", newCode.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newCode = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtpCode(newCode);
    step3Form.setValue("code", newCode.join(""));
    document.getElementById(`code-${Math.min(pastedData.length, 5)}`)?.focus();
  };

  const handleResend = async () => {
    setOtpCode(["", "", "", "", "", ""]);
    step3Form.setValue("code", "");
    setIsLoading(true);
    try {
      const value = selectedMethod === "phone" ? storedPhone : storedEmail;
      const res = await resetPassword({ value, provider: selectedMethod });
      if (res.success) toast.success(res.message || "OTP resent successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to resend OTP.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-1 md:p-2 pb-12">
      <Image className="mb-6" src={logo} alt="logo" height={50} width={50} />

      {/* ── Step 1: Choose Method ─────────────────────────────────────────── */}
      {step === 1 && (
        <Form {...step1Form}>
          <form
            onSubmit={step1Form.handleSubmit(onStep1Submit)}
            className="w-full"
          >
            <SectionTitle
              title="Choose Verification Method"
              subtitle="For your security, Two-Factor Authentication (2FA) is required to access your account."
            />

            <div className="space-y-4 mt-6">
              <FormField
                control={step1Form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedMethod(value as "phone" | "email");
                        }}
                        className="flex flex-col gap-3"
                      >
                        <label
                          htmlFor="phone"
                          className={`flex items-center gap-x-3 p-3 md:p-4 rounded-lg md:rounded-xl cursor-pointer transition-colors ${
                            field.value === "phone"
                              ? "bg-muted"
                              : "bg-background hover:bg-muted/50"
                          }`}
                        >
                          <Radio
                            value="phone"
                            id="phone"
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
                            field.value === "email"
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
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="text-xs text-muted-foreground">
                Your preferred method will be used automatically next time you
                log in.
              </p>

              <Button
                type="submit"
                className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
              >
                {selectedMethod === "phone"
                  ? "Verify with Phone Number"
                  : "Verify with Email"}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* ── Step 2: Enter Phone ───────────────────────────────────────────── */}
      {step === 2 && selectedMethod === "phone" && (
        <Form {...step2PhoneForm}>
          <form
            onSubmit={step2PhoneForm.handleSubmit(onStep2PhoneSubmit)}
            className="w-full"
          >
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Verify Your Phone Number
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              We&apos;ll send a 6-digit code to your phone.
            </p>

            <div className="space-y-4">
              <FormField
                control={step2PhoneForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <PhoneInput
                        defaultCountry="us"
                        value={field.value}
                        onChange={field.onChange}
                        inputClassName="!h-9 md:!h-11 !bg-muted !border-0 !rounded-lg !text-foreground placeholder:!text-muted-foreground !w-full !text-sm md:!text-base"
                        countrySelectorStyleProps={{
                          buttonClassName:
                            "!h-9 md:!h-11 !rounded-lg !px-4 !mr-2 !border-0 !bg-background",
                        }}
                        className="phone-input-wrapper"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
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
          </form>
        </Form>
      )}

      {/* ── Step 2: Enter Email ───────────────────────────────────────────── */}
      {step === 2 && selectedMethod === "email" && (
        <Form {...step2EmailForm}>
          <form
            onSubmit={step2EmailForm.handleSubmit(onStep2EmailSubmit)}
            className="w-full"
          >
            <SectionTitle
              title="Reset Your Password"
              subtitle="Enter your email address to receive a verification code."
            />
            <div className="space-y-4 mt-6">
              <FormField
                control={step2EmailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email address"
                        className="h-9! md:h-11! bg-background border-0 rounded-lg text-foreground placeholder:text-muted-foreground text-sm md:text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* ── Step 3: OTP ───────────────────────────────────────────────────── */}
      {step === 3 && (
        <Form {...step3Form}>
          <form
            onSubmit={step3Form.handleSubmit(onStep3Submit)}
            className="w-full"
          >
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Verify It&apos;s You.
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Enter the 6-digit code we sent to your{" "}
              {selectedMethod === "phone" ? "phone number" : "email"}
              <br />
              This step helps protect your account.
            </p>

            <FormField
              control={step3Form.control}
              name="code"
              render={() => (
                <FormItem>
                  <FormControl>
                    <div
                      className="flex gap-1 md:gap-2 justify-between mb-2"
                      onPaste={handlePaste}
                    >
                      {otpCode.map((digit, index) => (
                        <Input
                          key={index}
                          id={`code-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleCodeChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="h-10 md:h-16 w-10 md:w-16 text-center text-base md:text-2xl bg-muted border-0 rounded-md md:rounded-xl font-semibold"
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={otpCode.join("").length !== 6 || isLoading}
              className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full mb-4 mt-6"
            >
              {isLoading ? "Verifying..." : "Verify"}
            </Button>

            <p className="text-center text-sm text-foreground">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                className="font-medium hover:underline"
                onClick={handleResend}
              >
                Resend
              </button>
            </p>
          </form>
        </Form>
      )}

      {/* ── Step 4: New Password ──────────────────────────────────────────── */}
      {step === 4 && (
        <Form {...step4Form}>
          <form
            onSubmit={step4Form.handleSubmit(onStep4Submit)}
            className="w-full"
          >
            <SectionTitle
              title="Create New Password"
              subtitle="Please enter your new password and confirm it."
            />
            <div className="space-y-4 mt-6">
              <FormField
                control={step4Form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter your new password"
                        className="h-9! md:h-11! bg-background border-0 rounded-lg text-foreground placeholder:text-muted-foreground text-sm md:text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={step4Form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Confirm your new password"
                        className="h-9! md:h-11! bg-background border-0 rounded-lg text-foreground placeholder:text-muted-foreground text-sm md:text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>

              <p className="text-center text-foreground mt-6">
                Remember your password?{" "}
                <Link
                  href="?signin-modal=signin"
                  className="font-medium hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </Form>
      )}

      {/* ── Step 5: Success ───────────────────────────────────────────────── */}
      {step === 5 && (
        <div className="w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="w-48 h-48">
              <Lottie animationData={successFullLottie} loop autoplay />
            </div>
          </div>

          <SectionTitle
            title="Password Reset Successful!"
            subtitle="Your password has been successfully reset. You can now sign in with your new password."
          />

          <div className="space-y-3 mt-8">
            <Button
              type="button"
              className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
              onClick={() => router.push("?signin-modal=signin")}
            >
              Sign In
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-9! md:h-11! rounded-full border border-primary text-primary text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
              onClick={() => router.push("/")}
            >
              Go to Home
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}