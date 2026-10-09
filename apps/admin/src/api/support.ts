import { api } from './axios.js';

export type TSupportContactDetails = {
  email: string;
  phoneNumber?: string;
  availableTimeRange?: string;
  availableWeekRange?: string;
  responseTime?: string;
};

export type TSupportEmail = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export const SupportsApi = {
  getContact: () =>
    api.get<{ data: TSupportContactDetails }>('/support/contacts'),
  updateContact: (payload: TSupportContactDetails) =>
    api.post<{ data: TSupportContactDetails }>('/support/contacts', payload),
  emailSupport: () =>
    api.get<{ data: TSupportEmail[] }>('/support/admin/emails'),
  adminSupportEmailDetail: (id: string) =>
    api.get<{ data: TSupportEmail }>(`/support/admin/emails/${id}`),
  replyEmail: (id: string, payload: { message: string; subject?: string }) =>
    api.post(`/support/admin/emails/${id}/reply`, payload),
};
