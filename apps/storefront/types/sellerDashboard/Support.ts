import { ReactNode } from "react";

export type SupportCardItem = {
  id: number;
  title: string;
  value: string;

  icon?: ReactNode;


  color?: string;

  textColor?: string;

  button?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  };
};


export interface SupportEmailRequest {
  subject: string;
  message: string;
}

export interface SupportEmailResponse {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
    path: string;
    method: string;
  };
  data?: string;
}


export type TicketCategory = 
  | 'ACCOUNT_LOGIN'
  | 'BILLING_PAYMENTS'
  | 'TECHNICAL_ERROR_BUG'
  | 'FEATURE_REQUEST'
  | 'DATA_LOSS_RECOVERY'
  | 'PRIVACY_SECURITY'
  | 'INTEGRATION_API'
  | 'PERFORMANCE_SLOWDOWN'
  | 'REPORTING_ANALYTICS'
  | 'OTHER';


export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SupportTicketRequest {
  subject: string;
  category: TicketCategory;
  message: string; 
  priority: TicketPriority;
  attachments?: string[]; 
}
