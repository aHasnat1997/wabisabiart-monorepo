"use server";

import { apiFetch } from "@/lib/apiFetch";
import { OrderDetailsResponse, OrdersResponse } from "@/types/order";

export async function getOrders(status?: string) {
  try {
    const url = status ? `/orders/my?status=${status}` : `/orders/my`;
    const res = await apiFetch<OrdersResponse>(url);
    return { data: res.data, meta: res.meta };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getOrderDetails(orderId: string) {
  try {
    const res = await apiFetch<OrderDetailsResponse>(`/orders/my/${orderId}`);
    return res?.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}