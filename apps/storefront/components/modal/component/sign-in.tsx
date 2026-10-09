"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Image from "next/image";
import logo from "@/assets/images/Logo.png";
import Link from "next/link";
import { toast } from "sonner";
import SectionTitle from "@/components/SectionTitle";
import { Checkbox } from "@/components/animate-ui/components/base/checkbox";
import { loginUser, verifyTwoStep } from "@/lib/action";
import { Spinner } from "@/components/ui/spinner";
import GoogleSignIn from "./GoogleSignIn";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  staySignedIn: z.boolean(),
  method: z.enum(["phone", "email"]).optional(),
  code: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignInPage() {
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState("phone");
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
      email: "",
      password: "",
      staySignedIn: false,
      method: "phone",
      code: "",
    },
  });

  const method = watch("method");

  const onSubmit = async (data: FormValues) => {
    if (step === 1) {
      setIsLoading(true);
      try {
        const res = await loginUser({
          email: data.email,
          password: data.password,
          stayLoggedIn: data.staySignedIn,
        });
        if (res.data.user.twoFactorEnabled) {
          setStep(2);
          setSelectedMethod(
            res.data.user.twoFactorProvider as "phone" | "email",
          );
        } else {
          if (res.success) {
            if (res.data.user.role === "seller") {
              window.location.href = "/seller-dashboard";
            } else {
              window.location.href = "/";
            }

            toast.success(res.message);
          }
        }
      } catch (error) {
        console.error("Create user error:", error);
        toast.error(
          error instanceof Error ? error.message : "An error occurred",
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    } else if (step === 2) {
      setIsLoading(true);
      try {
        const res = await verifyTwoStep({
          email: data.email,
          otp: code.join(""),
          otpProvider: selectedMethod,
        });
        if (res.success) {
          if (res.data.user.role === "seller") {
            window.location.href = "/seller-dashboard";
          } else {
            window.location.href = "/";
          }

          toast.success(res.message);
        }
      } catch (error) {
        console.error("Create user error:", error);
        throw error;
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

  const handleResend = () => {
    console.log("Resending code...");
    setCode(["", "", "", "", "", ""]);
    setValue("code", "");
  };

  return (
    <div className="w-full p-1 md:p-2 pb-12">
      <Image className="mb-6" src={logo} alt="logo" height={50} width={50} />
      {/* Step 1 */}
      {step === 1 && (
        <div className="w-full">
          <SectionTitle
            title="Welcome Back to Marketplace."
            subtitle="Log in to continue your journey with authentic, handcrafted products."
          />
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="e.g. abcd@gmail.com"
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Controller
                  name="staySignedIn"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="staySignedIn"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label
                  htmlFor="staySignedIn"
                  className="text-sm font-normal cursor-pointer text-foreground"
                >
                  Stay signed in
                </Label>
              </div>
              <Link href="?reset-password-modal=reset-password">
                <Button
                  className="text-foreground"
                  size={"sm"}
                  variant={"link"}
                  type="button"
                >
                  Forgot password?
                </Button>
              </Link>
            </div>
            <Button
              disabled={isLoading}
              type="button"
              className="flex-1 h-9! md:h-11! rounded-full text-sm md:text-base hover:shadow-lg transition-shadow duration-300 w-full"
              onClick={handleSubmit(onSubmit)}
            >
              Sign In {isLoading && <Spinner />}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or</span>
              </div>
            </div>
            <GoogleSignIn />
            <p className="text-center text-foreground mt-6">
              Don&apos;t have an account?{" "}
              <Link href="?user-signup-modal=user-signup">
                <button
                  type="button"
                  className="text-foreground font-medium cursor-pointer hover:underline"
                >
                  Sign up
                </button>
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="w-full">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Verify It&apos;s You.
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Enter the 6-digit code we sent to your{" "}
            {method === "phone" ? "phone number" : "email"}
            <br />
            This step helps protect your account.
          </p>

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
              type="button"
              className="font-medium hover:underline"
              onClick={handleResend}
            >
              Resend
            </button>
          </p>
        </div>
      )}
    </div>
  );
}