import type {
  CreateUserPayload,
  GoogleAuthResponse,
  LoginPayload,
  LoginResponse,
  MediaFile,
  ShopSetupPayload,
  UploadMediaResponse,
  UploadMultipleMediaResponse,
} from "@/types/auth";
import { authApiFetch } from "./authApiFetch";

export const loginUser = async ({
  email,
  password,
  stayLoggedIn,
}: LoginPayload): Promise<LoginResponse> => {
  return authApiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password, stayLoggedIn },
  });
};

export const verifyTwoStep = async ({
  otpProvider,
  email,
  otp,
}: {
  otpProvider: string;
  email: string;
  otp: string;
}) => {
  try {
    const res = await authApiFetch<LoginResponse>("/auth/verifyTwoFactorAuth", {
      method: "POST",
      body: { email, otp, otpProvider },
    });
    return res;
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  return authApiFetch("/auth/logout", {
    method: "POST",
  });
};

// create user

export const createUser = async (values: CreateUserPayload) => {
  try {
    const data = await authApiFetch<LoginResponse>("/user", {
      method: "POST",
      body: values,
    });
    return data;
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
};

export const sendOtpInMail = async (email: string) => {
  try {
    const data = await authApiFetch<{ success: boolean }>(
      "/user/send-email-otp",
      {
        method: "POST",
        body: { email },
      },
    );
    return data?.success;
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
};

export const sendOtpInPhone = async (phoneNumber: string) => {
  try {
    const data = await authApiFetch<{ success: boolean }>(
      "/user/send-email-otp",
      {
        method: "POST",
        body: { phoneNumber },
      },
    );
    return data?.success;
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
};

export const verifyOtpInMail = async (email: string, otp: string) => {
  try {
    const data = await authApiFetch<{ success: boolean }>(
      "/user/verify-email-otp",
      {
        method: "POST",
        body: { email, otp },
      },
    );
    return data?.success;
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
};

export const verifyOtpInPhone = async (email: string, otp: string) => {
  try {
    const data = await authApiFetch<{ success: boolean }>(
      "/user/verify-phone-otp",
      {
        method: "POST",
        body: { email, otp },
      },
    );
    return data?.success;
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
};


export const setUpShop = async (values: ShopSetupPayload) => {
  try {
    const data = await authApiFetch<{ success: boolean }>("/user/setup-shop", {
      method: "POST",
      body: values,
    });
    return data?.success;
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
};

// for media Upload

export const deleteMedia = async (key: string) => {
  try {
    const res = await authApiFetch<{ success: boolean }>(
      `/media/delete?key=${key}`,
      {
        method: "DELETE",
      },
    );
    return res?.success;
  } catch (error) {
    console.error("Media upload error:", error);
    throw error;
  }
};

export const uploadMedia = async (file: File): Promise<MediaFile | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const data = await authApiFetch<UploadMediaResponse>("/media/upload", {
      method: "POST",
      body: formData,
    });

    return data?.data;
  } catch (error) {
    console.error("Media upload error:", error);
    throw error;
  }
};

export const uploadMultipleMedia = async (
  files: File[],
): Promise<MediaFile[]> => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const data = await authApiFetch<UploadMultipleMediaResponse>(
      "/media/upload-multiple",
      {
        method: "POST",
        body: formData,
      },
    );

    // console.log("raw upload response:", data);      // ← add
    // console.log("data.data:", data?.data);

    return data?.data?.files;
  } catch (error) {
    console.error("Media upload error:", error);
    throw error;
  }
};

// for password reset
export const resetPassword = async ({
  value,
  provider,
}: {
  value: string;
  provider: string;
}) => {
  try {
    const data = await authApiFetch<{ success: boolean; message: string }>(
      "/auth/forget-password",
      {
        method: "POST",
        body: { value, provider },
      },
    );
    return data;
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
};

export const verifyResetPasswordOtp = async ({
  value,
  provider,
  otp,
}: {
  value: string;
  provider: string;
  otp: string;
}) => {
  try {
    const data = await authApiFetch<{
      success: boolean;
      message: string;
      accessToken: string;
    }>("/auth/verify-forget-password-otp", {
      method: "POST",
      body: { value, provider, otp },
    });
    return data;
  } catch (error) {
    console.error("OTP verification error:", error);
    throw error;
  }
};

export const updatePassword = async ({
  confirmPassword,
  password,
  accessToken,
}: {
  confirmPassword: string;
  password: string;
  accessToken: string;
}) => {
  try {
    const data = await authApiFetch<{ success: boolean; message: string }>(
      "/auth/update-password",
      {
        method: "POST",
        body: { confirmPassword, password, accessToken },
      },
    );
    return data;
  } catch (error) {
    console.error("Update password error:", error);
    throw error;
  }
};

export async function googleAuth({
  token,
  role,
}: {
  token: string;
  role?: "seller" | "customer";
}) {
  try {
    const data = await authApiFetch<GoogleAuthResponse>("/auth/google", {
      method: "POST",
      body: { token, role },
    });
    return data;
  } catch (error) {
    console.error("Google auth error:", error);
    throw error;
  }
}