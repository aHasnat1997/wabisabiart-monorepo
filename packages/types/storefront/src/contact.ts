export interface SupportContactResponse {
  success: boolean;
  message: string;
  meta: Meta;
  data: SupportContact;
}

export interface Meta {
  timestamp: string;
  path: string;
  method: string;
}

export interface SupportContact {
  id: string;
  email: string;
  phoneNumber: string;
  availableTimeRange: string;
  availableWeekRange: string;
  responseTime: string;
  createdAt: string;
  updatedAt: string;
}

// legal
export interface LegalPageResponse {
  success: boolean;
  message: string;
  meta: Meta;
  data: LegalPage;
}

export interface Meta {
  timestamp: string;
  path: string;
  method: string;
}

export interface LegalPage {
  id: string;
  type: LegalPageType;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type LegalPageType = "TERMS_OF_USE" | "PRIVACY_POLICY" | "COOKIE_POLICY";
