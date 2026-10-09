"use server";

import { apiFetch } from "@/lib/apiFetch"; 
import { ApiResponse, DeliverOrderResponse, HistoryApiResponse, InvoiceData, Order, OrderDetails,  OrderDetailsResponse, OrderHistoryEntry, OrdersStats, RawOrder, ShipOrderResponse, ShippingLabelData } from "@/types/sellerDashboard/Orders";
import { revalidatePath } from "next/cache";

/* ─── Raw API shapes ─────────────────────────────────────── */

/* ─── Status mapping ─────────────────────────────────────── */
function mapStatus(apiStatus: string): Order["status"] {
  const map: Record<string, Order["status"]> = {
    paid: "Pending Shipment ",
    pending: "Pending",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    refund_requested: "Refund Requested",
    dispute: "Dispute",
    processing: "Processing",
    delivery_delay: "Delivery Delay",
  };
  return map[apiStatus.toLowerCase()] ?? "Pending";
}

/* ─── Transform ──────────────────────────────────────────── */
function transformOrder(raw: RawOrder, index: number): Order {
  const firstItem = raw.items?.[0];
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: raw.currency ?? "USD",
    maximumFractionDigits: 0,
  }).format(Number(raw.totalAmount));

  const formattedDate = new Date(raw.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return {
    id: index + 1,
    uuid: raw.id,  
  orderNumber: raw.orderNumber,
    customer: {
      name: raw.buyer?.fullName ?? "Unknown",
      email: raw.buyer?.email ?? "",
      avatar: raw.buyer?.avatarUrl?.startsWith("/placeholders")
        ? null
        : (raw.buyer?.avatarUrl ?? null),
    },
    product: firstItem?.productTitle ?? "—",
    date: formattedDate,
    amount: formattedAmount,
    status: mapStatus(raw.status),
  };
}

/* ─── Exported server action ─────────────────────────────── */
export async function getAllOrders(
  page: number = 1,
  limit: number = 10,
  status: string = ""
): Promise<{ orders: Order[]; total: number; totalPages: number }> {
  try {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) query.set("status", status);

    const data = await apiFetch<ApiResponse>(
      `/orders/seller?${query.toString()}`,
      { method: "GET" }
    );

    return {
      orders: (data?.data ?? []).map(transformOrder),
      total: data?.meta?.totalData ?? 0,
      totalPages: data?.meta?.totalPages ?? 1,
    };
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return { orders: [], total: 0, totalPages: 1 };
  }
}


export async function getOrderDetails(id: string): Promise<OrderDetails | null> {

  try {
    const data = await apiFetch<OrderDetailsResponse>(
      `/orders/seller/${id}`,
      { method: "GET"}
    )

    return data?.data?? [];
    
  }catch (error) {
    console.error("Failed to fetch order details:", error);
    return null;
  }

}


/* ─── Get Order History ──────────────────────────────────── */
export async function getOrderHistory(
  orderId: string
): Promise<OrderHistoryEntry[]> {
  try {
    const data = await apiFetch<HistoryApiResponse>(
      `/orders/seller/${orderId}/history`,
      { method: "GET" }
    );
    return data?.data ?? [];
  } catch (error) {
    console.error("Failed to fetch order history:", error);
    return [];
  }
}

/* ─── Get Order Stats ──────────────────────────────────── */
export const getOrderStats = async (): Promise<OrdersStats> => {
  try {
    // Note: Updated path to match the seller-dashboard structure
    const data = await apiFetch<{ success: boolean; data: OrdersStats }>(
      "/seller-dashboard/orders/summary?range=30", 
      { method: "GET" }
    );

    if (!data.success || !data.data) {
       throw new Error("Failed to retrieve valid order data");
    }
    
    return data.data;
  } catch (error) {
    console.error("Error fetching order stats:", error);
    // Returning a default object so the UI doesn't crash
    return {
      totalOrders: 0,
      totalRevenue: "0",
      avgOrderValue: "0",
      revenueGrowth: "0%",
      ordersGrowth: "0%"
    };
  }
};


/* ─── Get Invoice ────────────────────────────────────────── */
export async function getOrderInvoice(orderId: string) {
  const data = await apiFetch<{ success: boolean; data: InvoiceData }>(
    `/orders/seller/${orderId}/invoice`,
    { method: "GET" }
  );
  return data.data;
}

/* ─── Get Shipping Label ─────────────────────────────────── */
export async function getShippingLabel(orderId: string) {
  const data = await apiFetch<{ success: boolean; data: ShippingLabelData }>(
    `/orders/seller/${orderId}/shipping-label`,
    { method: "GET" }
  );
  return data.data;
}

/* ───  Shipping  ─────────────────────────────────── */

export async function shipOrder(orderId: string) {
  if (!orderId) throw new Error("orderId is required");
  try {
    const data = await apiFetch<ShipOrderResponse>(
      `/orders/seller/${orderId}/ship`,
      {
        method: "PATCH",
        body: {           
          carrier: "Standard Shipping",
          weight: 50,
        },
      }
    );
    revalidatePath("/seller-dashboard/orders");
    return data;
  } catch (error) {
    console.error("Failed to ship order:", error);
    throw error;
  }
}

/* ─── Mark Order as Delivered ────────────────────────────────── */
export async function deliverOrder(orderId: string) {
  try {
    const data = await apiFetch<DeliverOrderResponse>(
      `/orders/seller/${orderId}/deliver`,
      { 
        method: "PATCH",
        // JODI error dey (JSON Parse error), tahole empty body add korun:
        // body: JSON.stringify({}), 
      }
    );
    revalidatePath("/seller-dashboard/orders");
    return data;
  } catch (error) {
    console.error("Failed to deliver order:", error);
    throw error;
  }
}

export async function cancelOrder(orderId: string) {
  try {
    const data = await apiFetch<{ success: boolean; message?: string }>(`/orders/seller/${orderId}/cancel`, {
      method: "PATCH",
    });
    revalidatePath("/seller-dashboard/orders");
    return data;
  } catch (error) {
    console.error("Failed to cancel order:", error);
    throw error;
  }
}