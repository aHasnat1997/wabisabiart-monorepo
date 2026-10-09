export interface AddressListResponse {
  success: boolean;
  message: string;
  meta: Meta;
  data: Address[];
}

export interface AddressSingleResponse {
  success: boolean;
  message: string;
  meta: Meta;
  data: Address;
}

export interface Meta {
  timestamp: string;
  path: string;
  method: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  label: string;
  createdAt: string;
  updatedAt: string;
}
