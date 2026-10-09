"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/images/Logo.png";
import { ShopSetupPayload } from "@/types/auth";
import { toast } from "sonner";
import {
  enableTwoStep,
  profileInfo,
  setUpShop,
  toggleTwoStep,
} from "@/lib/auth-server";
import SellerAgreementStep from "./SellerAgreementStep";
import ShopProfileStep from "./ShopProfileStep";
import IdentityVerificationStep from "./IdentityVerificationStep";
import { TwoFactor } from "./twoFactor";
import TwoFactorCode from "./twoFactorCode";
import CompletionStep from "./CompletionStep";
import {
  shopFormSchema,
  ShopFormValues,
  step5Schema,
  step6Schema,
} from "./setup-schema";

export default function SellerSetup() {
  const [step, setStep] = useState(5);
  const [twoFACode, setTwoFACode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [shopLogoUrl, setShopLogoUrl] = useState<string | null>(null);
  const [idUrl, setIdUrl] = useState<string | null>(null);
  const [productUrls, setProductUrls] = useState<string[]>([]);
  const twoFARef = useRef<boolean>(false);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);


  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await profileInfo();
        console.log(response);
        setUserId(response?.id);
        setEmail(response?.email);
      } catch (error) {
        console.error(error);
      }
    };

    loadProfile();
  }, []);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
    mode: "onChange",
    defaultValues: {
      agreeToSellerAgreement: false,
      shopName: "",
      countryCity: "",
      craftDescription: "",
      handcraftedItems: false,
      enable2FA: false,
    },
  });

  // ─── onSubmit for steps 5–10 ──────────────────────────────────────────────
  const onSubmitShop = async (data: ShopFormValues) => {
    if (step === 5) {
      try {
        await step5Schema.parseAsync(data);
      } catch {
        return;
      }
      if (!data.agreeToSellerAgreement) return;
      setStep(6);
    } else if (step === 6) {
      try {
        await step6Schema.parseAsync(data);
      } catch {
        return;
      }
      setStep(7);
    } else if (step === 7) {
      console.log(userId, "userId");
      if (!userId) return;
      setIsLoading(true);
      const values: ShopSetupPayload = {
        userId,
        shopName: data.shopName || "",
        shopDescription: data.craftDescription || "",
        address: data.countryCity || "",
        shopLogo: shopLogoUrl || "",
        proofOfIdentity: idUrl || "",
        sampleProducts: productUrls,
        isAgreedToTermsAndConditions: true,
        isHandcraftedOrEthicallySourced: data.handcraftedItems || false,
      };
      try {
        const success = await setUpShop(values);
        console.log(success, "response");
        if (success) {
          toast.success("Request successfully submitted for review");
          setStep(8);
        }
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setIsLoading(false);
      }
    } else if (step === 8) {
      setIsLoading(true);
      const enable2FAValue = twoFARef.current;
      setValue("enable2FA", enable2FAValue);

      if (enable2FAValue && userId) {
        setTwoFACode(["", "", "", "", "", ""]);
        try {
          const success = await enableTwoStep({ userId, provider: "email" });
          if (success) {
            toast.success("2FA enabled successfully");
            setStep(9);
          }
        } catch (error) {
          console.error("2FA error:", error);
          throw error;
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        setStep(10);
      }
    } else if (step === 9) {
      if (!userId) return;
      setIsLoading(true);
      try {
        const success = await toggleTwoStep({
          userId,
          otp: twoFACode.join(""),
          provider: "email",
          twoFActorEnable: true,
        });
        if (success) setStep(10);
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setIsLoading(false);
      }
    } else if (step === 10) {
      router.push("?signin-modal=signin");
    }
  };

  // ─── 2FA handlers (step 9) ────────────────────────────────────────────────
  const handleTwoFACodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...twoFACode];
    newCode[index] = value;
    setTwoFACode(newCode);
    if (value && index < 5)
      document.getElementById(`twofa-code-${index + 1}`)?.focus();
  };

  const handleTwoFAKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !twoFACode[index] && index > 0)
      document.getElementById(`twofa-code-${index - 1}`)?.focus();
  };

  const handleTwoFAPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    setTwoFACode(pastedData.split("").slice(0, 6));
  };

  const handleTwoFAResend = async () => {
    setIsLoading(true);
    setTwoFACode(["", "", "", "", "", ""]);
    if (!userId) return;
    try {
      const success = await enableTwoStep({ userId, provider: "email" });
      if (success) toast.success("Code resent successfully");
    } catch (error) {
      console.error("Resend 2FA error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── 2FA toggle ──────────────────────────────────────────────────────────
  const handleEnable2FA = () => {
    twoFARef.current = true;
    handleSubmit(onSubmitShop)();
  };

  const handleSkip2FA = () => {
    twoFARef.current = false;
    handleSubmit(onSubmitShop)();
  };

  // ─── UI ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full p-1 md:p-2 pb-12">
      <Image src={logo} alt="logo" height={50} width={50} className="mb-6" />

      <SellerAgreementStep
        step={step}
        control={control}
        errors={errors}
        watch={watch}
        handleSubmit={handleSubmit}
        onSubmit={onSubmitShop}
        isLoading={isLoading}
      />

      <ShopProfileStep
        step={step}
        control={control}
        errors={errors}
        watch={watch}
        handleSubmit={handleSubmit}
        onSubmit={onSubmitShop}
        onUpload={setShopLogoUrl}
        isLoading={isLoading}
      />

      <IdentityVerificationStep
        step={step}
        control={control}
        errors={errors}
        handleSubmit={handleSubmit}
        onSubmit={onSubmitShop}
        onIdUpload={setIdUrl}
        onProductsUpload={setProductUrls}
        isLoading={isLoading}
      />

      <TwoFactor
        step={step}
        email={email || ""}
        handleEnable2FA={handleEnable2FA}
        handleSkip2FA={handleSkip2FA}
        isLoading={isLoading}
      />

      <TwoFactorCode
        step={step}
        code={twoFACode}
        errors={errors}
        handleCodeChange={handleTwoFACodeChange}
        handleKeyDown={handleTwoFAKeyDown}
        handlePaste={handleTwoFAPaste}
        handleResend={handleTwoFAResend}
        handleSubmit={handleSubmit}
        onSubmit={onSubmitShop}
        isLoading={isLoading}
      />

      <CompletionStep step={step} />
    </div>
  );
}
