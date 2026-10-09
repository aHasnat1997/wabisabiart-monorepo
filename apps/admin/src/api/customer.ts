import { api } from './axios.js';

export interface ICustomer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  totalOrders: number;
  totalSpent: string;
  location: string;
  isActive: boolean;
  lastOrderDate?: string | null;
  createdAt: string;
}

export interface CustomerListResponse {
  data: ICustomer[];
  total: number;
}

export const customersApi = {
  getList: (params?: {
    _start?: number;
    _end?: number;
    _sort?: string;
    _order?: string;
  }) => api.get<CustomerListResponse>('/customers', { params }),
  getOne: (id: string) => api.get<{ data: ICustomer }>(`/customers/${id}`),
};
