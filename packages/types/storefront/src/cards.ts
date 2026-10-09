export interface PaymentMethodsResponse {
  success: boolean;
  message: string;
  meta: PaymentMethodsMeta;
  data: PaymentMethodsList;
}

export interface PaymentMethodsMeta {
  timestamp: string;
  path: string;
  method: string;
}

export interface PaymentMethodsList {
  object: string;
  data: PaymentMethod[];
  has_more: boolean;
  url: string;
}

export interface PaymentMethod {
  id: string;
  object: string;
  allow_redisplay: string;
  billing_details: BillingDetails;
  card: Card;
  created: number;
  customer: string;
  customer_account: string | null;
  livemode: boolean;
  metadata: Record<string, string>;
  shared_payment_granted_token: string | null;
  type: string;
}

export interface BillingDetails {
  address: BillingAddress;
  email: string;
  name: string;
  phone: string | null;
  tax_id: string | null;
}

export interface BillingAddress {
  city: string | null;
  country: string | null;
  line1: string | null;
  line2: string | null;
  postal_code: string | null;
  state: string | null;
}

export interface Card {
  brand: string;
  checks: CardChecks;
  country: string;
  display_brand: string;
  exp_month: number;
  exp_year: number;
  fingerprint: string;
  funding: string;
  generated_from: string | null;
  last4: string;
  networks: CardNetworks;
  regulated_status: string;
  three_d_secure_usage: ThreeDSecureUsage;
  wallet: string | null;
}

export interface CardChecks {
  address_line1_check: string | null;
  address_postal_code_check: string | null;
  cvc_check: string | null;
}

export interface CardNetworks {
  available: string[];
  preferred: string | null;
}

export interface ThreeDSecureUsage {
  supported: boolean;
}
