"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import logo from "@/assets/images/Logo.png";

import {
  createUser,
  sendOtpInMail,
  sendOtpInPhone,
  verifyOtpInMail,
  verifyOtpInPhone,
} from "@/lib/action";

import { CreateUserPayload } from "@/types/auth";
import { toast } from "sonner";
import {
  sellerFormSchema,
  SellerFormValues,
  step1Schema,
  step3Schema,
} from "./signup-schema";
import SignUp from "./signup";
import VerificationMethod from "./verificationMethod";
import PhoneNumber from "./phoneNumber";
import CodeVerification from "./codeVerification";
import { useRouter } from "next/navigation";

export default function SellerSignUp() {
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<"sms" | "email">("sms");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // ─── FORM 1: Steps 1–4 (auth) ─────────────────────────────────────────────
  const {
    control: control1,
    handleSubmit: handleSubmit1,
    setValue: setValue1,
    watch: watch1,
    formState: { errors: errors1 },
  } = useForm<SellerFormValues>({
    resolver: zodResolver(sellerFormSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      isAgreeToTermsAndConditions: false,
      method: "sms",
      phoneNumber: "",
      code: "",
    },
  });

  const onSubmitAuth = async (data: SellerFormValues) => {
    if (step === 1) {
      // Manually validate step 1 fields
      try {
        await step1Schema.parseAsync(data);
      } catch {
        return;
      }

      setIsLoading(true);
      const values: CreateUserPayload = {
        fullName: data.fullName!,
        email: data.email!,
        password: data.password!,
        confirmPassword: data.confirmPassword!,
        isAgreeToTermsAndConditions: data.isAgreeToTermsAndConditions || false,
        role: "seller",
      };

      try {
        const res = await createUser(values);
        if (res?.success) {
          toast.success(res.message);
          setStep(2);
        }
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setIsLoading(false);
      }
    } else if (step === 2) {
      if (selectedMethod === "sms") {
        setStep(3);
      } else {
        setIsLoading(true);
        try {
          if (!data.email) return;
          const success = await sendOtpInMail(data.email);
          if (success) {
            toast.success("Email sent successfully");
            setStep(4);
          }
        } catch (error: unknown) {
          toast.error(
            error instanceof Error ? error.message : "Something went wrong",
          );
        } finally {
          setIsLoading(false);
        }
      }
    } else if (step === 3) {
      try {
        await step3Schema.parseAsync(data);
      } catch {
        return;
      }
      if (!data.phoneNumber) return;
      setIsLoading(true);
      try {
        const success = await sendOtpInPhone(data.phoneNumber);
        if (success) setStep(40);
      } finally {
        setIsLoading(false);
      }
    } else if (step === 4) {
      setIsLoading(true);
      try {
        if (!data.email) return;
        const success = await verifyOtpInMail(data.email, code.join(""));
        if (success) {
          router.push("/seller-dashboard");
        }
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setIsLoading(false);
      }
    } else if (step === 40) {
      if (!data.phoneNumber) return;
      setIsLoading(true);
      try {
        const success = await verifyOtpInPhone(data.phoneNumber, code.join(""));
        if (success) {
          router.push("/seller-dashboard");
        }
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  //   Handlers for code input fields in Step 4
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setValue1("code", newCode.join(""));
    if (value && index < 5)
      document.getElementById(`code-${index + 1}`)?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0)
      document.getElementById(`code-${index - 1}`)?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newCode = pastedData.split("").slice(0, 6);
    setCode(newCode);
    setValue1("code", newCode.join(""));
  };

  const handleResend = async () => {
    setIsLoading(true);
    setCode(["", "", "", "", "", ""]);
    setValue1("code", "");
    const phoneNumber = watch1("phoneNumber");
    const email = watch1("email");
    if (!phoneNumber || !email) return;
    try {
      if (selectedMethod === "sms") {
        const res = await sendOtpInPhone(phoneNumber);
        if (res) toast.success("OTP sent successfully");
      } else {
        const res = await sendOtpInMail(email);
        if (res) toast.success("OTP sent successfully");
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-1 md:p-2 pb-12">
      <Image src={logo} alt="logo" height={50} width={50} className="mb-6" />

      {/* ── Steps 1–4: use form1 ── */}
      <SignUp
        step={step}
        control={control1}
        errors={errors1}
        handleSubmit={handleSubmit1}
        onSubmit={onSubmitAuth}
        isLoading={isLoading}
      />

      <VerificationMethod
        step={step}
        selectedMethod={selectedMethod}
        setSelectedMethod={setSelectedMethod}
        handleSubmit={handleSubmit1}
        onSubmit={onSubmitAuth}
        isLoading={isLoading}
      />

      <PhoneNumber
        step={step}
        control={control1}
        errors={errors1}
        handleSubmit={handleSubmit1}
        onSubmit={onSubmitAuth}
        isLoading={isLoading}
      />

      <CodeVerification
        step={step}
        stepNumber={4}
        method={selectedMethod}
        code={code}
        errors={errors1}
        handleCodeChange={handleCodeChange}
        handleKeyDown={handleKeyDown}
        handlePaste={handlePaste}
        handleResend={handleResend}
        handleSubmit={handleSubmit1}
        onSubmit={onSubmitAuth}
        isLoading={isLoading}
      />
    </div>
  );
}
