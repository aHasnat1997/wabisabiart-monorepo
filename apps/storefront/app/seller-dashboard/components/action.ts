"use server";

import { apiFetch } from "@/lib/apiFetch";

interface OnboardingType {
  data: {
    stripeOnboardingDone: boolean;
  };
}

interface UrlType {
  data: {
    url: string;
  };
}

export async function onboardingStatus() {
  try {
    const data = await apiFetch<OnboardingType>(
      "/stripe/seller/onboarding-status",
    );
    return data?.data?.stripeOnboardingDone;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


// Stripe

export async function connectStripe(completeUrl?: string, refreshUrl?: string) {
  try {
    const res = await apiFetch<UrlType>("/stripe/seller/onboard", {
      method: "POST",
      body: { completeUrl, refreshUrl },
    });
    return res?.data?.url;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


// export async function connectStripe(completeUrl?: string, refreshUrl?: string) {
//   try {
//     const res = await apiFetch<UrlType>("/stripe/seller/onboard", {
//       method: "POST",
//       body: { completeUrl, refreshUrl },
//     });
//     return res?.data?.url;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }