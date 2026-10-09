"use server";

import { apiFetch } from "@/lib/apiFetch";

/* ─── Types ──────────────────────────────────────────────── */
interface TwoFAResponse {
  success: boolean;
  message?: string;
}

/* ─── Send OTP ───────────────────────────────────────────── */
export async function sendTwoFactorOtp(
  userId: string,
  provider: "email" | "sms" = "email"
): Promise<TwoFAResponse> {
  return apiFetch<TwoFAResponse>("/user/two-factor-otp", {
    method: "POST",
    body: { userId, provider },
  });
}

/* ─── Toggle 2FA (enable / disable) ─────────────────────── */
export async function toggleTwoFactor(
  userId: string,
  otp: string,
  twoFactorEnable: boolean,
  provider: "email" | "sms" = "email"
): Promise<TwoFAResponse> {
  return apiFetch<TwoFAResponse>("/user/toggle-two-factor-verification", {
    method: "POST",
    body: { userId, otp, provider, twoFactorEnable },
  });
}

/* ─── Change Password ────────────────────────────────────── */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<TwoFAResponse> {
  return apiFetch<TwoFAResponse>("/user/change-password", {
    method: "POST",
    body: { currentPassword, newPassword },
  });
}