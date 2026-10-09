import { apiFetch } from "@/lib/apiFetch";


export async function getPastDueOrders(page: number = 1, limit: number = 20, range: number = 30) {
  try {
    // This matches your Postman path exactly
    const response = await apiFetch<{success: boolean; data:any}>(
      `/seller-dashboard/orders/past-due?page=${page}&limit=${limit}&range=${range}`
    );
    
    if (response?.success) {
      return {
        orders: response.data.orders,
        total: response.data.pagination.total,
        totalAmount: response.data.totalPastDueAmount,
        totalPages: Math.ceil(response.data.pagination.total / limit),
      };
    }
    throw new Error("Failed to fetch");
  } catch (error) {
    console.error("Error fetching past due orders:", error);
    throw error;
  }
}