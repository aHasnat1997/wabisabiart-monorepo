import { ReactNode } from "react"

export interface IAuthenticityCardItem {
  id: number
  title: string
  value: string | number
  prefix?: string
  period?: string
  badge?: string
  icon?: ReactNode
  color?: string
  textColor?: string
}

export interface ILoginActivity {
    id: number,
    name:string,
    location: string,
    date:string
}


export interface BillingFeesData {
  id: string;
  key: string;
  platformFeePercent: string;
  paymentProcessingPercent: string;
  paymentProcessingFlat: string;
  sellerKeepsPercent: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionItem {
  id: number;
  name: string;
  date: string;
  salePrice: number;
  platformFee: number;
  processingFee: number;
  received: number;
}

export interface BillingFeesResponse {
  success: boolean;
  message: string;
  data: BillingFeesData;
}