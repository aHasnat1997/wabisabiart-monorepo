// =====================
// Common Meta
// =====================
export interface Meta {
  timestamp: string;
  path: string;
  method: string;
}

// =====================
// Auth Types
// =====================
export interface LoginResponse {
  success: boolean;
  message: string;
  meta: Meta;
  data: LoginData;
}

export interface LoginData {
  accessToken: string;
  user: User;
  id: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  stayLoggedIn: boolean;
}

export interface GoogleAuthResponse {
  success: boolean;
  message: string;
  meta: Meta;
  data: {
    accessToken: string;
    user: User;
  };
}

// =====================
// User Types
// =====================
export type UserRole = "customer" | "seller" | "admin";

export interface SellerProfile {
  id: string;
  shopName: string;
  createdAt: string;
  isVerified: boolean;
  isVerifiedByAdmin: boolean;
  verificationDate: string | null;
}

export interface ShopSetupRequest {
  id: string;
  shopName: string;
  status: "pending" | "approved" | "rejected";
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: UserRole;
  avatarUrl: string;
  dob: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorProvider?: "email" | "sms" | null;
  otpProvider: "email" | "sms" | "authenticator";
  isActive: boolean;
  createdAt: string;
  sellerProfile?: SellerProfile | null;
  shopSetupRequest?: ShopSetupRequest | null;
}

export interface IUserProfileResponse {
  success: boolean;
  message: string;
  meta: Meta;
  data: User;
}

// =====================
// Create User
// =====================
export interface CreateUserPayload {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  isAgreeToTermsAndConditions: boolean;
  role: UserRole;
}

// =====================
// Media Types
// =====================
export interface MediaFile {
  key: string;
  url: string;
  category: string;
}

export interface UploadMediaResponse {
  success: boolean;
  message: string;
  meta: Meta;
  data: MediaFile;
}

export interface UploadMultipleMediaResponse {
  success: boolean;
  message: string;
  meta: Meta;
  data: {
    success: boolean;
    count: number;
    files: MediaFile[];
  };
}

// =====================
// Shop Setup
// =====================
export interface ShopSetupPayload {
  userId: string;
  shopName?: string;
  shopDescription?: string;
  address?: string;
  shopLogo: string;
  proofOfIdentity: string;
  sampleProducts?: string[];
  isAgreedToTermsAndConditions: boolean;
  isHandcraftedOrEthicallySourced: boolean;
}


// ====================

export interface SessionsResponse {
  success: boolean;
  message: string;
  meta: SessionsMeta;
  data: SessionType[];
}

export interface SessionsMeta {
  timestamp: string;
  path: string;
  method: string;
}

export interface SessionType {
  id: string;
  userId: string;
  token: string;
  device: string;
  ipAddress: string;
  location: string;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
}