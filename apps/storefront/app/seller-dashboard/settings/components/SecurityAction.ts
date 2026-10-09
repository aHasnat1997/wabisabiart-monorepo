/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "@/lib/apiFetch";
import { BillingFeesResponse } from "@/types/sellerDashboard/Settings";

export const getAuthenticityStatus = async () => {
  try {
    const response = await apiFetch("/seller-settings/authenticity", {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Authenticity Fetch Error:", error);
    return null;
  }
};

export interface AuthenticityProofPayload {
  [key: string]: any;
}

export interface AuthenticitySubmissionResponse {
  success: boolean;
  message?: string;
}

export const submitAuthenticityProof = async (
  payload: AuthenticityProofPayload,
): Promise<AuthenticitySubmissionResponse> => {
  try {
    const response = await apiFetch<AuthenticitySubmissionResponse>(
      "/seller-settings/authenticity/submit",
      {
        method: "POST",
        body: payload,
      },
    );
    return response;
  } catch (error) {
    console.error("Authenticity Submission Error:", error);
    return { success: false, message: "Submission failed " };
  }
};

export const getbillingAndFees =
  async (): Promise<BillingFeesResponse | null> => {
    try {
      const response = await apiFetch<BillingFeesResponse>(
        "/seller-settings/billing-fees",
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Billing and Fees Fetch Error:", error);
      return null;
    }
  };

export const getSecuritySettings = async () => {
  try {
    const response = await apiFetch("/seller-settings/security", {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Security Fetch Error:", error);
    return null;
  }
};

export const getSettingsOverview = async () => {
  try {
    const response = await apiFetch<{ success: boolean; data: any }>(
      "/seller-settings/overview",
      {
        method: "GET",
      },
    );
    return response;
  } catch (error) {
    console.error("Overview Fetch Error:", error);
    return null;
  }
};

export const updateSecurityPassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
) => {
  try {
    const response = await apiFetch<{ success: boolean; message?: string }>(
      "/seller-settings/security/password",
      {
        method: "PATCH",
        body: { currentPassword, newPassword, confirmPassword },
      },
    );
    return response;
  } catch (error) {
    console.error("Password Update Error:", error);
    return { success: false, message: "Password update failed" };
  }
};

export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    avatarUrl: string;
    marketingEmailsEnabled: boolean;
    updatedAt: string;
  };
}

export interface ProfileUpdatePayload {
  fullName: string;
  email: string;
  phoneNumber: string;
}

export const updateProfileSecurity = async (
  payload: ProfileUpdatePayload,
): Promise<ProfileUpdateResponse> => {
  try {
    const response = await apiFetch<ProfileUpdateResponse>(
      "/seller-settings/profile",
      {
        method: "PATCH",
        body: payload,
      },
    );
    return response;
  } catch (error: unknown) {
    console.error("Profile Update Error:", error);
    return {
      success: false,
      message: (error as Error).message || "Failed to update profile",
      data: {} as ProfileUpdateResponse["data"],
    };
  }
};

export const updateStoreSettings = async (payload: {
  shopName: string;
  shopDescription: string;
  shopAnnouncement?: string;
  address: string;
  shopLogo?: string;
  shopBannerImage?: string;
  shopPolicies?: string;
  returnPolicy?: string;
  privacyPolicy?: string;
  shippingPolicy?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
}) => {
  try {
    const response = await apiFetch<{ success: boolean; message?: string }>(
      "/seller-settings/store",
      {
        method: "PATCH",
        body: payload, // Sending { shopName, shopDescription }
      },
    );
    return response;
  } catch (error: unknown) {
    console.error("Store Settings Update Error:", error);
    return {
      success: false,
      message: (error as Error).message || "Failed to update store settings",
    };
  }
};