"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Checkbox,
  CheckboxIndicator,
} from "../../animate-ui/primitives/base/checkbox";
import {
  Radio,
  RadioIndicator,
  RadioGroup,
} from "@/components/animate-ui/primitives/base/radio";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import Image from "next/image";
import logo from "@/assets/images/Logo.png";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import {
  createUser,
  sendOtpInMail,
  sendOtpInPhone,
  verifyOtpInMail,
  verifyOtpInPhone,
} from "@/lib/action";
import { CreateUserPayload } from "@/types/auth";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import GoogleSignIn from "./GoogleSignIn";

const formSchema = z
  .object({
    fullName: z.string().min(2, { message: "Full name is required" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
    isAgreeToTermsAndConditions: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms",
    }),
    method: z.enum(["phoneNumber", "email"]).optional(),
    phoneNumber: z.string().optional(),
    code: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function UserSignUp() {
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState("phoneNumber");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      isAgreeToTermsAndConditions: false,
      method: "phoneNumber",
      phoneNumber: "",
      code: "",
    },
  });

  const method = watch("method");

  const onSubmit = async (data: FormValues) => {
    if (step === 1) {
      setIsLoading(true);
      const values: CreateUserPayload = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        isAgreeToTermsAndConditions: data.isAgreeToTermsAndConditions,
        role: "customer",
      };
      try {
        const success = await createUser(values);
        if (success) {
          setStep(2);
        }
      } catch (error) {
        console.error("Signup failed:", error);
        toast.error(error instanceof Error ? error.message : "Signup failed");
      } finally {
        setIsLoading(false);
      }
    } else if (step === 2) {
      console.log("Step 2 - Method Selected:", {
        method: selectedMethod,
      });
      setValue("method", selectedMethod as "phoneNumber" | "email");
      if (selectedMethod === "phoneNumber") {
        setStep(3);
      } else {
        setIsLoading(true);
        try {
          const success = await sendOtpInMail(data.email);
          console.log(success, "step 2");
          if (success) {
            setStep(4);
          }
        } catch (error) {
          console.error("Signup failed:", error);
          toast.error(error instanceof Error ? error.message : "Signup failed");
        } finally {
          setIsLoading(false);
        }
      }
    } else if (step === 3) {
      setIsLoading(true);

      try {
        if (!data.phoneNumber) return;
        const success = await sendOtpInPhone(data.phoneNumber);
        console.log(success, "step 3");
        if (success) {
          setStep(5);
        }
      } catch (error) {
        console.error("Signup failed:", error);
        toast.error(error instanceof Error ? error.message : "Signup failed");
      } finally {
        setIsLoading(false);
      }
    } else if (step === 4) {
      setIsLoading(true);
      const otp = code.join("");
      try {
        const success = await verifyOtpInMail(data.email, otp);
        console.log(success, "step 3");
        if (success) {
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Signup failed:", error);
        toast.error(error instanceof Error ? error.message : "Signup failed");
      } finally {
        setIsLoading(false);
      }
    } else if (step === 5) {
      setIsLoading(true);
      const otp = code.join("");
      if (!data.phoneNumber) return;
      try {
        const success = await verifyOtpInPhone(data.phoneNumber, otp);
        console.log(success, "step 3");
        if (success) {
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Signup failed:", error);
        toast.error(error instanceof Error ? error.message : "Signup failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    setValue("code", newCode.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
    setCode(newCode);
    setValue("code", newCode.join(""));

    const lastFilledIndex = Math.min(pastedData.length, 5);
    const nextInput = document.getElementById(`code-${lastFilledIndex}`);
    nextInput?.focus();
  };

 const handleResend = async () => {
   setIsLoading(true);
   setCode(["", "", "", "", "", ""]);
   setValue("code", "");

   const phoneNumber = watch("phoneNumber");
   const email = watch("email");

   try {
     if (selectedMethod === "phoneNumber") {
       if (!phoneNumber) return;
       const res = await sendOtpInPhone(phoneNumber);
       if (res) {
         toast.success("OTP sent successfully");
       }
     } else {
       if (!email) return;
       const res = await sendOtpInMail(email);
       if (res) {
         toast.success("OTP sent successfully");
       }
     }
   } catch (error: unknown) {
     console.error("Resend OTP error:", error);
     if (error instanceof Error) {
       toast.error(error.message);
     } else {
       toast.error("Something went wrong");
     }
   } finally {
     setIsLoading(false);
   }
 };

  return (
    <div className="w-full p-1 md:p-2 pb-12">
      <Image className="mb-6" src={logo} alt="logo" height={50} width={50} />
      {step === 1 && (
        <div className="w-full">
          <SectionTitle
            title="Join Makers & Conscious Buyers"
            subtitle="Discover unique creations, connect with trusted sellers, and shop
            safely."
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
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
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
                    id="agreeToTerms"
                    checked={field.value}
                    className="size-4.5 rounded flex justify-center items-center border [&[data-checked],&[data-indeterminate]]:bg-primary [&[data-checked],&[data-indeterminate]]:text-primary-foreground transition-colors duration-500"
                    onCheckedChange={field.onChange}
                  >
                    <CheckboxIndicator className="size-3" />
                  </Checkbox>
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
              disabled={isLoading}
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

            <GoogleSignIn role="customer" />

            <p className="text-center text-foreground mt-6">
              Already have an account?{" "}
              <Link href="?signin-modal=signin">
                <button
                  type="button"
                  className="text-foreground cursor-pointer font-medium hover:underline"
                >
                  Sign In
                </button>
              </Link>
            </p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="w-full">
          <SectionTitle
            title="Choose Your Verification Method"
            subtitle="For your security, Two-Factor Authentication (2FA) is required to access your account."
          />

          <RadioGroup
            value={selectedMethod}
            onValueChange={(value) =>
              setSelectedMethod(value as "phoneNumber" | "email")
            }
            className="space-y-3 mb-6"
          >
            <div className="flex flex-col gap-3">
              <label
                htmlFor="phoneNumber"
                className={`flex items-center gap-x-3 p-3 md:p-4 rounded-lg md:rounded-xl cursor-pointer transition-colors ${
                  selectedMethod === "phoneNumber"
                    ? "bg-muted"
                    : "bg-background hover:bg-muted/50"
                }`}
              >
                <Radio
                  value="phoneNumber"
                  id="phoneNumber"
                  className="w-5 h-5 border-2 rounded-full flex items-center justify-center data-[state=checked]:border-primary"
                >
                  <RadioIndicator className="w-2.5 h-2.5 rounded-full bg-primary opacity-0 transition-opacity data-[state=checked]:opacity-100" />
                </Radio>
                <div className="flex-1">
                  <div className="text-base font-semibold text-foreground">
                    Phone Number Verification
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
            Your preferred method will be used automatically next time you log
            in.
          </p>

          <Button
            type="button"
            disabled={isLoading}
            className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
            onClick={handleSubmit(onSubmit)}
          >
            {selectedMethod === "sms"
              ? "Verify with Phone Number"
              : "Verify with Email"}{" "}
            {isLoading && <Spinner />}
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="w-full">
          <SectionTitle
            title="Verify Your Phone Number"
            subtitle="We'll send a 6-digit code to your phone."
          />

          <div className="space-y-4">
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  defaultCountry="us"
                  value={field.value}
                  onChange={(phone) => field.onChange(phone)}
                  inputClassName="!h-9! !md:h-11! !bg-background !border-0 !rounded-lg !text-foreground placeholder:!text-muted-foreground !text-sm !md:text-base !w-full"
                  countrySelectorStyleProps={{
                    buttonClassName:
                      "!h-9! !md:h-11! !rounded-lg !px-3 !mr-2 !border-0 !bg-background",
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
              type="button"
              disabled={isLoading}
              className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
              onClick={handleSubmit(onSubmit)}
            >
              Send Verification Code {isLoading && <Spinner />}
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
      )}

      {step === 4 && (
        <div className="w-full">
          <SectionTitle
            title="Verify It's You"
            subtitle={`Enter the 6-digit code we sent to your ${
              method === "phoneNumber" ? "phone number" : "email"
            }. This step helps protect your account.`}
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
                className="h-9! md:h-11! w-10! md:w-12! text-center text-sm md:text-base bg-background border-0 rounded-lg font-semibold"
              />
            ))}
          </div>

          {errors.code && (
            <p className="text-sm text-destructive mb-4">
              {errors.code.message}
            </p>
          )}

          <Button
            type="button"
            className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full mb-4"
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
              Resend {isLoading && "..."}
            </button>
          </p>
        </div>
      )}
    </div>
  );
}