"use client";

import GoogleIcon from "@/assets/icons/google.svg";
import { googleAuth } from "@/lib/action";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { toast } from "sonner";
import { useState, useRef } from "react";

interface GoogleSignInProps {
  role?: "seller" | "customer";
  variant?: "outlined" | "filled" | "text";
  size?: "sm" | "md" | "lg";
  text?: string;
  showIcon?: boolean;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: () => void;
}

export default function GoogleSignIn({
  role,
  variant = "outlined",
  size = "md",
  text = "Continue with Google",
  showIcon = true,
  fullWidth = true,
  className = "",
  disabled = false,
  onSuccess,
  onError,
}: GoogleSignInProps) {
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    const token = credentialResponse.credential;

    if (!token) {
      console.error("No credential received");
      return;
    }

    setLoading(true);
    googleAuth({ token, role })
      .then((res) => {
        if (res.success) {
          if (res.data.user.role === "seller") {
            window.location.href = "/seller-dashboard";
          } else {
            window.location.href = "/";
          }

          toast.success(res.message);
          onSuccess?.();
        }
      })
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Google Sign-In failed. Please try again.",
        );
        console.error("Google Sign-In error:", error);
        onError?.();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Size classes
  const sizeClasses = {
    sm: "h-8 px-3 text-xs md:text-sm",
    md: "h-9.5 md:h-11 px-4 text-sm md:text-base",
    lg: "h-12 md:h-14 px-6 text-base md:text-lg",
  };

  // Variant classes
  const variantClasses = {
    outlined:
      "border border-foreground rounded-full hover:border-primary font-semibold hover:bg-background transition-colors",
    filled:
      "bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors",
    text: "text-foreground font-semibold hover:underline transition-colors",
  };

  return (
    <>
      <div
        ref={googleButtonRef}
        className={`
          flex items-center justify-center gap-2 
          ${fullWidth ? "w-full" : "w-auto"}
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        <button
          onClick={() => {
            const googleButton = googleButtonRef.current?.querySelector(
              'div[role="button"]',
            ) as HTMLElement;
            googleButton?.click();
          }}
          disabled={disabled || loading}
          className="w-full h-full flex items-center justify-center cursor-pointer gap-2"
          type="button"
        >
          {showIcon && <GoogleIcon className="shrink-0" />}
          {loading ? "Signing in..." : text}
        </button>
        <div className="hidden">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
              console.error("Google Sign-In failed.");
              onError?.();
            }}
          />
        </div>
      </div>
    </>
  );
}

export function GoogleSignInButton({
  variant = "outlined",
  size = "md",
  text = "Continue with Google",
  showIcon = true,
  fullWidth = true,
  className = "",
}: Omit<GoogleSignInProps, "role" | "disabled" | "onSuccess" | "onError">) {
  return (
    <GoogleSignIn
      variant={variant}
      size={size}
      text={text}
      showIcon={showIcon}
      fullWidth={fullWidth}
      className={className}
    />
  );
}
