
export type Customer = {
  id: number;
  name: string;
  email: string;
  location: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  avatar: string | null; // backend theke image thakle show korbe
};


export interface GetCustomersResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomerQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateCustomerPayload {
  name: string;
  email: string;
  location: string;
}